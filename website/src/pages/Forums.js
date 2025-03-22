import React, { useState, useEffect } from 'react';
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
    const newThread = { title: "New Reply", content: "Reply content" };
    await postToForum(newThread);
    setThreads([...threads, newThread]);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Forums</h2>
      {threads.map((thread, index) => (
        <ForumThread
          key={index}
          title={thread.title}
          content={thread.content}
          onReply={handleReply}
        />
      ))}
    </div>
  );
};

export default Forums;
