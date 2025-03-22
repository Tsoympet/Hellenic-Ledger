import React, { useState, useEffect } from 'react';
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
    const updatedMotions = await getMotions(signer);
    setMotions(updatedMotions);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Voting</h2>
      {motions.map((motion) => (
        <VotingCard
          key={motion.id}
          title={motion.title}
          description={motion.description}
          id={motion.id}
          role={motion.role}
          onVote={handleVote}
        />
      ))}
    </div>
  );
};

export default Voting;
