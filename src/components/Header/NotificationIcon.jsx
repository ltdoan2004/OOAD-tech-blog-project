import React, { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa"; //Bell icon from React's lib
import Tippy from "@tippyjs/react"; //tooltip (hộp thoại)
import Image from "next/image";
import { formatDistance, compareDesc, parseISO } from "date-fns";
//date-fns : thuw viện xử lý dạng tháng-ngày

// Hàm sắp xếp các bài viết (nhận vào dạng blogs => trả ra mangr được sxep theo DESC)
const sortBlogs = (blogs) => {
  return blogs
    .slice()
    .sort((a, b) =>
      compareDesc(parseISO(a.updatedAt), parseISO(b.updatedAt))
    );
};

// Component cho thông báo
const NotificationItem = ({ title, url, updatedAt, avatarUrl }) => {
  // NotificationItem : hiển thị ndung của noti
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="p-3 hover:bg-[#0000000d] cursor-pointer"
    >
      <div className="flex gap-x-3 items-center">
        <Image
          src={avatarUrl} // Sử dụng avatarUrl từ props
          alt="Avatar"
          width={48}
          height={48}
          className="full"
        />
        <div>
          <p className="text-sm line-clamp-2">{title}</p>
          <p className="text-xs mt-1.5 text-[#606060] dark:text-[#aaa]">
            {formatDistance(parseISO(updatedAt), new Date(), { //date-fns: từ tgian bắt đầu đến htai
              addSuffix: true,
            })}
          </p>
        </div>
        <p className="ml-auto text-xl text-[#065fd4]">&#x2022;</p>
      </div>
    </a>
  );
};

// Component 
const NotificationIcon = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Data với updatedAt
    const blogs = [
      { title: "AI's Trust Problems", url: "http://localhost:3000/blogs/AIproblems", updatedAt: "2024-05-03", avatarUrl: "/blogs/AIproblem1.jpg" },
      { title: "Role of Nvidia Chips", url: "http://localhost:3000/blogs/NVIDIA-blog", updatedAt: "2024-02-29", avatarUrl: "/blogs/nvidia-2.jpg"},
      { title: "AI's 2024 Trends", url: "http://localhost:3000/blogs/AI-trends", updatedAt: "2025-01-01", avatarUrl: "/blogs/ai-trends-7.png" },
      { title: "LG’s 2025 gaming monitor", url: "http://localhost:3000/blogs/lg-2025-gaming-monitor", updatedAt: "2024-12-30", avatarUrl: "/blogs/lg-2025-gaming(edited).jpg" },
      { title: "Apple promised next-gen CarPlay in 2024", url: "http://localhost:3000/blogs/apple-car", updatedAt: "2024-12-31", avatarUrl: "/blogs/apple-car(edited-ver2).jpg" },
      { title: "Automating Repetitive Tasks", url: "http://localhost:3000/blogs/automating-repetitive-tasks-productivity-hacks-for-developers", updatedAt: "2023-01-01", avatarUrl: "/blogs/emile-perron-xrVDYZRGdw4-unsplash.jpg" },
      { title: "Building Progressive Web Apps", url: "http://localhost:3000/blogs/building-progressive-web-apps-bridging-the-gap-between-web-and-mobile", updatedAt: "2023-01-04", avatarUrl: "/blogs/adding-seo-1.jpg" },
      { title: "Best Buy ASUS Monitors 2024", url: "http://localhost:3000/blogs/ASUS-monitor", updatedAt: "2023-10-29", avatarUrl: "/blogs/asus-1.jpg" },
    ];

    // Sắp xếp bài viết và cập nhật state
    const sortedBlogs = sortBlogs(blogs);
    setNotifications(sortedBlogs);
  }, []);

  return (
    <Tippy
      content={
        <div className="bg-white shadow-2xl rounded-md w-[350px] dark:bg-[#282828] dark:text-white">
          <p className="border-b border-[#0000001a] p-3 font-semibold">
            Notifications
          </p>
          <div className="flex flex-col gap-y-3 max-h-[420px] overflow-y-auto">
            {notifications.map((notification, index) => (
              <NotificationItem
                key={index}
                title={notification.title}
                url={notification.url}
                updatedAt={notification.updatedAt}
                avatarUrl={notification.avatarUrl} // Thêm avatarUrl
              />
            ))}
          </div>
        </div>
      }
      trigger="click" // nhấp chuột
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