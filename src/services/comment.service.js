import { v4 as uuidv4 } from 'uuid';

export const getComments = (planId) => {
  const comments = localStorage.getItem(`comments_${planId}`) || '[]';
  return JSON.parse(comments);
};

export const addComment = async (planId, comment) => {
  // Ensure the comment has an ID
  const commentWithId = {
    ...comment,
    id: uuidv4(),
    isApplied: false,
  };

  // Get existing comments
  const existingComments = getComments(planId);

  // Add new comment
  const updatedComments = [...existingComments, commentWithId];

  // Save to localStorage
  localStorage.setItem(`comments_${planId}`, JSON.stringify(updatedComments));

  return commentWithId;
};
