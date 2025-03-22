import React from 'react';
import StakingForm from '../components/StakingForm';
import { stakeTalanton, stakeDrachma, stakeObolos } from '../utils/web3';

const Staking = ({ signer }) => {
  const handleStake = async (token, amount) => {
    if (token === "Talanton") await stakeTalanton(signer, amount);
    else if (token === "Drachma") await stakeDrachma(signer, amount);
    else if (token === "Obolos") await stakeObolos(signer, amount);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Staking</h2>
      <StakingForm tokenName="Talanton" onStake={(amount) => handleStake("Talanton", amount)} />
      <StakingForm tokenName="Drachma" onStake={(amount) => handleStake("Drachma", amount)} />
      <StakingForm tokenName="Obolos" onStake={(amount) => handleStake("Obolos", amount)} />
    </div>
  );
};

export default Staking;
