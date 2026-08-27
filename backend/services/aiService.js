const axios = require('axios');
const Slot = require('../models/Slot');

async function bookSlotAtomically(slotId, userName) {
  return await Slot.findOneAndUpdate(
    { _id: slotId, isBooked: false },
    { $set: { isBooked: true, bookedBy: userName, bookedAt: new Date() } },
    { new: true }
  );
}

async function handleNaturalLanguageBooking(userPrompt, userName = 'Guest') {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured');

  const availableSlots = await Slot.find({ isBooked: false }).sort({ startTime: 1 });

  if (availableSlots.length === 0) {
    return { success: false, message: 'Sorry, there are no open slots available.' };
  }

  const formattedSlots = availableSlots.map(s => ({
    slotId: s._id.toString(),
    start: s.startTime.toISOString(),
    displayTime: s.startTime.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }));

  const systemMessage = `You are a helpful booking assistant. Today is ${new Date().toISOString()}.
Available slots:
${JSON.stringify(formattedSlots, null, 2)}

Instructions:
1. When the user requests a time, choose the slotId that best matches from the available slots.
2. Call the "book_slot" function with the matching slotId.
3. If the user request is ambiguous, lacks matching slots, or cannot be resolved, respond directly in plain text with a clarification or explanation. Never invent a slotId not in the provided list.`;

  const tools = [
    {
      type: 'function',
      function: {
        name: 'book_slot',
        description: 'Books an available appointment slot using its valid slotId',
        parameters: {
          type: 'object',
          properties: {
            slotId: { type: 'string', description: 'The exact ID of the slot to book' }
          },
          required: ['slotId']
        }
      }
    }
  ];

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: process.env.AI_MODEL || 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userPrompt }
      ],
      tools: tools,
      tool_choice: 'auto'
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const choice = response.data.choices[0];
  const toolCalls = choice.message.tool_calls;

  if (toolCalls && toolCalls.length > 0) {
    const call = toolCalls[0];
    if (call.function.name === 'book_slot') {
      const args = JSON.parse(call.function.arguments);
      const booked = await bookSlotAtomically(args.slotId, userName);

      if (!booked) {
        return {
          success: false,
          message: 'That slot was just booked by someone else. Please pick another time.'
        };
      }

      return {
        success: true,
        message: `Successfully booked your appointment for ${booked.startTime.toLocaleString()}.`,
        slot: booked
      };
    }
  }

  return {
    success: false,
    message: choice.message.content || 'Could not understand your booking request.'
  };
}

module.exports = { handleNaturalLanguageBooking, bookSlotAtomically };  