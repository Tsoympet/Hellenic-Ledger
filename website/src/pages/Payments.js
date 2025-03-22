import React from 'react';
import PaymentForm from '../components/PaymentForm';
import { payTalanton, payDrachma, payObolos } from '../utils/web3';

const Payments = ({ signer }) => {
  const handlePay = async (token, recipient, amount) => {
    if (token === "Talanton") await payTalanton(signer, recipient, amount);
    else if (token === "Drachma") await payDrachma(signer, recipient, amount);
    else if (token === "Obolos") await payObolos(signer, recipient, amount);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Payments</h2>
      <PaymentForm tokenName="Talanton" onPay={(recipient, amount) => handlePay("Talanton", recipient, amount)} />
      <PaymentForm tokenName="Drachma" onPay={(recipient, amount) => handlePay("Drachma", recipient, amount)} />
      <PaymentForm tokenName="Obolos" onPay={(recipient, amount) => handlePay("Obolos", recipient, amount)} />
    </div>
  );
};

export default Payments;
