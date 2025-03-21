import React from 'react';
import { View, Text, Button } from 'react-native';

const ForumThread = ({ title, content, onReply }) => {
  return (
    <View style={{ padding: 10, borderWidth: 1, margin: 5 }}>
      <Text style={{ fontWeight: 'bold' }}>{title}</Text>
      <Text>{content}</Text>
      <Button title="Reply" onPress={onReply} />
    </View>
  );
};

export default ForumThread;
