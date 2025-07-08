"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, Globe } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema } from "@/lib/db/schema";
import { z } from "zod";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type ProjectFormData = z.infer<typeof projectSchema>;

interface CreateProjectButtonProps {
  variant?: "primary" | "secondary";
}

export function CreateProjectButton({ variant = "secondary" }: CreateProjectButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create project");
      }

      await response.json();
      toast.success("🎉 Project created successfully!");
      setIsOpen(false);
      reset();
      router.refresh();
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  const buttonClass = variant === "primary" 
    ? "btn-primary" 
    : "glass-morphism border border-feedbackme-yellow/20 hover:border-feedbackme-yellow/40 text-white";

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`${buttonClass} px-4 py-2 flex items-center space-x-2`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Plus className="w-4 h-4" />
        <span>New Project</span>
      </motion.button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="glass-morphism rounded-2xl p-6 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Create New Project</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                  Project Name
                </label>
                <input
                  {...register("name")}
                  type="text"
                  id="name"
                  className="glass-input w-full"
                  placeholder="My Awesome Project"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  {...register("description")}
                  id="description"
                  rows={3}
                  className="glass-input w-full resize-none"
                  placeholder="A brief description of your project..."
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-slate-300 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Domain
                </label>
                <input
                  {...register("domain")}
                  type="text"
                  id="domain"
                  className="glass-input w-full"
                  placeholder="example.com"
                />
                {errors.domain && (
                  <p className="text-red-400 text-sm mt-1">{errors.domain.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 glass-morphism border border-slate-600 hover:border-slate-500 text-slate-300 px-4 py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mx-auto"></div>
                  ) : (
                    "Create Project"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
} 