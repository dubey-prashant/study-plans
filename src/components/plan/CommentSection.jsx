import React, { useState, useEffect } from 'react';
import Button from '../common/Button';

const CommentSection = ({
  planId,
  onApplySuggestion,
  isApplyingSuggestion,
}) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSuggestion, setIsSuggestion] = useState(false);
  const [processingCommentId, setProcessingCommentId] = useState(null);

  // Load comments (this would typically come from a database or API)
  useEffect(() => {
    const fetchedComments = localStorage.getItem(`comments_${planId}`) || '[]';
    setComments(JSON.parse(fetchedComments));
  }, [planId]);

  const saveComments = (updatedComments) => {
    localStorage.setItem(`comments_${planId}`, JSON.stringify(updatedComments));
    setComments(updatedComments);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      text: newComment,
      createdAt: new Date().toISOString(),
      isSuggestion,
      isApplied: false,
    };

    const updatedComments = [...comments, comment];
    saveComments(updatedComments);
    setNewComment('');
    setIsSuggestion(false);
  };

  const handleApplySuggestion = async (commentId) => {
    const comment = comments.find((c) => c.id === commentId);
    if (!comment || !comment.isSuggestion) return;

    // Set processing state for this specific comment
    setProcessingCommentId(commentId);

    try {
      // Apply the suggestion
      await onApplySuggestion(comment.text);

      // Only mark as applied after successful completion
      const updatedComments = comments.map((c) =>
        c.id === commentId ? { ...c, isApplied: true } : c
      );
      saveComments(updatedComments);
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
      // Optionally show an error message
    } finally {
      setProcessingCommentId(null);
    }
  };

  // Determine if a specific comment is being processed
  const isCommentProcessing = (commentId) => {
    return isApplyingSuggestion && processingCommentId === commentId;
  };

  // Sort comments by date - newest first
  const sortedComments = [...comments].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      {/* Add new comment */}
      <div className='mb-6'>
        <div className='mb-3'>
          <label
            htmlFor='comment'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Add a comment
          </label>
          <textarea
            id='comment'
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows='3'
            placeholder='Share your thoughts or suggestions...'
            className='w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200'
          />
        </div>
        <div className='flex items-center mb-2'>
          <input
            type='checkbox'
            id='suggestion'
            checked={isSuggestion}
            onChange={(e) => setIsSuggestion(e.target.checked)}
            className='mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
          />
          <label htmlFor='suggestion' className='text-sm text-gray-700'>
            This is a suggestion to improve the plan
          </label>
        </div>
        <Button
          onClick={handleAddComment}
          className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-sm transition-colors duration-200'
          disabled={!newComment.trim() || isApplyingSuggestion}
        >
          Post Comment
        </Button>
      </div>

      {/* Comments list */}
      <div className='space-y-4'>
        <h3 className='text-lg font-medium text-gray-800'>
          {comments.length} Comments
        </h3>

        {comments.length === 0 ? (
          <p className='text-gray-500 italic'>
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className='space-y-4'>
            {sortedComments.map((comment) => (
              <div
                key={comment.id}
                className={`p-4 rounded-lg border ${
                  comment.isSuggestion
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className='flex justify-between items-start'>
                  <div className='text-gray-800'>{comment.text}</div>
                  {comment.isSuggestion && !comment.isApplied && (
                    <Button
                      onClick={() => handleApplySuggestion(comment.id)}
                      className='ml-4 bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded transition-colors duration-200'
                      disabled={isApplyingSuggestion}
                    >
                      {isCommentProcessing(comment.id)
                        ? 'Applying...'
                        : 'Apply Suggestion'}
                    </Button>
                  )}
                </div>
                <div className='mt-2 flex justify-between text-xs text-gray-500'>
                  <span>{new Date(comment.createdAt).toLocaleString()}</span>
                  {comment.isApplied && (
                    <span className='text-green-600 font-medium'>
                      Applied to plan
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
