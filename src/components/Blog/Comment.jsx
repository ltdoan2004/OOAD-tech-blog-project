"use client";

import classNames from "classnames";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import styles from "./index.module.css";
import { formatDistance } from "date-fns";
import { useAuth } from '@/src/context/AuthContext';

const CommentItem = ({ text, time, userName = "Unknown" }) => {
  return (
    <div className="flex gap-x-4">
      <div
        className={classNames(
          "w-12 h-12 rounded-full flex items-center justify-center text-lg text-white font-semibold",
          styles.avatar
        )}
      >
        {userName.substring(0, 2).toUpperCase()}
      </div>
      <div>
        <p className="font-semibold mb-1 dark:text-white">{userName}</p>
        <p
          className="whitespace-pre-line text-sm leading-5 dark:text-white"
          dangerouslySetInnerHTML={{ __html: text }}
        />
        <p className="text-[#919eab] text-sm mt-1">
          {formatDistance(new Date(time), new Date(), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

const Comment = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Fetch comments when component mounts
  useEffect(() => {
    fetchComments();
  }, [postId]);

  useEffect(() => {
    console.log('Current user:', user); // Debug current user state
  }, [user]);

  const fetchComments = async () => {
    try {
      console.log('Fetching comments for postId:', postId); // Debug log
      const response = await fetch(`http://localhost:5001/api/comments/${postId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched comments:', data); // Debug log
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setComments([]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (inputValue.trim() === "") return;
    setLoading(true);

    try {
      const headers = {
        "Content-Type": "application/json",
      };

      // Add token if user is logged in and not posting anonymously
      if (!isAnonymous && user) {
        const token = localStorage.getItem("x-auth-token");
        if (!token) {
          throw new Error('No authentication token found');
        }
        headers["x-auth-token"] = token;
        console.log('Sending request with token:', token);
      }

      const response = await fetch("http://localhost:5001/api/comments", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          postId,
          content: inputValue,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to post comment');
      }

      const data = await response.json();
      console.log('Comment posted successfully:', data);
      
      setComments((prev) => [data, ...prev]);
      setInputValue("");
    } catch (error) {
      console.error("Error posting comment:", error);
      alert(error.message || "Error posting comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <div className="px-5 md:px-10 mt-8">
      <p className="text-2xl font-semibold inline-block pb-1 mb-4 dark:text-white text-black border-b-[3px] border-yellow-400 dark:border-yellow-600">
        Comments({comments.length})
      </p>

      <div className="flex gap-x-3">
        <div>
          <Image
            src="/svgs/login.svg"
            alt="Avatar"
            width={60}
            height={60}
            className="bg-[#ff484214] rounded-full border dark:border-yellow-500 border-purple-500"
          />
        </div>

        <form className="flex-1" onSubmit={handleSubmit}>
          <textarea
            placeholder="Enter your comment"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={classNames(
              "w-full rounded-md border border-[#919eab] focus:border-purple-600 dark:focus:border-yellow-600 dark:bg-[#24292e] dark:text-white",
              styles.textarea
            )}
            rows={5}
          />
          <div className="flex justify-between  items-center mt-2">
            {user && (
              <p className="text-sm text-gray-500 rounded-md border py-1 px-1 dark:text-yellow-600 text-purple-600">
                Commenting as: {user.name}
              </p>
            )}
            <label className="flex items-center text-sm rounded-md border py-1 px-1 dark:text-yellow-600 text-purple-600">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="mr-2 dark:bg-yellow-200 bg-purple-200 "
              />
              Post anonymously
            </label>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded text-sm cursor-pointer dark:bg-yellow-400 dark:text-black bg-purple-600 text-white disabled:opacity-50"
            >
              {loading ? "Posting..." : "Comment"}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-4 flex flex-col gap-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment._id}
            text={comment.content}
            time={comment.createdAt}
            userName={comment.userId?.name || comment.userName}
          />
        ))}
      </div>
    </div>
  );
};

export default Comment;

