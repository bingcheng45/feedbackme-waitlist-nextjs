"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  MoreVertical, 
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import toast from "react-hot-toast";
import { CommentThread } from "./CommentThread";

interface FeedbackItem {
  id: number;
  title: string;
  description: string;
  type: 'feature' | 'bug' | 'improvement';
  status: 'open' | 'in-progress' | 'closed';
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

interface FeedbackManagementProps {
  projectId: number;
  initialFeedback: FeedbackItem[];
}

export function FeedbackManagement({ projectId: _projectId, initialFeedback }: FeedbackManagementProps) {
  const [feedback, setFeedback] = useState<FeedbackItem[]>(initialFeedback);
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackItem[]>(initialFeedback);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());

  // Filter and sort feedback
  useEffect(() => {
    let filtered = [...feedback];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "most-votes":
        filtered.sort((a, b) => (b.upvotes + b.downvotes) - (a.upvotes + a.downvotes));
        break;
      case "most-upvotes":
        filtered.sort((a, b) => b.upvotes - a.upvotes);
        break;
    }

    setFilteredFeedback(filtered);
  }, [feedback, searchTerm, typeFilter, statusFilter, sortBy]);

  const updateFeedbackStatus = async (feedbackId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setFeedback(prev => prev.map(item =>
          item.id === feedbackId ? { ...item, status: newStatus as any } : item
        ));
        toast.success(`Status updated to ${newStatus}`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const toggleComments = (feedbackId: number) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(feedbackId)) {
        newSet.delete(feedbackId);
      } else {
        newSet.add(feedbackId);
      }
      return newSet;
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return <TrendingUp className="w-4 h-4" />;
      case 'bug': return <AlertCircle className="w-4 h-4" />;
      case 'improvement': return <CheckCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'text-blue-400 bg-blue-400/10';
      case 'bug': return 'text-red-400 bg-red-400/10';
      case 'improvement': return 'text-green-400 bg-green-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4" />;
      case 'in-progress': return <Calendar className="w-4 h-4" />;
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-yellow-400 bg-yellow-400/10';
      case 'in-progress': return 'text-orange-400 bg-orange-400/10';
      case 'closed': return 'text-green-400 bg-green-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-white flex items-center">
          <MessageSquare className="w-6 h-6 mr-2 text-feedbackme-yellow" />
          Feedback Management
        </h2>
        <div className="text-sm text-slate-400">
          {filteredFeedback.length} of {feedback.length} items
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-feedbackme-yellow focus:ring-1 focus:ring-feedbackme-yellow/20 transition-colors"
          />
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 bg-black/40 border border-slate-700 rounded-lg text-white focus:border-feedbackme-yellow focus:ring-1 focus:ring-feedbackme-yellow/20 transition-colors"
        >
          <option value="all">All Types</option>
          <option value="feature">Features</option>
          <option value="bug">Bugs</option>
          <option value="improvement">Improvements</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-black/40 border border-slate-700 rounded-lg text-white focus:border-feedbackme-yellow focus:ring-1 focus:ring-feedbackme-yellow/20 transition-colors"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="closed">Closed</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-black/40 border border-slate-700 rounded-lg text-white focus:border-feedbackme-yellow focus:ring-1 focus:ring-feedbackme-yellow/20 transition-colors"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="most-votes">Most Votes</option>
          <option value="most-upvotes">Most Upvotes</option>
        </select>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredFeedback.map((item, index) => (
            <motion.div
              key={item.id}
              className="glass-morphism rounded-xl p-6 hover:border-feedbackme-yellow/30 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-300 text-sm line-clamp-2 mb-3">{item.description}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button className="text-slate-400 hover:text-white transition-colors p-1">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  {/* Type */}
                  <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${getTypeColor(item.type)}`}>
                    {getTypeIcon(item.type)}
                    <span className="ml-1 capitalize">{item.type}</span>
                  </div>

                  {/* Status */}
                  <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(item.status)}`}>
                    {getStatusIcon(item.status)}
                    <span className="ml-1 capitalize">{item.status}</span>
                  </div>

                  {/* Date */}
                  <span className="text-xs text-slate-400">{formatDate(item.createdAt)}</span>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Votes */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-green-400">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">{item.upvotes}</span>
                    </div>
                    <div className="flex items-center text-red-400">
                      <TrendingDown className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">{item.downvotes}</span>
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="flex items-center space-x-2">
                    {item.status === 'open' && (
                      <button
                        onClick={() => updateFeedbackStatus(item.id, 'in-progress')}
                        className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-xs font-medium hover:bg-orange-500/30 transition-colors"
                      >
                        Start
                      </button>
                    )}
                    {item.status === 'in-progress' && (
                      <button
                        onClick={() => updateFeedbackStatus(item.id, 'closed')}
                        className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/30 transition-colors"
                      >
                        Complete
                      </button>
                    )}
                    {item.status === 'closed' && (
                      <button
                        onClick={() => updateFeedbackStatus(item.id, 'open')}
                        className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-medium hover:bg-yellow-500/30 transition-colors"
                      >
                        Reopen
                      </button>
                    )}
                    
                    {/* Comments Toggle */}
                    <button
                      onClick={() => toggleComments(item.id)}
                      className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition-colors flex items-center"
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Comments
                      {expandedComments.has(item.id) ? (
                        <ChevronUp className="w-3 h-3 ml-1" />
                      ) : (
                        <ChevronDown className="w-3 h-3 ml-1" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <AnimatePresence>
                {expandedComments.has(item.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 pt-6 border-t border-slate-700/50"
                  >
                    <CommentThread
                      feedbackItemId={item.id}
                      isProjectOwner={true} // Project owner since this is in the dashboard
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredFeedback.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No feedback found</h3>
            <p className="text-slate-500">
              {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters or search terms"
                : "No feedback has been submitted yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 