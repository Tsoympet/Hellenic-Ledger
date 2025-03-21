import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { sendMessage, receiveMessages } from '../utils/xmtp';

const ChatWindow = ({ signer, recipient }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      const received = await receiveMessages(signer, recipient);
      setMessages(received);
    };
    fetchMessages();
  }, [signer, recipient]);

  const handleSend = async () => {
    await sendMessage(signer, recipient, input);
    setMessages([...messages, { sender: signer.address, content: input }]);
    setInput('');
  };

  return (
    <View style={{ padding: 10, flex: 1 }}>
      <FlatList
        data={messages}
        renderItem={({ item }) => <Text>{item.sender}: {item.content}</Text>}
        keyExtractor={(item, index) => index.toString()}
      />
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Type a message"
        style={{ borderWidth: 1, marginVertical: 5 }}
      />
      <Button title="Send" onPress={handleSend} />
    </View>
  );
};

export default ChatWindow;
