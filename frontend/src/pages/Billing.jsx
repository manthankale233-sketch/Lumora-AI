import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  CreditCard,
  Sparkles,
  Zap,
  Loader,
  ShieldCheck,
  Award,
  Wallet
} from "lucide-react";

const Billing = () => {
  const { user, setUser } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState("");
  
  // Sandbox Modal States
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Card Form States
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState(user?.name || "");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const handleSubscribeClick = (planName, planPrice) => {
    setSelectedPlan(planName);
    setSelectedPrice(planPrice);
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setPaymentSuccess(false);
    setShowSandboxModal(true);
  };

  // Format Card Number (adds spaces)
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    let matches = value.match(/\d{4,16}/g);
    let match = (matches && matches[0]) || "";
    let parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(" "));
    } else {
      setCardNumber(value);
    }
  };

  // Format Expiry Date (adds slash)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\//g, "").replace(/[^0-9]/gi, "");
    if (value.length >= 2) {
      setCardExpiry(value.substring(0, 2) + "/" + value.substring(2, 4));
    } else {
      setCardExpiry(value);
    }
  };

  const handleSandboxSubmit = async (e) => {
    e.preventDefault();
    setLoadingPlan(selectedPlan);

    // Simulate payment authorization delay
    setTimeout(async () => {
      try {
        const res = await api.post("/payments/sandbox-subscribe", { plan: selectedPlan });
        setUser(res.data.user);
        setPaymentSuccess(true);
        
        // Close modal after success animation
        setTimeout(() => {
          setShowSandboxModal(false);
          setLoadingPlan("");
        }, 1800);
      } catch (err) {
        console.error("Sandbox subscription failed", err);
        alert("Payment authorization failed. Please try again.");
        setLoadingPlan("");
      }
    }, 2000);
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your premium subscription?")) return;
    setLoadingPlan("cancel");
    try {
      const res = await api.post("/payments/sandbox-subscribe", { plan: "free" });
      setUser(res.data.user);
    } catch (err) {
      console.error("Failed to cancel subscription", err);
      alert("Failed to cancel subscription. Please try again.");
    } finally {
      setLoadingPlan("");
    }
  };

  const tiers = [
    {
      name: "free",
      title: "Basic",
      price: "$0",
      period: "forever",
      description: "For individuals looking to explore basic skincare tracking.",
      features: [
        "10 AI messages / day",
        "Standard Skincare Routine",
        "Webcam Ingredient Scanner",
        "Basic Product Comparison",
        "Skin Progress Log"
      ],
      actionLabel: "Current Plan",
      premium: false,
      color: "border-white/5 bg-dark-card/30"
    },
    {
      name: "pro",
      title: "Pro Care",
      price: "$9.99",
      period: "month",
      description: "For users wanting unlimited AI reasoning and full analysis.",
      features: [
        "Unlimited AI messages with Annu",
        "Personalized Hair & Scalp Consultation",
        "Detailed ingredient toxicity analysis",
        "Interactive Before/After Progress Slider",
        "Advanced skin rating trend charts",
        "Priority AI channel speed"
      ],
      actionLabel: "Upgrade to Pro",
      premium: true,
      color: "border-brand-violet/20 bg-gradient-to-b from-brand-purple/10 to-transparent glow-violet"
    },
    {
      name: "enterprise",
      title: "Derm Expert",
      price: "$29.99",
      period: "month",
      description: "For skincare professionals and clinics managing multiple clients.",
      features: [
        "Everything in Pro plan",
        "Multi-profile family tracking",
        "Exportable PDF skin reports",
        "Dedicated database clusters",
        "Early access to new AI diagnostic tools"
      ],
      actionLabel: "Go Derm Expert",
      premium: false,
      color: "border-brand-pink/20 bg-gradient-to-b from-brand-pink/5 to-transparent glow-pink"
    }
  ];

  return (
    <div className="space-y-10 pb-24">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 bg-brand-violet/10 text-brand-violet px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          <CreditCard size={12} />
          <span>Billing System</span>
        </div>
        <h2 className="text-4xl font-extrabold text-white tracking-tight">
          Unlock Your <span className="bg-gradient-to-r from-brand-violet via-brand-pink to-brand-blue bg-clip-text text-transparent">Premium Glow</span>
        </h2>
        <p className="text-dark-muted font-medium text-sm leading-relaxed">
          Upgrade your plan to unlock unlimited AI chats, advanced progress trend charts, and the interactive before/after slider.
        </p>
      </div>

      {/* Current subscription alert banner */}
      {user?.subscription?.status === "active" && (
        <div className="max-w-4xl mx-auto glass rounded-3xl p-6 border border-brand-emerald/25 bg-brand-emerald/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-brand-emerald/10 text-brand-emerald rounded-2xl">
              <Zap size={20} className="fill-brand-emerald" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                Active {user.subscription.plan.toUpperCase()} Plan (Sandbox Mode)
              </h4>
              <p className="text-xs text-dark-muted mt-0.5 font-medium">
                Subscription ID: <span className="font-mono text-white">{user.subscription.stripeSubscriptionId}</span>. 
                {user.subscription.currentPeriodEnd && ` Next renewal date: ${new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleCancelSubscription}
            disabled={loadingPlan !== ""}
            className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 font-bold rounded-xl px-5 py-3 text-xs transition-all duration-300 flex items-center space-x-2"
          >
            {loadingPlan === "cancel" ? <Loader className="animate-spin" size={14} /> : null}
            <span>Cancel Subscription</span>
          </button>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch pt-6">
        {tiers.map((tier) => {
          const isCurrentPlan = user?.subscription?.plan === tier.name || (tier.name === "free" && (!user?.subscription || user?.subscription?.status !== "active"));
          const isProOrEntActive = user?.subscription?.status === "active" && (user?.subscription?.plan === "pro" || user?.subscription?.plan === "enterprise");

          return (
            <motion.div
              key={tier.name}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className={`glass rounded-3xl p-8 border flex flex-col justify-between relative ${tier.color} ${
                tier.premium ? "md:scale-105 md:z-10" : ""
              }`}
            >
              {/* Premium Ribbon */}
              {tier.premium && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-violet to-brand-pink text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-white capitalize">{tier.title}</h3>
                  <p className="text-xs text-dark-muted mt-2 leading-relaxed font-medium">{tier.description}</p>
                </div>

                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                  <span className="text-xs text-dark-muted font-medium">/ {tier.period}</span>
                </div>

                <ul className="space-y-3.5 pt-4 border-t border-dark-border">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start space-x-3 text-xs text-dark-text leading-tight font-medium">
                      <Check className="text-brand-violet flex-shrink-0 mt-0.5" size={14} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full bg-white/5 border border-white/5 text-dark-muted font-bold rounded-2xl py-4 text-xs select-none"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribeClick(tier.name, tier.price)}
                    disabled={tier.name === "free" || loadingPlan !== "" || (isProOrEntActive && tier.name === "pro")}
                    className={`w-full font-bold rounded-2xl py-4 text-xs transition-all duration-300 flex items-center justify-center space-x-2 ${
                      tier.premium
                        ? "bg-gradient-to-r from-brand-violet to-brand-purple hover:from-brand-purple hover:to-brand-pink text-white shadow-lg shadow-brand-violet/15"
                        : tier.name === "free"
                        ? "bg-white/5 border border-white/5 text-dark-muted"
                        : "bg-white text-dark-deep hover:bg-brand-violet hover:text-white"
                    }`}
                  >
                    {loadingPlan === tier.name ? (
                      <Loader className="animate-spin" size={14} />
                    ) : null}
                    <span>{tier.actionLabel}</span>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Sandbox Credit Card Modal */}
      <AnimatePresence>
        {showSandboxModal && (
          <div className="fixed inset-0 bg-dark-deep/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-3xl p-8 max-w-md w-full border border-white/5 bg-dark-card/95 shadow-2xl space-y-6 relative"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Wallet className="text-brand-violet" size={20} />
                  <span>Sandbox Secure Checkout</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowSandboxModal(false)}
                  className="text-dark-muted hover:text-white"
                >
                  ✕
                </button>
              </div>

              {paymentSuccess ? (
                <div className="py-12 text-center space-y-4 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-brand-emerald/10 border-2 border-brand-emerald text-brand-emerald flex items-center justify-center animate-[bounce_1s_infinite]">
                    <Check size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-white">Payment Authorized!</h4>
                  <p className="text-xs text-dark-muted font-medium">Your premium plan has been successfully activated.</p>
                </div>
              ) : (
                <form onSubmit={handleSandboxSubmit} className="space-y-6">
                  {/* Interactive Credit Card Graphic */}
                  <div className="perspective-1000 w-full h-44 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                    <div
                      className={`relative w-full h-full rounded-2xl duration-500 transform-style-3d ${
                        isFlipped ? "rotate-y-180" : ""
                      }`}
                    >
                      {/* Card Front */}
                      <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-pink p-5 flex flex-col justify-between text-white backface-hidden shadow-xl border border-white/15">
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <span className="text-[9px] uppercase tracking-widest text-white/60 font-bold">Lumora Card</span>
                            <h4 className="text-xs font-extrabold tracking-wider capitalize">{selectedPlan} Member</h4>
                          </div>
                          <Sparkles size={18} className="text-white/80" />
                        </div>

                        <div className="text-lg font-bold tracking-widest font-mono">
                          {cardNumber || "•••• •••• •••• ••••"}
                        </div>

                        <div className="flex justify-between items-center text-[10px]">
                          <div>
                            <span className="text-[8px] text-white/50 block uppercase tracking-wider">Card Holder</span>
                            <span className="font-semibold uppercase">{cardName || "Your Name"}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] text-white/50 block uppercase tracking-wider">Expires</span>
                            <span className="font-semibold">{cardExpiry || "MM/YY"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Back */}
                      <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-tr from-dark-card to-[#1d163d] p-5 flex flex-col justify-between text-white backface-hidden rotate-y-180 shadow-xl border border-white/10">
                        <div className="w-full h-8 bg-black/40 -mx-5 mt-2" />
                        <div className="flex justify-end items-center space-x-3">
                          <span className="text-[8px] text-white/40 uppercase tracking-wider">CVV</span>
                          <div className="bg-white text-dark-deep font-bold font-mono px-3 py-1 rounded text-xs">
                            {cardCvv || "•••"}
                          </div>
                        </div>
                        <div className="text-[8px] text-white/35 leading-tight font-medium">
                          This is a secure sandbox transaction. No real funds will be charged. Clicking authorize will simulate a successful subscription.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Inputs */}
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        onFocus={() => setIsFlipped(false)}
                        className="w-full bg-dark-deep border border-dark-border focus:border-brand-violet rounded-xl px-4 py-3 text-white placeholder-dark-muted outline-none text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">Card Number</label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        onFocus={() => setIsFlipped(false)}
                        className="w-full bg-dark-deep border border-dark-border focus:border-brand-violet rounded-xl px-4 py-3 text-white placeholder-dark-muted outline-none text-xs font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">Expiration Date</label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          onFocus={() => setIsFlipped(false)}
                          className="w-full bg-dark-deep border border-dark-border focus:border-brand-violet rounded-xl px-4 py-3 text-white placeholder-dark-muted outline-none text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-dark-muted uppercase tracking-wider">CVV</label>
                        <input
                          type="password"
                          required
                          maxLength={3}
                          placeholder="123"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ""))}
                          onFocus={() => setIsFlipped(true)}
                          className="w-full bg-dark-deep border border-dark-border focus:border-brand-violet rounded-xl px-4 py-3 text-white placeholder-dark-muted outline-none text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loadingPlan !== ""}
                    className="w-full bg-gradient-to-r from-brand-violet to-brand-purple hover:from-brand-purple hover:to-brand-pink text-white font-semibold rounded-2xl py-4 transition-all duration-300 shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {loadingPlan !== "" ? <Loader className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                    <span>{loadingPlan !== "" ? "Authorizing Sandbox Payment..." : `Authorize Sandbox Pay (${selectedPrice})`}</span>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Billing;
