import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

const StakingForm = ({ tokenName, onStake }) => {
  const [amount, setAmount] = useState('');

  return (
    <View style={{ padding: 10 }}>
      <Text>Stake {tokenName}</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="Amount"
        keyboardType="numeric"
        style={{ borderWidth: 1, marginVertical: 5 }}
      />
      <Button title="Stake" onPress={() => onStake(amount)} />
    </View>
  );
};

export default StakingForm;
