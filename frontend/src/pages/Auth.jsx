import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Sparkles, ArrowRight, AlertCircle } from "lucide-react";

const Auth = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-deep bg-mesh flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Floating Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full filter blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-pink/15 rounded-full filter blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-gradient-to-tr from-brand-purple to-brand-pink p-3 rounded-2xl glow-violet mb-4">
            <Sparkles className="text-white h-6 w-6 animate-spin-slow" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Welcome to <span className="bg-gradient-to-r from-brand-violet to-brand-pink bg-clip-text text-transparent">Lumora AI</span>
          </h1>
          <p className="text-dark-muted text-sm font-medium">
            {isLogin ? "Your AI-powered workspace awaits" : "Create your account to get started"}
          </p>
        </div>

        {/* Card Container */}
        <div className="glass rounded-3xl p-8 shadow-2xl relative border border-white/5 bg-dark-card/60 backdrop-blur-2xl">
          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? "login" : "register"}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start space-x-3 text-red-400 text-sm"
                >
                  <AlertCircle className="flex-shrink-0 mt-0.5" size={16} />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Name field (Register only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-dark-muted uppercase tracking-wider">Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-dark-deep/50 border border-dark-border focus:border-brand-violet rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-dark-muted outline-none transition-all focus:ring-1 focus:ring-brand-violet"
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-dark-muted uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-dark-deep/50 border border-dark-border focus:border-brand-violet rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-dark-muted outline-none transition-all focus:ring-1 focus:ring-brand-violet"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-dark-muted uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-dark-deep/50 border border-dark-border focus:border-brand-violet rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-dark-muted outline-none transition-all focus:ring-1 focus:ring-brand-violet"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-brand-violet to-brand-purple hover:from-brand-purple hover:to-brand-pink text-white font-semibold rounded-xl py-4 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-brand-violet/20 disabled:opacity-50 group"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>{isLogin ? "Sign In" : "Create Account"}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </motion.form>
          </AnimatePresence>

          {/* Toggle Link */}
          <div className="mt-8 pt-6 border-t border-dark-border text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-sm font-medium text-dark-muted hover:text-brand-violet transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
