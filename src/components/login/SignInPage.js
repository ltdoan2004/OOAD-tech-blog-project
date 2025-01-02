"use client";
import React from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import UserAuthForm from "./UserAuthForm";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DotLottiePlayer } from "@dotlottie/react-player";
import "@dotlottie/react-player/dist/index.css";
// Utility function for combining class names
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Button component and variants
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// Transition component
function Transition({ children, className }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.4,
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function SignInPage() {
  return (
    <Transition className="relative h-screen flex flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-4 top-4 hidden md:right-8 md:top-8"
        )}
      >
        Login
      </Link>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-blue_super_dark bg-white dark:bg-dark dark:bg-secondary" />
        <div className="relative z-20 flex items-center text-lg font-medium">
        <DotLottiePlayer
          src="/animation.json"
          autoplay
          loop
          style={{ width: "80%", height: "80%" }}
        />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg text-yellow-500 dark:text-purple-500">
              &ldquo;Stay Ahead with Stories, Updates, and Expert Guides from the Tech World &rdquo;
            </p>
            <p className="text-sm text-white_blue text-yellow-500 dark:text-purple-500">Contact: 0944674383 </p>
            <footer className="text-sm text-yellow-500 dark:text-purple-500">Truong Doanh Nam</footer>
          </blockquote>
        </div>
      </div>
      <div className="flex h-full items-center p-4 lg:p-8 bg-dark dark:bg-light lg:rounded-lg">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight  dark:text-yellow-500 text-purple-500">LOGIN</h1>
            <p className="text-sm text-muted-foreground dark:text-yellow-500 text-purple-500">
              Enter your username and password to continue
            </p>
          </div>
          <UserAuthForm />
          <p className="px-8 text-center text-sm text-muted-foreground dark:text-yellow-500 text-purple-500 underline">
            Do not have an account?
            <br />
            Please contact to the admin.
            <br />
            Email: doanh25032004@gmail.com
          </p>
        </div>
      </div>
    </Transition>
  );
}

export default SignInPage;
