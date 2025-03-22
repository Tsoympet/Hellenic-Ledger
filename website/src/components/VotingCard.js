import React from 'react';

const VotingCard = ({ title, description, id, role, onVote }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '5px' }}>
      <h3>{title}</h3>
      <p>{description}</p>
      <button onClick={() => onVote(id, role, true)}>Vote Yes</button>
      <button onClick={() => onVote(id, role, false)}>Vote No</button>
    </div>
  );
};

export default VotingCard;
