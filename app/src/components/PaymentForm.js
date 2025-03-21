import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

const PaymentForm = ({ tokenName, onPay }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <View style={{ padding: 10 }}>
      <Text>Send {tokenName}</Text>
      <TextInput
        value={recipient}
        onChangeText={setRecipient}
        placeholder="Recipient Address"
        style={{ borderWidth: 1, marginVertical: 5 }}
      />
      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="Amount"
        keyboardType="numeric"
        style={{ borderWidth: 1, marginVertical: 5 }}
      />
      <Button title="Send" onPress={() => onPay(recipient, amount)} />
    </View>
  );
};

export default PaymentForm;
