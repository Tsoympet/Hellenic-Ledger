import React from 'react';

const ForumThread = ({ title, content, onReply }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '5px' }}>
      <h3>{title}</h3>
      <p>{content}</p>
      <button onClick={onReply}>Reply</button>
    </div>
  );
};

export default ForumThread;
