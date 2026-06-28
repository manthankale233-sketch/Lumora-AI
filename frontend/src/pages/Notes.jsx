import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  Tag,
  Sparkles,
  Trash2,
  BookOpen,
  Check,
  Zap,
  Loader
} from "lucide-react";

const Notes = () => {
  const location = useLocation();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  // AI Generation Modal
  const [showGenModal, setShowGenModal] = useState(false);
  const [genPrompt, setGenPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  // Summarize Drawer
  const [activeNoteForSummary, setActiveNoteForSummary] = useState(null);
  const [summaryText, setSummaryText] = useState("");
  const [summarizing, setSummarizing] = useState(false);

  // Manual Note Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualNote, setManualNote] = useState({ title: "", content: "", tags: "" });
  const [savingManual, setSavingManual] = useState(false);

  useEffect(() => {
    fetchNotes();
    // If navigated from dashboard quick action, open the generator modal
    if (location.state?.openGenerateModal) {
      setShowGenModal(true);
    }
  }, [location]);

  const fetchNotes = async () => {
    try {
      const res = await api.get("/notes");
      setNotes(res.data.notes);
    } catch (err) {
      console.error("Failed to fetch notes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManualNote = async (e) => {
    e.preventDefault();
    if (!manualNote.title.trim()) return;
    setSavingManual(true);
    try {
      const tagsArray = manualNote.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await api.post("/notes", {
        title: manualNote.title,
        content: manualNote.content,
        tags: tagsArray,
      });

      setNotes([res.data.note, ...notes]);
      setShowManualModal(false);
      setManualNote({ title: "", content: "", tags: "" });
    } catch (err) {
      console.error("Failed to create note", err);
    } finally {
      setSavingManual(false);
    }
  };

  const handleGenerateAINote = async (e) => {
    e.preventDefault();
    if (!genPrompt.trim() || generating) return;
    setGenerating(true);
    try {
      const res = await api.post("/notes/generate", { prompt: genPrompt });
      setNotes([res.data.note, ...notes]);
      setShowGenModal(false);
      setGenPrompt("");
    } catch (err) {
      console.error("Failed to generate AI note", err);
      alert(`AI Generation Failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleSummarizeNote = async (note) => {
    setActiveNoteForSummary(note);
    setSummaryText("");
    setSummarizing(true);
    try {
      const res = await api.post(`/notes/${note._id}/summarize`, { length: "medium" });
      setSummaryText(res.data.summary);
    } catch (err) {
      console.error("Failed to summarize note", err);
      setSummaryText(`Summarization failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setSummarizing(false);
    }
  };

  const handleDeleteNote = async (noteId, e) => {
    e.stopPropagation(); // Stop card click from triggering summarize
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes(notes.filter((n) => n._id !== noteId));
    } catch (err) {
      console.error("Failed to delete note", err);
    }
  };

  // Get all unique tags from notes list
  const allTags = Array.from(
    new Set(notes.flatMap((n) => n.tags || []))
  ).filter((t) => t !== "AI Generated");

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag ? n.tags?.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-8 relative min-h-screen pb-24">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white mb-2">AI Workspace</h2>
          <p className="text-dark-muted text-sm font-medium">Create documents manually or generate them with AI.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center space-x-2 bg-white/5 border border-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl px-5 py-3.5 text-sm transition-all duration-300"
          >
            <Plus size={16} />
            <span>Blank Note</span>
          </button>
          <button
            onClick={() => setShowGenModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-brand-violet to-brand-purple hover:from-brand-purple hover:to-brand-pink text-white font-semibold rounded-2xl px-5 py-3.5 text-sm transition-all duration-300 shadow-lg hover:shadow-brand-violet/20"
          >
            <Sparkles size={16} />
            <span>Generate with AI</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-dark-card/20 p-4 rounded-3xl border border-dark-border">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-deep border border-dark-border focus:border-brand-violet rounded-2xl py-3 pl-12 pr-4 text-white placeholder-dark-muted outline-none transition-all text-sm"
          />
        </div>
        {/* Tag Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto py-1">
          <button
            onClick={() => setSelectedTag("")}
            className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all border ${
              selectedTag === ""
                ? "bg-brand-violet text-white border-brand-violet glow-violet"
                : "bg-dark-deep border-dark-border text-dark-muted hover:text-white"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all border ${
                selectedTag === tag
                  ? "bg-brand-violet text-white border-brand-violet glow-violet"
                  : "bg-dark-deep border-dark-border text-dark-muted hover:text-white"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-3xl shimmer" />)}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl border border-dark-border">
          <FileText className="mx-auto text-dark-muted h-12 w-12 mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">No notes found</h3>
          <p className="text-dark-muted text-sm">Create a new note or generate one using our AI engine.</p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredNotes.map((note) => (
            <motion.div
              layout
              key={note._id}
              onClick={() => handleSummarizeNote(note)}
              className="glass rounded-3xl p-6 border border-white/5 bg-dark-card/45 hover:border-brand-violet/30 transition-all duration-300 flex flex-col justify-between h-56 cursor-pointer relative group"
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h3 className="font-bold text-white text-base truncate">{note.title}</h3>
                  <button
                    onClick={(e) => handleDeleteNote(note._id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-dark-muted hover:text-red-400 rounded transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-xs text-dark-muted line-clamp-4 leading-relaxed mb-4">
                  {note.content || "No content."}
                </p>
              </div>

              {/* Note Tags Footer */}
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-dark-border">
                {note.tags?.map((t) => (
                  <span
                    key={t}
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      t === "AI Generated"
                        ? "bg-brand-purple/25 text-brand-violet border border-brand-purple/20"
                        : "bg-white/5 text-dark-muted"
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* 1. AI Generation Modal */}
      <AnimatePresence>
        {showGenModal && (
          <div className="fixed inset-0 bg-dark-deep/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-3xl p-8 max-w-lg w-full border border-white/5 bg-dark-card/90 shadow-2xl relative"
            >
              {generating ? (
                <div className="text-center py-10 space-y-6">
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    {/* Spinning portal */}
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-violet glow-violet"></div>
                    <Sparkles className="absolute text-brand-pink h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Generating AI Note</h3>
                    <p className="text-dark-muted text-xs mt-1">Our AI Engine is structuring your document. Please wait...</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleGenerateAINote} className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="text-brand-violet" size={20} />
                      <h3 className="text-lg font-bold text-white">Generate with AI</h3>
                    </div>
                    <button type="button" onClick={() => setShowGenModal(false)} className="text-dark-muted hover:text-white">✕</button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-dark-muted uppercase tracking-wider">What should the note be about?</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="E.g., Write a comprehensive study guide on Photosynthesis, detailing the Light-Dependent and Light-Independent reactions..."
                      value={genPrompt}
                      onChange={(e) => setGenPrompt(e.target.value)}
                      className="w-full bg-dark-deep border border-dark-border focus:border-brand-violet rounded-2xl p-4 text-white placeholder-dark-muted outline-none transition-all text-sm resize-none focus:ring-1 focus:ring-brand-violet"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-brand-violet to-brand-purple hover:from-brand-purple hover:to-brand-pink text-white font-semibold rounded-2xl py-4 transition-all duration-300 shadow-lg"
                  >
                    Generate Document
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Manual Blank Note Modal */}
      <AnimatePresence>
        {showManualModal && (
          <div className="fixed inset-0 bg-dark-deep/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-3xl p-8 max-w-2xl w-full border border-white/5 bg-dark-card/90 shadow-2xl"
            >
              <form onSubmit={handleCreateManualNote} className="space-y-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="text-brand-blue" size={20} />
                    <h3 className="text-lg font-bold text-white">Create Blank Note</h3>
                  </div>
                  <button type="button" onClick={() => setShowManualModal(false)} className="text-dark-muted hover:text-white">✕</button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Note Title"
                    value={manualNote.title}
                    onChange={(e) => setManualNote({ ...manualNote, title: e.target.value })}
                    className="w-full bg-dark-deep border border-dark-border focus:border-brand-blue rounded-xl px-4 py-3 text-white placeholder-dark-muted outline-none transition-all text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={8}
                    placeholder="Start typing your note content..."
                    value={manualNote.content}
                    onChange={(e) => setManualNote({ ...manualNote, content: e.target.value })}
                    className="w-full bg-dark-deep border border-dark-border focus:border-brand-blue rounded-xl p-4 text-white placeholder-dark-muted outline-none transition-all text-sm resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Tags (comma separated, e.g., study, biology, draft)"
                    value={manualNote.tags}
                    onChange={(e) => setManualNote({ ...manualNote, tags: e.target.value })}
                    className="w-full bg-dark-deep border border-dark-border focus:border-brand-blue rounded-xl px-4 py-3 text-white placeholder-dark-muted outline-none transition-all text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingManual}
                  className="w-full bg-brand-blue hover:bg-brand-indigo text-white font-semibold rounded-2xl py-4 transition-all duration-300 shadow-lg"
                >
                  {savingManual ? "Saving..." : "Create Note"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Summarize Drawer (Slides in from the right) */}
      <AnimatePresence>
        {activeNoteForSummary && (
          <div className="fixed inset-0 bg-dark-deep/40 backdrop-blur-sm z-40 flex justify-end">
            {/* Backdrop click closer */}
            <div className="absolute inset-0" onClick={() => setActiveNoteForSummary(null)} />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-lg bg-dark-card border-l border-dark-border h-full p-8 relative z-50 flex flex-col justify-between shadow-2xl"
            >
              <div className="space-y-6 overflow-y-auto pr-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-extrabold text-white truncate">{activeNoteForSummary.title}</h3>
                  <button onClick={() => setActiveNoteForSummary(null)} className="text-dark-muted hover:text-white">✕</button>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">Document Content</span>
                  <p className="text-xs text-dark-muted leading-relaxed whitespace-pre-wrap max-h-44 overflow-y-auto bg-dark-deep/50 p-4 rounded-2xl border border-dark-border">
                    {activeNoteForSummary.content || "Empty content."}
                  </p>
                </div>

                {/* AI Summary Section */}
                <div className="space-y-3 pt-4 border-t border-dark-border">
                  <div className="flex items-center space-x-2 text-brand-pink">
                    <Sparkles size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">AI Summary</span>
                  </div>
                  
                  {summarizing ? (
                    <div className="flex items-center space-x-3 py-6 text-dark-muted text-sm">
                      <Loader className="animate-spin text-brand-pink" size={16} />
                      <span>Summarizing document...</span>
                    </div>
                  ) : (
                    <p className="text-sm text-dark-text leading-relaxed bg-brand-pink/5 border border-brand-pink/15 p-5 rounded-2xl glow-pink">
                      {summaryText}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setActiveNoteForSummary(null)}
                className="w-full bg-white/5 border border-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl py-4 transition-all text-sm"
              >
                Close View
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Notes;
