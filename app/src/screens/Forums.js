import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import ForumThread from '../components/ForumThread';
import { getForumThreads, postToForum } from '../utils/ipfs';

const Forums = ({ signer }) => {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    const fetchThreads = async () => {
      const threadData = await getForumThreads();
      setThreads(threadData);
    };
    fetchThreads();
  }, []);

  const handleReply = async () => {
    // Placeholder for reply functionality
    const newThread = { title: "New Reply", content: "Reply content" };
    await postToForum(newThread);
    setThreads([...threads, newThread]);
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={threads}
        renderItem={({ item }) => (
          <ForumThread title={item.title} content={item.content} onReply={handleReply} />
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

export default Forums;
