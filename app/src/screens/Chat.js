import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import ChatWindow from '../components/ChatWindow';

const Chat = ({ signer }) => {
  const [recipient, setRecipient] = useState('');

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        value={recipient}
        onChangeText={setRecipient}
        placeholder="Recipient Address"
        style={{ borderWidth: 1, margin: 10 }}
      />
      {recipient && <ChatWindow signer={signer} recipient={recipient} />}
    </View>
  );
};

export default Chat;
