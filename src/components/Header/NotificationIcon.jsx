import React from "react";

import { FaBell } from "react-icons/fa";
import Tippy from "@tippyjs/react";
import Image from "next/image";
import { formatDistance, subDays } from "date-fns";

const NotificationItem = () => {
  return (
    <div className="p-3 hover:bg-[#0000000d] cursor-pointer">
      <div className="flex gap-x-3 items-center">
        <Image
          src="/profile-img.png"
          alt="Avatar"
          width={48}
          height={48}
          className="rounded-full"
        />

        <div>
          <p className="text-sm line-clamp-2">Dành cho bạn: RELAB</p>

          <p className="text-xs mt-1.5 text-[#606060] dark:text-[#aaa]">
            {formatDistance(subDays(new Date(), 3), new Date(), {
              addSuffix: true,
            })}
          </p>
        </div>

        <p className="ml-auto text-xl text-[#065fd4]">&#x2022;</p>
      </div>
    </div>
  );
};

const NotificationIcon = () => {
  return (
    <Tippy
      content={
        <div className="bg-white shadow-2xl rounded-md w-[350px] dark:bg-[#282828] dark:text-white">
          <p className="border-b border-[#0000001a] p-3 font-semibold">
            Notification
          </p>

          <div className="flex flex-col gap-y-3 max-h-[420px] overflow-y-auto">
            <NotificationItem />
            <NotificationItem />
            <NotificationItem />
            <NotificationItem />
            <NotificationItem />
            <NotificationItem />
            <NotificationItem />
          </div>
        </div>
      }
      trigger="click"
      interactive
      placement="bottom-end"
    >
      <div>
        <FaBell className="text-2xl mr-4 cursor-pointer text-[#333] dark:text-white" />
      </div>
    </Tippy>
  );
};

export default NotificationIcon;
