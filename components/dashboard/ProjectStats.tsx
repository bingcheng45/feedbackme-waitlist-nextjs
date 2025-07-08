"use client";

import { motion } from "framer-motion";
import { BarChart3, MessageSquare, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import { Project } from "@/lib/db/schema";

interface ProjectStatsProps {
  project: Project;
  stats: {
    totalFeedback: number;
    totalVotes: number;
    featureRequests: number;
    bugReports: number;
    improvements: number;
    openItems: number;
    inProgressItems: number;
    closedItems: number;
  };
}

export function ProjectStats({ project, stats }: ProjectStatsProps) {
  const statCards = [
    {
      title: "Total Feedback",
      value: stats.totalFeedback,
      icon: MessageSquare,
      color: "text-feedbackme-yellow",
      bgColor: "bg-feedbackme-yellow/10",
    },
    {
      title: "Total Votes",
      value: stats.totalVotes,
      icon: TrendingUp,
      color: "text-feedbackme-amber",
      bgColor: "bg-feedbackme-amber/10",
    },
    {
      title: "Feature Requests",
      value: stats.featureRequests,
      icon: BarChart3,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      title: "Bug Reports",
      value: stats.bugReports,
      icon: XCircle,
      color: "text-red-400",
      bgColor: "bg-red-400/10",
    },
    {
      title: "Improvements",
      value: stats.improvements,
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      title: "In Progress",
      value: stats.inProgressItems,
      icon: Clock,
      color: "text-orange-400",
      bgColor: "bg-orange-400/10",
    },
  ];

  const statusDistribution = [
    { label: "Open", value: stats.openItems, color: "bg-yellow-500" },
    { label: "In Progress", value: stats.inProgressItems, color: "bg-orange-500" },
    { label: "Closed", value: stats.closedItems, color: "bg-green-500" },
  ];

  const typeDistribution = [
    { label: "Features", value: stats.featureRequests, color: "bg-blue-500" },
    { label: "Bugs", value: stats.bugReports, color: "bg-red-500" },
    { label: "Improvements", value: stats.improvements, color: "bg-green-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              className="glass-morphism rounded-xl p-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-slate-400">{stat.title}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Distribution Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <motion.div
          className="glass-morphism rounded-xl p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-feedbackme-yellow" />
            Status Distribution
          </h3>
          <div className="space-y-3">
            {statusDistribution.map((status) => {
              const percentage = stats.totalFeedback > 0 
                ? Math.round((status.value / stats.totalFeedback) * 100) 
                : 0;
              
              return (
                <div key={status.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">{status.label}</span>
                    <span className="text-slate-400">{status.value} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${status.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Type Distribution */}
        <motion.div
          className="glass-morphism rounded-xl p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-feedbackme-yellow" />
            Type Distribution
          </h3>
          <div className="space-y-3">
            {typeDistribution.map((type) => {
              const percentage = stats.totalFeedback > 0 
                ? Math.round((type.value / stats.totalFeedback) * 100) 
                : 0;
              
              return (
                <div key={type.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">{type.label}</span>
                    <span className="text-slate-400">{type.value} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${type.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Project Info */}
      <motion.div
        className="glass-morphism rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Project Information</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Domain:</span>{" "}
            <span className="text-feedbackme-yellow">{project.domain}</span>
          </div>
          <div>
            <span className="text-slate-400">Status:</span>{" "}
            <span className={project.isActive ? "text-green-400" : "text-gray-400"}>
              {project.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Created:</span>{" "}
            <span className="text-slate-300">
              {new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }).format(new Date(project.createdAt))}
            </span>
          </div>
          <div>
            <span className="text-slate-400">API Key:</span>{" "}
            <code className="text-xs text-slate-300 bg-black/40 px-2 py-1 rounded">
              {project.apiKey.substring(0, 8)}...
            </code>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 