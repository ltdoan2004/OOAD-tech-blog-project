"use client";

import classNames from "classnames";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import styles from "./index.module.css";
import { formatDistance } from "date-fns";
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FaTrash } from 'react-icons/fa';

const CommentItem = ({ text, time, userName, onDelete, canDelete, isAdminComment }) => {
  return (
    <div className={classNames(
      "flex gap-x-4 p-4 rounded-lg shadow-sm",
      isAdminComment 
        ? "bg-purple-50 dark:bg-gray-700 border-l-4 border-purple-500 dark:border-yellow-500" 
        : "bg-white dark:bg-gray-800"
    )}>
      <div className="flex-1 flex justify-between">
        <div className="flex gap-x-4">
          <div className={classNames(
            "w-12 h-12 rounded-full flex items-center justify-center text-lg text-white font-semibold",
            isAdminComment ? "bg-purple-600 dark:bg-yellow-500" : styles.avatar
          )}>
            {userName ? userName[0].toUpperCase() : 'A'}
          </div>
          <div>
            <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              {userName || 'Anonymous'}
              {isAdminComment && (
                <span className="text-xs px-2 py-0.5 rounded bg-purple-100 dark:bg-yellow-100 text-purple-600 dark:text-yellow-800">
                  Admin
                </span>
              )}
            </p>
            <p className="whitespace-pre-line text-sm leading-5 text-gray-800 dark:text-gray-200">
              {text}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {formatDistance(new Date(time), new Date(), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        {canDelete && (
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2"
            title="Delete comment"
          >
            <FaTrash size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

const Comment = ({ postId }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(!user);

  useEffect(() => {
    setIsAnonymous(!user);
  }, [user]);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/comments/${postId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('x-auth-token');
      const response = await fetch(`http://localhost:5001/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      setComments(prev => prev.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!inputValue.trim()) return;
    setLoading(true);

    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      if (!isAnonymous && user) {
        const token = localStorage.getItem('x-auth-token');
        if (token) {
          headers['x-auth-token'] = token;
        }
      }

      const response = await fetch('http://localhost:5001/api/comments', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          postId,
          content: inputValue,
          anonymous: isAnonymous
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const newComment = await response.json();
      setComments(prev => [newComment, ...prev]);
      setInputValue('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
      <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
        Comments ({comments.length})
      </h3>

      <div className="mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={user ? "Write a comment..." : "Write a comment (anonymous)"}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-800 
                     text-gray-900 dark:text-gray-100
                     placeholder-gray-500 dark:placeholder-gray-400"
            rows={4}
          />
          <div className="flex items-center justify-between">
            {user && (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Commenting as: {user.name}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 dark:bg-yellow-500 
                       text-white dark:text-gray-900 
                       rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment._id}
            text={comment.content}
            time={comment.createdAt}
            userName={comment.userName}
            canDelete={user?.isAdmin}
            onDelete={() => handleDeleteComment(comment._id)}
            isAdminComment={comment.isAdminComment}
          />
        ))}
      </div>
    </div>
  );
};

export default Comment;