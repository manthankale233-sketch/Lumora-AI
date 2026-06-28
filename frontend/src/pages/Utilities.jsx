import React, { useState, useRef } from "react";
import api from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "../utils/soundEffects";
import {
  ShieldCheck,
  Columns,
  Sparkles,
  Search,
  CheckCircle,
  Loader,
  Camera,
  Scan,
  ExternalLink,
  BookOpen,
  Info,
  Heart
} from "lucide-react";

const Utilities = () => {
  const [activeTab, setActiveTab] = useState("ingredients"); // 'ingredients', 'compare', or 'dictionary'

  // Ingredient Checker states
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [ingredientsResult, setIngredientsResult] = useState("");

  // Webcam Scanning states
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const videoRef = useRef(null);

  // Comparison states
  const [productA, setProductA] = useState("");
  const [productB, setProductB] = useState("");
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState("");

  // Ingredient Dictionary states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDictItem, setSelectedDictItem] = useState("niacinamide");

  const ingredientDictionary = {
    niacinamide: {
      name: "Niacinamide (Vitamin B3)",
      rating: "1",
      ratingText: "Low Hazard / Highly Beneficial",
      benefits: [
        "Strengthens the skin's lipid barrier to lock in moisture.",
        "Regulates sebum (oil) production to prevent acne.",
        "Fades hyperpigmentation and dark spots.",
        "Reduces redness and blotchiness."
      ],
      skinTypes: "All skin types (especially oily, combination, and sensitive)",
      tip: "Can be used morning and night. Pairs beautifully with Hyaluronic Acid and Retinol. Avoid using at the exact same time as highly acidic Vitamin C (L-Ascorbic Acid) if you have sensitive skin."
    },
    retinol: {
      name: "Retinol (Vitamin A)",
      rating: "2",
      ratingText: "Low Hazard / Active",
      benefits: [
        "Accelerates skin cell turnover for a fresher complexion.",
        "Stimulates collagen production to reduce fine lines.",
        "Unclogs pores and controls acne.",
        "Improves skin texture and tone."
      ],
      skinTypes: "Normal, oily, combination, dry (avoid on extremely sensitive skin)",
      tip: "Use ONLY in your night (PM) routine. Always apply sunscreen the next morning, as retinol increases sun sensitivity. Start slowly (2-3 times a week) to build tolerance."
    },
    "salicylic acid": {
      name: "Salicylic Acid (BHA)",
      rating: "1",
      ratingText: "Low Hazard / Active Exfoliant",
      benefits: [
        "Penetrates deep into pores to dissolve clogging oil and debris.",
        "Fights acne, blackheads, and whiteheads.",
        "Has anti-inflammatory properties to calm breakouts."
      ],
      skinTypes: "Oily, combination, acne-prone",
      tip: "Great for oily T-zones. Do not mix with Retinol or other strong acids (AHA) in the same routine step to avoid skin barrier irritation."
    },
    "hyaluronic acid": {
      name: "Hyaluronic Acid",
      rating: "1",
      ratingText: "Very Safe / Deep Hydrator",
      benefits: [
        "Draws moisture from the air and holds 1000x its weight in water.",
        "Instantly plumps the skin and reduces dehydration lines.",
        "Supports skin barrier healing."
      ],
      skinTypes: "All skin types (essential for dry and dehydrated skin)",
      tip: "Apply on slightly damp skin, then lock it in immediately with a moisturizer to prevent the acid from drawing moisture out of your skin."
    },
    "vitamin c": {
      name: "Vitamin C (L-Ascorbic Acid)",
      rating: "1",
      ratingText: "Low Hazard / Antioxidant",
      benefits: [
        "Powerful antioxidant that neutralizes free radical damage.",
        "Brightens dull skin and boosts natural glow.",
        "Fades sun spots and hyperpigmentation."
      ],
      skinTypes: "All skin types (use derivatives like Sodium Ascorbyl Phosphate if sensitive)",
      tip: "Best used in your morning (AM) routine under sunscreen to double your sun protection. Keep the bottle in a dark, cool place to prevent oxidation."
    },
    ceramides: {
      name: "Ceramides",
      rating: "1",
      ratingText: "Very Safe / Barrier Builder",
      benefits: [
        "Constitutes 50% of the skin barrier.",
        "Prevents moisture loss (TEWL).",
        "Protects against environmental irritants.",
        "Accelerates skin recovery."
      ],
      skinTypes: "All skin types (critical for dry, damaged, or sensitive skin)",
      tip: "Excellent to use after exfoliating or applying retinol to soothe and rebuild the skin barrier."
    },
    "centella asiatica": {
      name: "Centella Asiatica (Cica)",
      rating: "1",
      ratingText: "Very Safe / Soother",
      benefits: [
        "Calms active skin irritation, redness, and itching.",
        "Promotes wound healing and acne recovery.",
        "Boosts skin hydration."
      ],
      skinTypes: "Sensitive, irritated, acne-prone, dry",
      tip: "Look for products containing Cica if your skin barrier is damaged, red, or reacting to new active ingredients."
    }
  };

  // Start Camera
  const startCamera = async () => {
    setCameraLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Failed to access camera", err);
      alert("Could not access camera. Please check your permissions.");
      setShowCameraModal(false);
    } finally {
      setCameraLoading(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const handleOpenScanner = () => {
    setShowCameraModal(true);
    setTimeout(startCamera, 300);
  };

  const handleCloseScanner = () => {
    stopCamera();
    setShowCameraModal(false);
  };

  // Capture Image & Scan
  const handleCaptureAndScan = async () => {
    if (!videoRef.current || !cameraStream) return;

    playSound("shutter");
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL("image/jpeg");
    handleCloseScanner();

    setChecking(true);
    setIngredientsResult("");
    try {
      const res = await api.post("/skincare-utils/scan-ingredients", {
        image: base64Image
      });
      setIngredientsResult(res.data.analysis);
      playSound("success");
    } catch (err) {
      console.error("Image scan failed", err);
      setIngredientsResult("Failed to scan ingredients from image. Please try pasting the text instead.");
    } finally {
      setChecking(false);
    }
  };

  const handleCheckIngredients = async (e) => {
    e.preventDefault();
    if (!ingredientsInput.trim() || checking) return;

    playSound("click");
    setChecking(true);
    setIngredientsResult("");
    try {
      const res = await api.post("/skincare-utils/check-ingredients", {
        ingredients: ingredientsInput,
      });
      setIngredientsResult(res.data.analysis);
      playSound("success");
    } catch (err) {
      console.error("Ingredient check failed", err);
      setIngredientsResult("Failed to analyze ingredients. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleCompareProducts = async (e) => {
    e.preventDefault();
    if (!productA.trim() || !productB.trim() || comparing) return;

    playSound("click");
    setComparing(true);
    setComparisonResult("");
    try {
      const res = await api.post("/skincare-utils/compare-products", {
        productA,
        productB,
      });
      setComparisonResult(res.data.comparison);
      playSound("success");
    } catch (err) {
      console.error("Product comparison failed", err);
      setComparisonResult("Failed to compare products. Please try again.");
    } finally {
      setComparing(false);
    }
  };

  const renderMarkdown = (text) => {
    if (!text) return null;

    const lines = text.split("\n");
    const elements = [];
    let currentTable = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect table rows
      if (line.startsWith("|")) {
        const cells = line.split("|")
          .map(cell => cell.trim())
          .filter((cell, idx, arr) => idx > 0 && idx < arr.length - 1);

        // Skip table separator row (e.g., |:---|:---|)
        const isSeparator = cells.every(cell => 
          cell.startsWith(":") || 
          cell.endsWith(":") || 
          cell.split("").every(char => char === "-")
        );

        if (isSeparator) {
          continue;
        }

        if (!currentTable) {
          currentTable = { headers: cells, rows: [] };
        } else {
          currentTable.rows.push(cells);
        }
      } else {
        // If we have an accumulated table, render it before rendering the next element
        if (currentTable) {
          const tableKey = `table-${i}`;
          elements.push(
            <div key={tableKey} className="overflow-x-auto my-4 rounded-xl border border-white/5 bg-dark-deep/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-white font-bold">
                    {currentTable.headers.map((h, idx) => (
                      <th key={idx} className="p-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentTable.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-white/5 hover:bg-white/5 transition-colors text-dark-muted font-semibold">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-3">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          currentTable = null;
        }

        if (line.startsWith("### ")) {
          elements.push(<h4 key={i} className="text-sm font-bold text-white mt-4 mb-2">{line.replace("### ", "")}</h4>);
        } else if (line.startsWith("## ")) {
          elements.push(<h3 key={i} className="text-base font-extrabold text-brand-violet mt-6 mb-3">{line.replace("## ", "")}</h3>);
        } else if (line.startsWith("- ")) {
          const itemText = line.replace("- ", "");
          if (itemText.includes("[Buy on Amazon]")) {
            const parts = itemText.split("|");
            elements.push(
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-dark-deep/40 border border-dark-border/40 mb-3 text-xs font-semibold gap-2">
                <span className="text-white">{parts[0].split("[")[0].trim()}</span>
                <div className="flex space-x-2 flex-shrink-0">
                  <a
                    href={parts[0].match(/\((.*?)\)/)?.[1]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition-all"
                  >
                    <span>Amazon</span>
                    <ExternalLink size={10} />
                  </a>
                  {parts[1] && (
                    <a
                      href={parts[1].match(/\((.*?)\)/)?.[1]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-brand-pink bg-brand-pink/10 border border-brand-pink/20 px-3 py-1.5 rounded-lg hover:bg-brand-pink/20 transition-all"
                    >
                      <span>Nykaa</span>
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            );
          } else {
            elements.push(<li key={i} className="text-xs text-dark-muted leading-relaxed ml-4 mb-1 list-disc font-medium">{itemText}</li>);
          }
        } else if (line) {
          elements.push(<p key={i} className="text-xs text-dark-muted leading-relaxed mb-2 font-medium">{line}</p>);
        }
      }
    }

    // Render any remaining table at the end
    if (currentTable) {
      elements.push(
        <div key="table-end" className="overflow-x-auto my-4 rounded-xl border border-white/5 bg-dark-deep/40">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-white/5 text-white font-bold">
                {currentTable.headers.map((h, idx) => (
                  <th key={idx} className="p-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentTable.rows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-white/5 hover:bg-white/5 transition-colors text-dark-muted font-semibold">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-3">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return elements;
  };

  // Filter dictionary items by query
  const filteredDictKeys = Object.keys(ingredientDictionary).filter(key =>
    key.includes(searchQuery.toLowerCase()) || 
    ingredientDictionary[key].name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-24 relative min-h-screen">
      <div>
        <h2 className="text-3xl font-extrabold text-white mb-2 flex items-center space-x-2">
          <ShieldCheck size={28} className="text-brand-violet" />
          <span>Skincare Diagnostics</span>
        </h2>
        <p className="text-dark-muted text-sm font-medium">Check product safety ratings, compare formulation tables, or browse active ingredients.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-dark-deep border border-dark-border rounded-2xl p-1.5 max-w-md space-x-2">
        <button
          onClick={() => {
            playSound("click");
            setActiveTab("ingredients");
          }}
          className={`flex items-center space-x-2 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex-1 justify-center ${
            activeTab === "ingredients"
              ? "bg-brand-violet text-white glow-violet"
              : "text-dark-muted hover:text-white"
          }`}
        >
          <ShieldCheck size={14} />
          <span>Formulation Checker</span>
        </button>
        <button
          onClick={() => {
            playSound("click");
            setActiveTab("compare");
          }}
          className={`flex items-center space-x-2 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex-1 justify-center ${
            activeTab === "compare"
              ? "bg-brand-pink text-white glow-pink"
              : "text-dark-muted hover:text-white"
          }`}
        >
          <Columns size={14} />
          <span>Product Compare</span>
        </button>
        <button
          onClick={() => {
            playSound("click");
            setActiveTab("dictionary");
          }}
          className={`flex items-center space-x-2 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex-1 justify-center ${
            activeTab === "dictionary"
              ? "bg-brand-blue text-white"
              : "text-dark-muted hover:text-white"
          }`}
        >
          <BookOpen size={14} />
          <span>Dictionary</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* Ingredient Checker */}
        {activeTab === "ingredients" && (
          <motion.div
            key="ingredients"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
          >
            <div className="glass rounded-3xl p-8 border border-white/5 bg-dark-card/45 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1.5 max-w-[70%]">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Sparkles className="text-brand-violet" size={20} />
                    <span>Analyze Ingredients</span>
                  </h3>
                  <p className="text-xs text-dark-muted leading-relaxed font-medium">
                    Paste the list of ingredients from your product packaging, or scan it with your camera.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={handleOpenScanner}
                  className="flex items-center space-x-1.5 bg-brand-violet/10 hover:bg-brand-violet/20 border border-brand-violet/20 text-brand-violet text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all"
                >
                  <Camera size={14} />
                  <span>Scan Bottle</span>
                </button>
              </div>

              <form onSubmit={handleCheckIngredients} className="space-y-4">
                <textarea
                  required
                  rows={7}
                  placeholder="E.g., Water, Glycerin, Niacinamide, Salicylic Acid, Sodium Hyaluronate, Phenoxyethanol..."
                  value={ingredientsInput}
                  onChange={(e) => setIngredientsInput(e.target.value)}
                  className="w-full bg-dark-deep border border-dark-border focus:border-brand-violet rounded-2xl p-4 text-white placeholder-dark-muted outline-none transition-all text-xs resize-none focus:ring-1 focus:ring-brand-violet"
                />
                <button
                  type="submit"
                  disabled={checking || !ingredientsInput.trim()}
                  className="w-full bg-brand-violet hover:bg-brand-purple text-white font-semibold rounded-2xl py-4 transition-all duration-300 shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {checking ? <Loader className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                  <span>{checking ? "Analyzing..." : "Check Formulation"}</span>
                </button>
              </form>
            </div>

            <div className="glass rounded-3xl p-8 border border-white/5 bg-dark-card/25 min-h-[300px]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-dark-border pb-3 text-brand-violet">
                Analysis Report
              </h3>
              {checking ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3 text-dark-muted text-xs">
                  <Loader className="animate-spin text-brand-violet" size={24} />
                  <span>Annu is auditing the ingredient safety...</span>
                </div>
              ) : ingredientsResult ? (
                <div className="prose prose-invert max-w-none">
                  {renderMarkdown(ingredientsResult)}
                </div>
              ) : (
                <div className="text-center py-20 text-xs text-dark-muted">
                  Your analysis report will appear here.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Product Compare */}
        {activeTab === "compare" && (
          <motion.div
            key="compare"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
          >
            <div className="glass rounded-3xl p-8 border border-white/5 bg-dark-card/45 space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Sparkles className="text-brand-pink" size={20} />
                  <span>Compare Formulations</span>
                </h3>
                <p className="text-xs text-dark-muted leading-relaxed font-medium">
                  Enter the names of two products. Annu will construct a side-by-side comparison table to declare a winner.
                </p>
              </div>

              <form onSubmit={handleCompareProducts} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">Product A</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., CeraVe Hydrating Cleanser"
                      value={productA}
                      onChange={(e) => setProductA(e.target.value)}
                      className="w-full bg-dark-deep border border-dark-border focus:border-brand-pink rounded-xl px-4 py-3.5 text-white placeholder-dark-muted outline-none transition-all text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">Product B</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Cetaphil Gentle Skin Cleanser"
                      value={productB}
                      onChange={(e) => setProductB(e.target.value)}
                      className="w-full bg-dark-deep border border-dark-border focus:border-brand-pink rounded-xl px-4 py-3.5 text-white placeholder-dark-muted outline-none transition-all text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={comparing || !productA.trim() || !productB.trim()}
                  className="w-full bg-brand-pink hover:bg-brand-purple text-white font-semibold rounded-2xl py-4 transition-all duration-300 shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {comparing ? <Loader className="animate-spin" size={16} /> : <Search size={16} />}
                  <span>{comparing ? "Comparing..." : "Compare Formulas"}</span>
                </button>
              </form>
            </div>

            <div className="glass rounded-3xl p-8 border border-white/5 bg-dark-card/25 min-h-[300px]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-dark-border pb-3 text-brand-pink">
                Comparison Board
              </h3>
              {comparing ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3 text-dark-muted text-xs">
                  <Loader className="animate-spin text-brand-pink" size={24} />
                  <span>Annu is analyzing both formulations...</span>
                </div>
              ) : comparisonResult ? (
                <div className="space-y-4">
                  {renderMarkdown(comparisonResult)}
                </div>
              ) : (
                <div className="text-center py-20 text-xs text-dark-muted">
                  Your side-by-side comparison will appear here.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Ingredient Dictionary */}
        {activeTab === "dictionary" && (
          <motion.div
            key="dictionary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
          >
            {/* Search and Sidebar */}
            <div className="glass rounded-3xl p-6 border border-white/5 bg-dark-card/45 space-y-5 h-[480px] flex flex-col justify-between">
              <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                <h3 className="text-base font-bold text-white flex items-center space-x-2 flex-shrink-0">
                  <BookOpen className="text-brand-blue" size={18} />
                  <span>Active Dictionary</span>
                </h3>
                
                {/* Search Bar */}
                <div className="relative flex-shrink-0">
                  <input
                    type="text"
                    placeholder="Search ingredient..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-dark-deep border border-dark-border focus:border-brand-blue rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-dark-muted outline-none text-xs transition-all"
                  />
                  <Search className="absolute left-3 top-3 text-dark-muted" size={14} />
                </div>

                {/* List of Ingredients */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {filteredDictKeys.length === 0 ? (
                    <div className="text-center py-8 text-xs text-dark-muted">No ingredients found.</div>
                  ) : (
                    filteredDictKeys.map((key) => (
                      <button
                        key={key}
                        onClick={() => setSelectedDictItem(key)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all block ${
                          selectedDictItem === key
                            ? "bg-brand-blue/10 border border-brand-blue/25 text-white font-bold"
                            : "bg-white/5 border border-transparent text-dark-muted hover:text-white"
                        }`}
                      >
                        {ingredientDictionary[key].name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Detail Panel */}
            <div className="glass rounded-3xl p-8 border border-white/5 bg-dark-card/25 min-h-[480px] lg:col-span-2 space-y-6">
              {selectedDictItem && ingredientDictionary[selectedDictItem] ? (
                <div className="space-y-6">
                  {/* Title & Safety Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dark-border pb-4">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-white">
                        {ingredientDictionary[selectedDictItem].name}
                      </h3>
                      <span className="text-xs text-dark-muted font-semibold block">
                        Best suited for: <span className="text-brand-blue">{ingredientDictionary[selectedDictItem].skinTypes}</span>
                      </span>
                    </div>

                    {/* EWG Hazard Badge */}
                    <div className="flex items-center space-x-2 bg-brand-emerald/10 border border-brand-emerald/25 px-3 py-1.5 rounded-xl flex-shrink-0 self-start sm:self-center">
                      <div className="w-6 h-6 rounded-lg bg-brand-emerald text-dark-deep font-extrabold text-sm flex items-center justify-center">
                        {ingredientDictionary[selectedDictItem].rating}
                      </div>
                      <div>
                        <span className="text-[8px] text-dark-muted block uppercase tracking-wider font-bold">Safety Rating</span>
                        <span className="text-[10px] text-brand-emerald font-bold">{ingredientDictionary[selectedDictItem].ratingText}</span>
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                      <Heart size={12} className="text-brand-pink" />
                      <span>Key Benefits</span>
                    </h4>
                    <ul className="space-y-2">
                      {ingredientDictionary[selectedDictItem].benefits.map((benefit, idx) => (
                        <li key={idx} className="text-xs text-dark-muted leading-relaxed flex items-start space-x-2 font-medium">
                          <span className="text-brand-blue mt-1">•</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Annu's Tip */}
                  <div className="bg-brand-blue/5 border border-brand-blue/15 rounded-2xl p-5 flex items-start space-x-3.5">
                    <Info className="text-brand-blue flex-shrink-0 mt-0.5" size={18} />
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-brand-blue uppercase tracking-wider">Annu's Quick Tip</span>
                      <p className="text-xs text-dark-muted leading-relaxed font-medium">
                        {ingredientDictionary[selectedDictItem].tip}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-24 text-xs text-dark-muted">
                  Select an ingredient from the list to view its safety profile.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Webcam Scanner Modal */}
      <AnimatePresence>
        {showCameraModal && (
          <div className="fixed inset-0 bg-dark-deep/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-3xl p-6 max-w-lg w-full border border-white/5 bg-dark-card/95 shadow-2xl space-y-5 relative overflow-hidden"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Scan className="text-brand-violet animate-pulse" size={18} />
                  <span>Ingredient Camera Scanner</span>
                </h3>
                <button
                  type="button"
                  onClick={handleCloseScanner}
                  className="text-dark-muted hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-black border border-dark-border flex items-center justify-center">
                {cameraLoading ? (
                  <div className="flex flex-col items-center space-y-2 text-xs text-dark-muted">
                    <Loader className="animate-spin text-brand-violet" size={24} />
                    <span>Connecting camera...</span>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}

                <div className="absolute inset-4 border-2 border-dashed border-brand-violet/25 rounded-xl pointer-events-none flex items-center justify-center">
                  <div className="w-full h-0.5 bg-brand-violet/65 shadow-md shadow-brand-violet/30 absolute top-0 animate-[bounce_3s_infinite]" />
                  <div className="text-[10px] text-brand-violet font-bold bg-black/60 px-3 py-1.5 rounded-lg border border-brand-violet/20 absolute bottom-4">
                    Align ingredient list here
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCloseScanner}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl py-3 text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={cameraLoading}
                  onClick={handleCaptureAndScan}
                  className="flex-1 bg-brand-violet hover:bg-brand-purple text-white font-semibold rounded-xl py-3 text-xs transition-all flex items-center justify-center space-x-1.5 shadow-lg shadow-brand-violet/10"
                >
                  <Camera size={14} />
                  <span>Capture & Analyze</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Utilities;
