import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import VotingCard from '../components/VotingCard';
import { getMotions, voteForMotion, voteForRole } from '../utils/web3';

const Voting = ({ signer }) => {
  const [motions, setMotions] = useState([]);

  useEffect(() => {
    const fetchMotions = async () => {
      if (signer) {
        const motionData = await getMotions(signer);
        setMotions(motionData);
      }
    };
    fetchMotions();
  }, [signer]);

  const handleVote = async (id, role, inFavor) => {
    if (role) {
      await voteForRole(signer, role, id);
    } else {
      await voteForMotion(signer, id, inFavor);
    }
    // Refresh motions
    const updatedMotions = await getMotions(signer);
    setMotions(updatedMotions);
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={motions}
        renderItem={({ item }) => (
          <VotingCard
            title={item.title}
            description={item.description}
            id={item.id}
            role={item.role}
            onVote={handleVote}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

export default Voting;
