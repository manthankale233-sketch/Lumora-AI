import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Calendar,
  Heart,
  Activity,
  Plus,
  Image as ImageIcon,
  Check,
  Loader,
  Sparkles,
  TrendingUp,
  Sliders,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const ProgressTracker = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [notes, setNotes] = useState("");
  const [skinRating, setSkinRating] = useState(5);
  const [hairRating, setHairRating] = useState(5);
  const [uploading, setUploading] = useState(false);

  // Interactive Slider State
  const [sliderPosition, setSliderPosition] = useState(50);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await api.get("/progress");
      setEntries(res.data.entries);
    } catch (err) {
      console.error("Failed to fetch progress entries", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || uploading) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("notes", notes);
    formData.append("skinRating", skinRating);
    formData.append("hairRating", hairRating);

    try {
      const res = await api.post("/progress", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setEntries([res.data.progress, ...entries]);
      setShowModal(false);
      setFile(null);
      setFilePreview("");
      setNotes("");
      setSkinRating(5);
      setHairRating(5);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload progress photo.");
    } finally {
      setUploading(false);
    }
  };

  // 1. Custom SVG Line Chart Generator (Skin & Hair Ratings over Time)
  const renderRatingChart = () => {
    if (entries.length < 2) return null;

    // Use chronological order (oldest to newest)
    const chartEntries = [...entries].reverse();
    const width = 600;
    const height = 150;
    const padding = 20;

    const getPoints = (ratingKey) => {
      const xSpacing = (width - padding * 2) / (chartEntries.length - 1);
      return chartEntries.map((entry, idx) => {
        const rating = entry[ratingKey] || 5;
        const x = padding + idx * xSpacing;
        const y = height - padding - ((rating - 1) / 9) * (height - padding * 2);
        return { x, y, rating, date: new Date(entry.date).toLocaleDateString() };
      });
    };

    const skinPoints = getPoints("skinRating");
    const hairPoints = getPoints("hairRating");

    const getPathData = (points) => {
      return points.reduce((path, p, idx) => {
        return idx === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
      }, "");
    };

    const getAreaPathData = (points) => {
      if (points.length === 0) return "";
      const first = points[0];
      const last = points[points.length - 1];
      const linePath = getPathData(points);
      return `${linePath} L ${last.x} ${height - padding} L ${first.x} ${height - padding} Z`;
    };

    return (
      <div className="glass rounded-3xl p-6 border border-white/5 bg-dark-card/35 space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <TrendingUp size={16} className="text-brand-violet" />
              <span>Skin & Hair Health Trends</span>
            </h3>
            <p className="text-xs text-dark-muted font-medium">Log consistently to see your recovery curve.</p>
          </div>
          <div className="flex space-x-4 text-xs font-semibold">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-violet inline-block" />
              <span className="text-white">Skin ({entries[0].skinRating}/10)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-pink inline-block" />
              <span className="text-white">Hair ({entries[0].hairRating}/10)</span>
            </span>
          </div>
        </div>

        <div className="relative w-full overflow-hidden pt-2">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            <defs>
              <linearGradient id="skinGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="hairGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f472b6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

            {/* Areas */}
            <path d={getAreaPathData(skinPoints)} fill="url(#skinGlow)" />
            <path d={getAreaPathData(hairPoints)} fill="url(#hairGlow)" />

            {/* Lines */}
            <path d={getPathData(skinPoints)} fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={getPathData(hairPoints)} fill="none" stroke="#f472b6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Data points */}
            {skinPoints.map((p, idx) => (
              <g key={`skin-pt-${idx}`} className="group cursor-pointer">
                <circle cx={p.x} cy={p.y} r="4" fill="#a855f7" stroke="#03010a" strokeWidth="1.5" />
                <circle cx={p.x} cy={p.y} r="8" fill="#a855f7" opacity="0" className="hover:opacity-20 transition-opacity" />
              </g>
            ))}

            {hairPoints.map((p, idx) => (
              <g key={`hair-pt-${idx}`} className="group cursor-pointer">
                <circle cx={p.x} cy={p.y} r="4" fill="#f472b6" stroke="#03010a" strokeWidth="1.5" />
                <circle cx={p.x} cy={p.y} r="8" fill="#f472b6" opacity="0" className="hover:opacity-20 transition-opacity" />
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-24 relative min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white mb-2 flex items-center space-x-2">
            <Camera size={28} className="text-brand-violet" />
            <span>Progress Tracker</span>
          </h2>
          <p className="text-dark-muted text-sm font-medium">Log before/after photos and track your skin and hair recovery curve.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-brand-violet to-brand-purple hover:from-brand-purple hover:to-brand-pink text-white font-semibold rounded-2xl px-5 py-3.5 text-sm transition-all duration-300 shadow-lg shadow-brand-violet/15"
        >
          <Plus size={16} />
          <span>New Progress Log</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-64 rounded-3xl shimmer" />)}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl border border-white/5">
          <Camera className="mx-auto text-dark-muted h-12 w-12 mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">No progress photos yet</h3>
          <p className="text-dark-muted text-sm">Upload a photo today to start tracking your skin/hair journey!</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Trend Chart & Before/After Slider */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* 2. Custom Trend Chart */}
            {entries.length >= 2 ? (
              renderRatingChart()
            ) : (
              <div className="glass rounded-3xl p-6 border border-white/5 bg-dark-card/35 flex flex-col justify-center items-center text-center space-y-3 h-64">
                <Sparkles size={24} className="text-brand-violet animate-pulse" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Log More Days</h4>
                <p className="text-xs text-dark-muted max-w-xs font-medium">
                  We need at least **2 progress logs** to calculate and display your health trend chart.
                </p>
              </div>
            )}

            {/* 3. Interactive Before/After Drag Slider */}
            {entries.length >= 2 ? (
              <div className="glass rounded-3xl p-6 border border-white/5 bg-dark-card/35 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Sliders size={16} className="text-brand-pink" />
                    <span>Interactive Before & After Slider</span>
                  </h3>
                  <p className="text-xs text-dark-muted font-medium">Drag the slider to compare your starting vs current skin state.</p>
                </div>

                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-dark-deep border border-dark-border select-none group">
                  {/* Before Image (Background) */}
                  <img
                    src={entries[entries.length - 1].photoUrl}
                    alt="Before"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider text-white z-10">
                    Before ({new Date(entries[entries.length - 1].date).toLocaleDateString()})
                  </div>

                  {/* After Image (Overlay, Clipped) */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
                    }}
                  >
                    <img
                      src={entries[0].photoUrl}
                      alt="After"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-3 right-3 bg-brand-violet/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider text-white z-10">
                    After ({new Date(entries[0].date).toLocaleDateString()})
                  </div>

                  {/* Slider Bar & Handle */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white z-20 pointer-events-none"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-dark-deep border-2 border-brand-violet shadow-lg flex items-center justify-center pointer-events-none">
                      <Sliders size={12} className="text-brand-violet rotate-90" />
                    </div>
                  </div>

                  {/* Transparent Range Input Overlay for Drag Controls */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPosition}
                    onChange={(e) => setSliderPosition(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                  />
                </div>
              </div>
            ) : (
              <div className="glass rounded-3xl p-6 border border-white/5 bg-dark-card/35 flex flex-col justify-center items-center text-center space-y-3 h-64">
                <Camera size={24} className="text-brand-pink animate-pulse" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Before & After Slider</h4>
                <p className="text-xs text-dark-muted max-w-xs font-medium">
                  Once you upload a second progress photo, you'll be able to interactively slide between before and after.
                </p>
              </div>
            )}
          </div>

          {/* 4. Weekly Streak Calendar */}
          <div className="glass rounded-3xl p-6 border border-white/5 bg-dark-card/35 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Calendar size={16} className="text-brand-blue" />
              <span>Routine Consistency Streak</span>
            </h3>
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: 7 }).map((_, idx) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - idx));
                const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
                const isToday = idx === 6;
                // Mock consistency for UI demo
                const completed = idx !== 2 && idx !== 5;

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border text-center space-y-2 flex flex-col items-center justify-center transition-all ${
                      isToday
                        ? "bg-brand-violet/10 border-brand-violet/30 shadow-lg shadow-brand-violet/5"
                        : "glass-light border-white/5"
                    }`}
                  >
                    <span className="text-[10px] text-dark-muted font-bold uppercase tracking-wider">{dayName}</span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      completed
                        ? "bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald shadow-lg shadow-brand-emerald/5"
                        : "bg-white/5 border border-white/5 text-dark-muted"
                    }`}>
                      {completed ? <Check size={14} /> : <span className="text-[10px] font-bold">--</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Logs Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>Photo History Log</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {entries.map((entry) => (
                <motion.div
                  layout
                  key={entry._id}
                  className="glass rounded-3xl overflow-hidden border border-white/5 bg-dark-card/45 hover:border-brand-violet/25 transition-all duration-300 flex flex-col gradient-border-hover"
                >
                  <div className="aspect-[4/3] bg-dark-deep border-b border-dark-border relative">
                    <img
                      src={entry.photoUrl}
                      alt="progress log"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[9px] font-bold text-white flex items-center space-x-1 border border-white/5">
                      <Calendar size={10} />
                      <span>{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs text-dark-muted leading-relaxed italic font-medium">
                      "{entry.notes || "No notes written."}"
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-dark-border/50">
                      {entry.skinRating && (
                        <div className="flex items-center space-x-2 bg-brand-violet/5 p-2 rounded-xl border border-brand-violet/10">
                          <Heart className="text-brand-violet fill-brand-violet/10" size={14} />
                          <div>
                            <span className="text-[9px] text-dark-muted font-bold block uppercase tracking-wider">Skin</span>
                            <span className="text-xs font-extrabold text-white">{entry.skinRating}/10</span>
                          </div>
                        </div>
                      )}

                      {entry.hairRating && (
                        <div className="flex items-center space-x-2 bg-brand-pink/5 p-2 rounded-xl border border-brand-pink/10">
                          <Activity className="text-brand-pink" size={14} />
                          <div>
                            <span className="text-[9px] text-dark-muted font-bold block uppercase tracking-wider">Hair</span>
                            <span className="text-xs font-extrabold text-white">{entry.hairRating}/10</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-dark-deep/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-3xl p-8 max-w-md w-full border border-white/5 bg-dark-card/90 shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Camera className="text-brand-violet" size={20} />
                  <span>New Progress Log</span>
                </h3>
                <button type="button" onClick={() => setShowModal(false)} className="text-dark-muted hover:text-white">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">Upload Image</label>
                  {filePreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-dark-border aspect-[4/3] bg-dark-deep">
                      <img src={filePreview} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          setFilePreview("");
                        }}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white p-1.5 rounded-full transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="border border-dashed border-dark-border hover:border-brand-violet/40 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-dark-deep/30 group aspect-[4/3]">
                      <ImageIcon className="text-dark-muted group-hover:text-brand-violet transition-colors mb-2" size={32} />
                      <span className="text-xs font-semibold text-white">Select Image</span>
                      <span className="text-[10px] text-dark-muted mt-1">JPEG, PNG, or WebP</span>
                      <input type="file" accept="image/*" required onChange={handleFileChange} className="hidden" />
                    </label>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">Notes</label>
                  <textarea
                    placeholder="Write down any notes (e.g., used Niacinamide serum today, skin feels hydrated)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-dark-deep border border-dark-border focus:border-brand-violet rounded-xl p-3 text-white placeholder-dark-muted outline-none transition-all text-xs resize-none"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-dark-muted uppercase tracking-wider">
                      <span>Skin Rating</span>
                      <span className="text-brand-violet">{skinRating}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={skinRating}
                      onChange={(e) => setSkinRating(e.target.value)}
                      className="w-full h-1 bg-dark-deep rounded-lg appearance-none cursor-pointer accent-brand-violet"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-dark-muted uppercase tracking-wider">
                      <span>Hair Rating</span>
                      <span className="text-brand-pink">{hairRating}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={hairRating}
                      onChange={(e) => setHairRating(e.target.value)}
                      className="w-full h-1 bg-dark-deep rounded-lg appearance-none cursor-pointer accent-brand-pink"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="w-full bg-gradient-to-r from-brand-violet to-brand-purple hover:from-brand-purple hover:to-brand-pink text-white font-semibold rounded-2xl py-4 transition-all duration-300 shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {uploading ? <Loader className="animate-spin" size={16} /> : <Check size={16} />}
                  <span>{uploading ? "Uploading..." : "Save Entry"}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProgressTracker;
