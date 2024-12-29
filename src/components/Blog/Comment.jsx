import classNames from "classnames";
import Image from "next/image";
import React from "react";

import styles from "./index.module.css";
import { formatDistance, subDays } from "date-fns";

const CommentItem = () => {
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
        <p className="font-semibold mb-1 dark:text-white">Nguyễn Văn A</p>
        <p
          className="whitespace-pre-line text-sm leading-5 dark:text-white"
          dangerouslySetInnerHTML={{ __html: "I like this" }}
        />

        <p className="text-[#919eab] text-sm mt-1">
          {formatDistance(subDays(new Date(), 3), new Date(), {
            addSuffix: true,
          })}
        </p>
      </div>
    </div>
  );
};

const Comment = () => {
  return (
   <div className="px-5 md:px-10 mt-8">
       <p className="text-2xl font-semibold inline-block pb-1 mb-4 dark:text-white text-black border-b-[3px] border-yellow-400 dark:border-yellow-600">
        Comment(6)
      </p>

      <div className="flex gap-x-3">
        <div>
          <Image
            src="/svgs/login.svg"
            alt="Avatar"
            width={60}
            height={60}
            className="bg-[#ff484214] rounded-full border border-[#df062d]"
          />
        </div>

        <form className="flex-1">
          <textarea
            placeholder="Enter your comment"
            className={classNames(
              "w-full rounded-md border border-[#919eab] focus:border-[#df062d] dark:bg-[#24292e] dark:text-white",
              styles.textarea
            )}
            rows={5}
          />

          <button className="ml-auto bg-[#df062d] block mt-2 text-white px-4 py-1.5 rounded text-sm cursor-pointer">
            Comment
          </button>
        </form>
      </div>

      <div className="mt-4 flex flex-col gap-y-4">
        <CommentItem />
        <CommentItem />
        <CommentItem />
        <CommentItem />
        <CommentItem />
        <CommentItem />
      </div>
    </div>
  );
};

export default Comment;
