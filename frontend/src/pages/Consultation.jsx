import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "../utils/soundEffects";
import {
  Sparkles,
  Heart,
  Activity,
  Award,
  ChevronRight,
  ChevronLeft,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sun,
  Moon
} from "lucide-react";

const Consultation = () => {
  const [activeType, setActiveType] = useState(null); // 'skin' or 'hair'
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [latestConsultation, setLatestConsultation] = useState(null);
  const [loadingLatest, setLoadingLatest] = useState(true);

  // Questionnaire configurations
  const skinQuestions = [
    {
      key: "skinType",
      question: "What is your primary skin type?",
      options: [
        { value: "dry", label: "🏜️ Dry (feels tight, flaky)" },
        { value: "oily", label: "💦 Oily (shiny, excess sebum)" },
        { value: "combination", label: "⚖️ Combination (oily T-zone, dry cheeks)" },
        { value: "sensitive", label: "🛡️ Sensitive (redness, reacts easily)" },
        { value: "normal", label: "✨ Normal (balanced, healthy)" }
      ]
    },
    {
      key: "concerns",
      question: "Select your main skin concerns:",
      isMulti: true,
      options: [
        { value: "acne", label: "🔴 Acne & Breakouts" },
        { value: "pigmentation", label: "🟤 Dark Spots & Pigmentation" },
        { value: "aging", label: "⏳ Fine Lines & Wrinkles" },
        { value: "redness", label: "🔥 Redness & Inflammation" },
        { value: "pores", label: "🔍 Enlarged Pores" },
        { value: "dullness", label: "☁️ Dullness / Lack of Glow" }
      ]
    },
    {
      key: "budget",
      question: "What is your budget preference for products?",
      options: [
        { value: "low", label: "💵 Budget-friendly (Drugstore)" },
        { value: "medium", label: "💳 Mid-range (Effective & Accessible)" },
        { value: "high", label: "💎 Premium / Clinical grade" }
      ]
    }
  ];

  const hairQuestions = [
    {
      key: "hairType",
      question: "What is your natural hair pattern?",
      options: [
        { value: "straight", label: "👩‍🦰 Straight (1A - 1C)" },
        { value: "wavy", label: "👩‍🦱 Wavy (2A - 2C)" },
        { value: "curly", label: "👩‍🦱 Curly (3A - 3C)" },
        { value: "coily", label: "👩‍🦱 Coily / Kinky (4A - 4C)" }
      ]
    },
    {
      key: "scalpType",
      question: "What is your scalp condition?",
      options: [
        { value: "dry", label: "🏜️ Dry & Itchy" },
        { value: "oily", label: "💦 Oily (greasy after 1 day)" },
        { value: "normal", label: "✨ Normal / Balanced" },
        { value: "dandruff-prone", label: "❄️ Dandruff & Flaky" }
      ]
    },
    {
      key: "concerns",
      question: "Select your main hair/scalp concerns:",
      isMulti: true,
      options: [
        { value: "hairfall", label: "📉 Hair Fall & Thinning" },
        { value: "frizz", label: "⚡ Frizz & Dryness" },
        { value: "split-ends", label: "✂️ Damaged Ends / Breakage" },
        { value: "growth", label: "🌱 Slow Hair Growth" },
        { value: "dandruff", label: "❄️ Dandruff & Scaling" }
      ]
    },
    {
      key: "budget",
      question: "What is your budget preference for hair products?",
      options: [
        { value: "low", label: "💵 Budget-friendly (Drugstore)" },
        { value: "medium", label: "💳 Mid-range (Salon Quality)" },
        { value: "high", label: "💎 Premium / Luxury Care" }
      ]
    }
  ];

  useEffect(() => {
    fetchLatest();
  }, []);

  const fetchLatest = async () => {
    try {
      const res = await api.get("/consultations/latest");
      setLatestConsultation(res.data.consultation);
    } catch (err) {
      console.error("Failed to fetch latest consultation", err);
    } finally {
      setLoadingLatest(false);
    }
  };

  const handleOptionSelect = (key, value, isMulti) => {
    playSound("click");
    if (isMulti) {
      const current = answers[key] || [];
      if (current.includes(value)) {
        setAnswers({ ...answers, [key]: current.filter((v) => v !== value) });
      } else {
        setAnswers({ ...answers, [key]: [...current, value] });
      }
    } else {
      setAnswers({ ...answers, [key]: value });
    }
  };

  const currentQuestions = activeType === "skin" ? skinQuestions : hairQuestions;

  const handleNext = () => {
    if (step < currentQuestions.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      setActiveType(null);
      setAnswers({});
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.post("/consultations", {
        type: activeType,
        answers,
      });
      setLatestConsultation(res.data.consultation);
      setActiveType(null);
      setAnswers({});
      setStep(0);
      playSound("success");
    } catch (err) {
      console.error("Submit consultation failed", err);
      alert("Consultation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderAnalysisMarkdown = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      if (line.startsWith("### ")) {
        return <h4 key={i} className="text-sm font-bold text-white mt-5 mb-2.5">{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("## ")) {
        return <h3 key={i} className="text-base font-extrabold text-brand-violet mt-7 mb-3 border-b border-white/5 pb-2">{line.replace("## ", "")}</h3>;
      }
      if (line.startsWith("- ")) {
        return <li key={i} className="text-xs text-dark-muted ml-4 list-disc mb-1.5 leading-relaxed font-medium">{line.replace("- ", "")}</li>;
      }
      return <p key={i} className="text-xs text-dark-muted leading-relaxed mb-3.5 font-medium">{line}</p>;
    });
  };

  return (
    <div className="space-y-8 pb-24 relative min-h-screen">
      
      <div>
        <h2 className="text-3xl font-extrabold text-white mb-2 flex items-center space-x-2">
          <Sparkles size={28} className="text-brand-violet" />
          <span>AI Consultation</span>
        </h2>
        <p className="text-dark-muted text-sm font-medium">Get a personalized routine and product recommendations from Annu 💜.</p>
      </div>

      <AnimatePresence mode="wait">
        {/* Loading Portal with Annu Avatar */}
        {submitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark-deep/95 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-6"
          >
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-t-brand-violet border-r-brand-pink border-b-brand-blue border-l-transparent rounded-full animate-spin glow-violet"></div>
              <img src="/annu_avatar.jpg" alt="Annu" className="w-20 h-20 rounded-full object-cover border-2 border-dark-deep shadow-2xl animate-pulse" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white flex items-center justify-center space-x-2">
                <span>Annu is analyzing your profile</span>
                <span className="text-brand-violet">💜</span>
              </h3>
              <p className="text-dark-muted text-sm mt-1.5 font-medium">Creating custom routines and matching ingredient formulations...</p>
            </div>
          </motion.div>
        )}

        {!activeType && !submitting && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="glass rounded-2xl p-4 border border-brand-violet/15 bg-brand-purple/5 flex items-center space-x-3 text-brand-violet max-w-4xl">
              <ShieldAlert size={18} className="flex-shrink-0" />
              <p className="text-xs font-semibold">
                Annu is a friendly AI skin & hair care assistant. She is NOT a doctor. Please consult a dermatologist for medical concerns.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
              <div
                onClick={() => {
                  setActiveType("skin");
                  setStep(0);
                }}
                className="glass rounded-3xl p-8 border border-white/5 bg-dark-card/45 hover:border-brand-violet/30 transition-all duration-300 cursor-pointer group flex flex-col justify-between h-72"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-brand-violet/10 text-brand-violet rounded-2xl flex items-center justify-center glow-violet group-hover:scale-105 transition-transform">
                    <Heart size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-brand-violet transition-colors">Skincare Consultation</h3>
                    <p className="text-xs text-dark-muted mt-2 leading-relaxed font-medium">
                      Analyze skin type, address concerns like acne or aging, and build a personalized morning/night routine.
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-xs text-brand-violet font-bold uppercase tracking-wider space-x-2">
                  <span>Start Assessment</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div
                onClick={() => {
                  setActiveType("hair");
                  setStep(0);
                }}
                className="glass rounded-3xl p-8 border border-white/5 bg-dark-card/45 hover:border-brand-pink/30 transition-all duration-300 cursor-pointer group flex flex-col justify-between h-72"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-brand-pink/10 text-brand-pink rounded-2xl flex items-center justify-center glow-pink group-hover:scale-105 transition-transform">
                    <Activity size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-brand-pink transition-colors">Haircare Consultation</h3>
                    <p className="text-xs text-dark-muted mt-2 leading-relaxed font-medium">
                      Analyze hair patterns, scalp types, combat hairfall or frizz, and receive salon-grade product recommendations.
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-xs text-brand-pink font-bold uppercase tracking-wider space-x-2">
                  <span>Start Assessment</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {latestConsultation && (
              <div className="glass rounded-3xl p-8 border border-white/5 bg-dark-card/25 max-w-4xl space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-dark-border">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Award size={20} className="text-brand-violet" />
                    <span>Your Latest Recommendation</span>
                  </h3>
                  <span className="text-[10px] bg-white/5 text-dark-muted px-3 py-1 rounded-md font-bold uppercase tracking-wider">
                    {new Date(latestConsultation.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider text-brand-violet">AI Analysis & Product Recommendations</h4>
                    <div className="prose prose-invert max-w-none">
                      {renderAnalysisMarkdown(latestConsultation.analysis)}
                    </div>
                  </div>

                  {/* Connected Routine Timeline */}
                  <div className="space-y-6">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider text-brand-pink flex items-center space-x-2">
                      <Clock size={14} />
                      <span>Recommended Routine</span>
                    </h4>
                    <div className="relative pl-6 space-y-6 border-l border-dashed border-dark-border/60">
                      {latestConsultation.recommendedRoutine.map((stepItem, idx) => (
                        <div key={idx} className="relative group">
                          {/* Timeline dot */}
                          <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-dark-deep flex items-center justify-center shadow-lg ${
                            stepItem.timeOfDay === "morning"
                              ? "bg-amber-400 text-dark-deep"
                              : "bg-brand-violet text-white"
                          }`}>
                            {stepItem.timeOfDay === "morning" ? (
                              <Sun size={8} className="fill-current" />
                            ) : (
                              <Moon size={8} className="fill-current" />
                            )}
                          </div>

                          <div className="glass-light rounded-2xl p-4.5 border border-white/5 hover:border-brand-violet/25 transition-all duration-300 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                stepItem.timeOfDay === "morning"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/15"
                                  : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15"
                              }`}>
                                {stepItem.timeOfDay}
                              </span>
                              <span className="text-[9px] text-dark-muted font-bold">Step {stepItem.stepNumber}</span>
                            </div>
                            <h5 className="text-xs font-bold text-white group-hover:text-brand-violet transition-colors">{stepItem.productName}</h5>
                            <p className="text-[10px] text-dark-muted leading-relaxed font-medium">{stepItem.instructions}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeType && !submitting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-xl mx-auto glass rounded-3xl p-8 border border-white/5 bg-dark-card/50 shadow-2xl space-y-8"
          >
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-dark-muted font-bold uppercase tracking-wider">
                <span>Step {step + 1} of {currentQuestions.length}</span>
                <span>{Math.round(((step + 1) / currentQuestions.length) * 100)}% Complete</span>
              </div>
              <div className="h-1.5 w-full bg-dark-deep rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-violet to-brand-pink transition-all duration-300"
                  style={{ width: `${((step + 1) / currentQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">
                {currentQuestions[step].question}
              </h3>
              
              <div className="space-y-3">
                {currentQuestions[step].options.map((opt) => {
                  const isMulti = currentQuestions[step].isMulti;
                  const currentSelected = answers[currentQuestions[step].key];
                  const isSelected = isMulti
                    ? currentSelected?.includes(opt.value)
                    : currentSelected === opt.value;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleOptionSelect(currentQuestions[step].key, opt.value, isMulti)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 text-sm font-semibold flex items-center justify-between ${
                        isSelected
                          ? "bg-brand-violet/10 border-brand-violet text-white glow-violet"
                          : "bg-dark-deep/50 border-dark-border text-dark-muted hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand-violet" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-dark-border">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center space-x-1.5 text-xs font-bold text-dark-muted hover:text-white transition-colors"
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!answers[currentQuestions[step].key] || answers[currentQuestions[step].key].length === 0}
                className="flex items-center space-x-1.5 bg-brand-violet hover:bg-brand-purple disabled:opacity-40 disabled:hover:bg-brand-violet text-white px-5 py-3 rounded-xl text-xs font-bold transition-all"
              >
                <span>{step === currentQuestions.length - 1 ? "Submit" : "Next"}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Consultation;
