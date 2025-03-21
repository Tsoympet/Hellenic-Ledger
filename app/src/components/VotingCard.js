import React from 'react';
import { View, Text, Button } from 'react-native';

const VotingCard = ({ title, description, id, role, onVote }) => {
  return (
    <View style={{ padding: 10, borderWidth: 1, margin: 5 }}>
      <Text>{title}</Text>
      <Text>{description}</Text>
      <Button title="Vote Yes" onPress={() => onVote(id, role, true)} />
      <Button title="Vote No" onPress={() => onVote(id, role, false)} />
    </View>
  );
};

export default VotingCard;
