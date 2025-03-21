import React from 'react';
import { View } from 'react-native';
import StakingForm from '../components/StakingForm';
import { stakeTalanton, stakeDrachma, stakeObolos } from '../utils/web3';

const Staking = ({ signer }) => {
  const handleStake = async (token, amount) => {
    if (token === "Talanton") await stakeTalanton(signer, amount);
    else if (token === "Drachma") await stakeDrachma(signer, amount);
    else if (token === "Obolos") await stakeObolos(signer, amount);
  };

  return (
    <View style={{ flex: 1 }}>
      <StakingForm tokenName="Talanton" onStake={(amount) => handleStake("Talanton", amount)} />
      <StakingForm tokenName="Drachma" onStake={(amount) => handleStake("Drachma", amount)} />
      <StakingForm tokenName="Obolos" onStake={(amount) => handleStake("Obolos", amount)} />
    </View>
  );
};

export default Staking;
