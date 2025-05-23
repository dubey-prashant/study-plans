import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { getComments, addComment } from '../../services/comment.service';

const CommentSection = ({
  planId,
  onApplySuggestion,
  isApplyingSuggestion,
  validationCompleted,
}) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSuggestion, setIsSuggestion] = useState(false);
  const [processingCommentId, setProcessingCommentId] = useState(null);

  useEffect(() => {
    const fetchedComments = getComments(planId);
    setComments(fetchedComments);
  }, [planId, validationCompleted]);

  const saveComments = (updatedComments) => {
    localStorage.setItem(`comments_${planId}`, JSON.stringify(updatedComments));
    setComments(updatedComments);
  };

  // Helper function to check if a string contains HTML
  const containsHTML = (str) => {
    return /<\/?[a-z][\s\S]*>/i.test(str);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const comment = {
      text: newComment,
      author: 'You',
      createdAt: new Date().toISOString(),
      isSuggestion,
      isHTML: containsHTML(newComment),
    };

    // Use the addComment service
    const newCommentWithId = await addComment(planId, comment);

    // Update local state
    setComments((prevComments) => [...prevComments, newCommentWithId]);
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

  // Render comment text as HTML or plain text
  const renderCommentText = (comment) => {
    // For AI suggestions or any comment marked as HTML
    if (comment.author === 'AI Assistant' || comment.isHTML) {
      return (
        <div
          className='comment-content'
          dangerouslySetInnerHTML={{ __html: comment.text }}
        />
      );
    }

    // For regular text comments
    return <div className='comment-content'>{comment.text}</div>;
  };

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
                  <div className='text-gray-800 w-full comment-wrapper'>
                    {renderCommentText(comment)}
                  </div>
                </div>
                <div className='mt-4 flex justify-between items-center text-xs text-gray-500'>
                  <div>
                    <span className='font-medium'>{comment.author}</span> ·{' '}
                    {new Date(comment.createdAt).toLocaleString()}
                  </div>
                  <div className='flex items-center'>
                    {comment.isApplied ? (
                      <span className='text-green-600 font-medium'>
                        Applied to plan ✓
                      </span>
                    ) : (
                      comment.isSuggestion && (
                        <Button
                          onClick={() => handleApplySuggestion(comment.id)}
                          className='ml-4 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded transition-colors duration-200 flex items-center'
                          disabled={isApplyingSuggestion}
                        >
                          {isCommentProcessing(comment.id) ? (
                            <>
                              <svg
                                className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                                xmlns='http://www.w3.org/2000/svg'
                                fill='none'
                                viewBox='0 0 24 24'
                              >
                                <circle
                                  className='opacity-25'
                                  cx='12'
                                  cy='12'
                                  r='10'
                                  stroke='currentColor'
                                  strokeWidth='4'
                                ></circle>
                                <path
                                  className='opacity-75'
                                  fill='currentColor'
                                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                ></path>
                              </svg>
                              Applying...
                            </>
                          ) : (
                            'Apply Suggestion'
                          )}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style jsx>{`
        .comment-wrapper ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.75rem 0;
        }
        .comment-wrapper ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 0.75rem 0;
        }
        .comment-wrapper li {
          margin-bottom: 0.5rem;
        }
        .comment-wrapper h3,
        .comment-wrapper h4 {
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
        }
        .comment-wrapper p {
          margin-bottom: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default CommentSection;
