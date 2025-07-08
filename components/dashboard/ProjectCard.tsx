"use client";

import { motion } from "framer-motion";
import { ExternalLink, Key, Settings, Copy } from "lucide-react";
import { Project } from "@/lib/db/schema";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);

  const copyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(project.apiKey);
      toast.success("API key copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy API key");
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <motion.div
      className="glass-morphism rounded-xl p-6 hover:border-feedbackme-yellow/30 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{project.name}</h3>
          {project.description && (
            <p className="text-sm text-slate-400 line-clamp-2">{project.description}</p>
          )}
        </div>
        <div className={`w-3 h-3 rounded-full ${project.isActive ? 'bg-green-500' : 'bg-gray-500'}`} 
             title={project.isActive ? 'Active' : 'Inactive'} />
      </div>

      {/* Domain */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <ExternalLink className="w-4 h-4 text-feedbackme-yellow" />
          <a 
            href={`https://${project.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-feedbackme-yellow hover:text-feedbackme-amber transition-colors"
          >
            {project.domain}
          </a>
        </div>
      </div>

      {/* API Key */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-slate-300 flex items-center space-x-1">
            <Key className="w-3 h-3" />
            <span>API Key</span>
          </label>
          <button
            onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
            className="text-xs text-feedbackme-yellow hover:text-feedbackme-amber transition-colors"
          >
            {isApiKeyVisible ? 'Hide' : 'Show'}
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <code className="flex-1 bg-black/40 text-xs text-slate-300 px-2 py-1 rounded border border-slate-700">
            {isApiKeyVisible ? project.apiKey : '••••••••••••••••••••••••••••••••'}
          </code>
          <button
            onClick={copyApiKey}
            className="text-slate-400 hover:text-feedbackme-yellow transition-colors p-1"
            title="Copy API key"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-center">
        <div className="bg-black/40 rounded-lg py-2 px-3 border border-slate-700">
          <div className="text-lg font-semibold text-feedbackme-yellow">0</div>
          <div className="text-xs text-slate-400">Feedback</div>
        </div>
        <div className="bg-black/40 rounded-lg py-2 px-3 border border-slate-700">
          <div className="text-lg font-semibold text-feedbackme-yellow">0</div>
          <div className="text-xs text-slate-400">Votes</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Created {formatDate(project.createdAt)}</span>
        <div className="flex items-center space-x-2">
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="text-feedbackme-yellow hover:text-feedbackme-amber transition-colors"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
} 