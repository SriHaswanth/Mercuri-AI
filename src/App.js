import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [slots, setSlots] = useState([]);
  const [userName, setUserName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [agentResponse, setAgentResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchSlots = async () => {
    try {
      const res = await axios.get(`${API_BASE}/slots/available`);
      setSlots(res.data);
    } catch (err) {
      console.error('Error fetching slots:', err);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleManualBook = async (slotId) => {
    if (!userName.trim()) {
      alert('Please enter your name first.');
      return;
    }
    try {
      await axios.post(`${API_BASE}/bookings/manual`, { slotId, userName });
      fetchSlots();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to book slot.');
    }
  };

  const handleAgentSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setAgentResponse('');
    try {
      const res = await axios.post(`${API_BASE}/agent/book`, {
        prompt,
        userName: userName || 'Guest'
      });
      setAgentResponse(res.data.message);
      fetchSlots();
      setPrompt('');
    } catch (err) {
      setAgentResponse(err.response?.data?.error || 'Agent encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Appointment Booking</h1>
      <input
        type="text"
        placeholder="Enter your name (e.g. Alex)"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />

      <div className="grid">
        <div className="card">
          <h2>Available Slots ({slots.length})</h2>
          {slots.length === 0 ? (
            <p>No available slots.</p>
          ) : (
            slots.map((s) => (
              <div key={s._id} className="slot-item">
                <span>{new Date(s.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                <button onClick={() => handleManualBook(s._id)}>Book</button>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <h2>AI Booking Agent</h2>
          <form onSubmit={handleAgentSubmit}>
            <input
              type="text"
              placeholder="e.g. Book me something tomorrow afternoon"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Send Request'}
            </button>
          </form>

          {agentResponse && (
            <div className="chat-response">
              <strong>Agent:</strong> {agentResponse}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;