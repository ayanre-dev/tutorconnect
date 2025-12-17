import React, { useState, useEffect, useRef } from 'react';

const Chat = ({ socket, roomId, username }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on('chat-message', handleMessage);

    return () => {
      socket.off('chat-message', handleMessage);
    };
  }, [socket]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socket) {
      const msgData = {
        room: roomId,
        message: message,
        username: username || 'Anonymous',
        from: socket.id,
        isLocal: true // Helper to style local messages differently
      };

      // Emit to others
      socket.emit('chat-message', msgData);

      // Add to local list immediately
      setMessages((prev) => [...prev, msgData]);
      setMessage('');
    }
  };

  return (
    <div className="chat-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderLeft: '1px solid #ccc', padding: '10px' }}>
      <h3>Chat</h3>
      <div className="messages" style={{ flex: 1, overflowY: 'auto', marginBottom: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{
            textAlign: msg.isLocal ? 'right' : 'left',
            margin: '5px 0',
            backgroundColor: msg.isLocal ? '#444' : '#333',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '10px'
          }}>
            <strong>{msg.username}: </strong>
            <span>{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
        <button type="submit" style={{ marginLeft: '5px', padding: '8px 12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Send</button>
      </form>
    </div >
  );
};

export default Chat;
