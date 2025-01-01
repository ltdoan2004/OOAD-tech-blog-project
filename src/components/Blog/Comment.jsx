"use client";

import classNames from "classnames";
import Image from "next/image";
import React, { useState } from "react";
import styles from "./index.module.css";
import { formatDistance } from "date-fns";

const CommentItem = ({ text, time }) => {
  return (
    <div className="flex gap-x-4">
      <div
        className={classNames(
          "w-12 h-12 rounded-full flex items-center justify-center text-lg text-white font-semibold",
          styles.avatar
        )}
      >
        NA
      </div>
      <div>
        <p className="font-semibold mb-1 dark:text-white">Hồ Thiên Trường</p>
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

const Comment = () => {
  const [comments, setComments] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault(); // Ngăn reload trang
    if (inputValue.trim() === "") return; 

    const newComment = {
      text: inputValue,
      time: new Date().toISOString(), // Lưu thời gian thực
    };

    setComments((prev) => [...prev, newComment]);
    setInputValue(""); 
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
        Comment({comments.length})
      </p>

      <div className="flex gap-x-3">
        <div>
          <Image
            src="/logo.webp"
            alt="Avatar"
            width={60}
            height={60}
            className="bg-[#ff484214] rounded-full border border"
          />
        </div>

        <form className="flex-1" onSubmit={handleSubmit}>
          <textarea
            placeholder="Enter your comment"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown} 
            className={classNames(
              "w-full rounded-md border border-[#919eab] focus:border-[#df062d] dark:bg-[#24292e] dark:text-white",
              styles.textarea
            )}
            rows={5}
          />
          <button
            type="submit"
            className="ml-auto block mt-2 px-4 py-1.5 rounded text-sm cursor-pointer bg-yellow-400 text-black dark:bg-yellow-600 dark:text-white"
          >
            Comment
          </button>
        </form>
      </div>

      <div className="mt-4 flex flex-col gap-y-4">
        {comments.map((comment, index) => (
          <CommentItem key={index} text={comment.text} time={comment.time} />
        ))}
      </div>
    </div>
  );
};

export default Comment;