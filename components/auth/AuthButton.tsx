"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { LogIn, LogOut, User } from "lucide-react";

interface AuthButtonProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export function AuthButton({ variant = "primary", size = "md" }: AuthButtonProps) {
  const { data: session, status } = useSession();

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const buttonClass = variant === "primary" 
    ? "btn-primary" 
    : "glass-morphism border border-feedbackme-yellow/20 hover:border-feedbackme-yellow/40 text-white";

  if (status === "loading") {
    return (
      <div className={`${buttonClass} ${sizeClasses[size]} opacity-50 cursor-not-allowed`}>
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (session) {
    return (
      <motion.div 
        className="flex items-center space-x-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* User Avatar */}
        <div className="flex items-center space-x-2">
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-8 h-8 rounded-full border-2 border-feedbackme-yellow/30"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-feedbackme-yellow to-feedbackme-amber flex items-center justify-center">
              <User className="w-4 h-4 text-black" />
            </div>
          )}
          <div className="hidden sm:block">
            <div className="text-sm text-white font-medium">
              {session.user?.name || "User"}
            </div>
            <div className="text-xs text-slate-400">
              {session.user?.email}
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <motion.button
          onClick={() => signOut()}
          className={`${buttonClass} ${sizeClasses[size]} flex items-center space-x-2`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.button
      onClick={() => signIn("google")}
      className={`${buttonClass} ${sizeClasses[size]} flex items-center space-x-2`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <LogIn className="w-4 h-4" />
      <span>Sign In with Google</span>
    </motion.button>
  );
} 