import React, { useState } from 'react';

const StakingForm = ({ tokenName, onStake }) => {
  const [amount, setAmount] = useState('');

  return (
    <div style={{ padding: '10px' }}>
      <h3>Stake {tokenName}</h3>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        style={{ border: '1px solid #ccc', margin: '5px 0' }}
      />
      <button onClick={() => onStake(amount)}>Stake</button>
    </div>
  );
};

export default StakingForm;
