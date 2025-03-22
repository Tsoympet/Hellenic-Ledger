import React, { useState, useEffect } from 'react';
import { sendMessage, receiveMessages } from '../utils/xmtp';

const ChatWindow = ({ signer, recipient }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      if (signer && recipient) {
        const received = await receiveMessages(signer, recipient);
        setMessages(received);
      }
    };
    fetchMessages();
  }, [signer, recipient]);

  const handleSend = async () => {
    await sendMessage(signer, recipient, input);
    setMessages([...messages, { sender: signer.address, content: input }]);
    setInput('');
  };

  return (
    <div style={{ padding: '10px', height: '400px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {messages.map((msg, index) => (
          <p key={index}>{msg.sender}: {msg.content}</p>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message"
        style={{ border: '1px solid #ccc', margin: '5px 0' }}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default ChatWindow;
