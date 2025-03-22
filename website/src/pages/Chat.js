import React, { useState } from 'react';
import ChatWindow from '../components/ChatWindow';

const Chat = ({ signer }) => {
  const [recipient, setRecipient] = useState('');

  return (
    <div style={{ padding: '20px' }}>
      <h2>Chat</h2>
      <input
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder="Recipient Address"
        style={{ border: '1px solid #ccc', margin: '10px 0', width: '100%' }}
      />
      {recipient && <ChatWindow signer={signer} recipient={recipient} />}
    </div>
  );
};

export default Chat;
