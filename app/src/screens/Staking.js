import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import StakingForm from '../components/StakingForm';
import { stakeTalanton, stakeDrachma, stakeObolos, mineTalanton } from '../utils/web3';

const Staking = ({ signer }) => {
  const [staked, setStaked] = useState(false);

  const handleStake = async (token, amount) => {
    if (token === "Talanton") {
      await stakeTalanton(signer, amount);
      setStaked(true);
    } else if (token === "Drachma") {
      await stakeDrachma(signer, amount);
    } else if (token === "Obolos") {
      await stakeObolos(signer, amount);
    }
  };

  const handleMine = async () => {
    // Simplified: Real nonce should be computed off-chain
    const blockHash = await ethers.provider.getBlock("latest").then(b => b.parentHash);
    const target = ethers.MaxUint256.div(1000);
    const stakedBalance = await new ethers.Contract(talantonAddress, talantonABI, signer).stakedBalance(signer.address);
    let nonce = 0;
    let solution;
    do {
      solution = ethers.keccak256(ethers.solidityPacked(["address", "bytes32", "uint256", "uint256"], [signer.address, blockHash, nonce, stakedBalance]));
      nonce++;
    } while (ethers.toBigInt(solution) > target);
    await mineTalanton(signer, nonce - 1);
    console.log("Mined Talanton");
  };

  return (
    <View style={{ flex: 1 }}>
      <StakingForm tokenName="Talanton" onStake={(amount) => handleStake("Talanton", amount)} />
      {staked && <Button title="Mine Talanton" onPress={handleMine} />}
      <StakingForm tokenName="Drachma" onStake={(amount) => handleStake("Drachma", amount)} />
      <StakingForm tokenName="Obolos" onStake={(amount) => handleStake("Obolos", amount)} />
    </View>
  );
};

export default Staking;
