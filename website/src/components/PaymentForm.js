import React, { useState } from 'react';

const PaymentForm = ({ tokenName, onPay }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <div style={{ padding: '10px' }}>
      <h3>Send {tokenName}</h3>
      <input
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder="Recipient Address"
        style={{ border: '1px solid #ccc', margin: '5px 0', width: '100%' }}
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        style={{ border: '1px solid #ccc', margin: '5px 0' }}
      />
      <button onClick={() => onPay(recipient, amount)}>Send</button>
    </div>
  );
};

export default PaymentForm;
