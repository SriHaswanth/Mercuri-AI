[Readme.txt](https://github.com/user-attachments/files/31516335/Readme.txt)
# AI Appointment Booking Application

A full-stack MERN application with manual and natural language slot booking powered by an LLM agent via OpenRouter.

## ARCHITECTURE OVERVIEW

* Frontend: React SPA for manual slot discovery, one-click booking, and a natural-language agent chat interface.


* Backend: Node.js & Express REST API providing endpoints for slot querying, manual booking, and AI-driven booking orchestration.


* Database: MongoDB (via Mongoose) storing time slot records and booking states.


* AI Agent: OpenRouter integration using tool/function calling (book_slot) against real-time database availability.



## PROJECT STRUCTURE



## PREREQUISITES

* Node.js (v18 or higher)
* MongoDB Atlas connection string or local MongoDB instance (mongodb://127.0.0.1:27017/bookings_db)
* OpenRouter API Key

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas connection string or local MongoDB instance
- OpenRouter API Key

### Project Structure

bookings-app/
├── backend/
│   ├── models/
│   │   └── Slot.js
│   ├── routes/
│   │   ├── agent.js
│   │   ├── bookings.js
│   │   └── slots.js
│   ├── services/
│   │   └── aiService.js
│   ├── tests/
│   │   └── booking.test.js
│   ├── package.json
│   ├── seed.js
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.css
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.txt


## GETTING STARTED

1. Backend Setup:
cd backend
npm install
Create a .env file in backend/ with:
PORT=5000
MONGO_URI=your_mongodb_connection_string
OPENROUTER_API_KEY=your_openrouter_api_key
AI_MODEL=openai/gpt-4o-mini
Seed the database with slots:
npm run seed


Start the server:
npm start
(Runs on http://localhost:5000)
2. Frontend Setup:
Open a separate terminal window:
cd frontend
npm install
npm start
(Launches at http://localhost:3000)
3. Automated Testing:
cd backend
npm test

## DESIGN NOTE

1. Turning LLM Responses into Safe Database Actions:
Instead of parsing unstructured natural language with regex, the agent uses LLM Function Calling / Tool Use. When a valid booking intent is detected, the model invokes the defined book_slot tool with the exact slotId parameter. The backend receives this structured argument and performs the write operation directly against MongoDB.


2. Preventing Slot Hallucinations:

* Dynamic Context: Open slots are fetched directly from MongoDB at request time and passed into the LLM prompt context.


* Server-Side Validation: The backend validates the returned slotId using an atomic query (findOneAndUpdate with isBooked: false). If the model returns an invalid or non-existent ID, the database operation safely fails.



3. Handling Messy, Ambiguous, or Conflicting Requests:

* Ambiguity & No Matches: If the user input is vague or no matching open slot is found, system prompt instructions direct the model to respond in plain conversational text asking for clarification without invoking any tool.


* Race Conditions: Double-booking is prevented using MongoDB atomic updates at the document level. If two requests target the same slot concurrently, only the first request succeeds in updating the record; the second returns null and receives an HTTP 409 conflict.



4. Production Scaling Considerations:

* Distributed Locks: Implement Redis-based distributed locking (such as Redlock) to hold slots temporarily during pending booking steps.
* Conversation State: Store multi-turn conversational history in Redis or MongoDB to handle multi-step back-and-forth interactions.


* Idempotency: Implement idempotency keys and background message queues (BullMQ/RabbitMQ) to ensure webhook retries from platforms like SMS/WhatsApp do not create duplicate bookings.
