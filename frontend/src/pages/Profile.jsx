import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Sparkles,
  Camera,
  CheckCircle,
  AlertCircle,
  BarChart2,
  Cpu,
  Heart,
  Activity,
  Award,
  Settings,
  ShieldCheck
} from "lucide-react";

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account"); // 'account', 'security', 'diagnosis', 'analytics'
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Profile Form States
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    theme: user?.theme || "dark",
    defaultProvider: user?.settings?.defaultProvider || "gemini"
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
  const [profileSaving, setProfileSaving] = useState(false);

  // Password Form States
  const [pwdData, setPwdData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwdMessage, setPwdMessage] = useState({ type: "", text: "" });
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/users/analytics");
      setAnalytics(res.data.analytics);
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setProfileMessage({ type: "error", text: "Avatar image size must be less than 2MB." });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: "", text: "" });
    setProfileSaving(true);
    try {
      const res = await api.put("/users/profile", {
        name: profileData.name,
        email: profileData.email,
        theme: profileData.theme,
        avatar: avatarPreview,
        settings: {
          defaultProvider: profileData.defaultProvider
        }
      });
      setUser(res.data.user);
      setProfileMessage({ type: "success", text: "Profile details updated successfully!" });
    } catch (err) {
      setProfileMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMessage({ type: "", text: "" });

    if (pwdData.newPassword !== pwdData.confirmPassword) {
      setPwdMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setPwdSaving(true);
    try {
      await api.put("/users/change-password", {
        currentPassword: pwdData.currentPassword,
        newPassword: pwdData.newPassword,
      });
      setPwdMessage({ type: "success", text: "Password changed successfully!" });
      setPwdData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwdMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to change password",
      });
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white mb-2 flex items-center space-x-2">
          <Settings size={28} className="text-brand-violet" />
          <span>Account Settings</span>
        </h2>
        <p className="text-dark-muted text-sm font-medium">Manage your profile, change passwords, and monitor diagnostic summaries.</p>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex flex-wrap bg-dark-deep border border-dark-border p-1.5 rounded-2xl max-w-xl gap-2">
        {[
          { id: "account", label: "Account Info", icon: User },
          { id: "security", label: "Security", icon: Lock },
          { id: "diagnosis", label: "Skin & Hair Profile", icon: ShieldCheck },
          { id: "analytics", label: "Usage Stats", icon: BarChart2 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex-1 justify-center ${
              activeTab === tab.id
                ? "bg-brand-violet text-white glow-violet"
                : "text-dark-muted hover:text-white"
            }`}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="max-w-4xl">
        <AnimatePresence mode="wait">
          {/* TAB 1: Account Info */}
          {activeTab === "account" && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass rounded-3xl p-8 border border-white/5 bg-dark-card/45 space-y-6"
            >
              <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-dark-border pb-4">
                <User className="text-brand-violet" size={18} />
                <span>Profile Information</span>
              </h3>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {profileMessage.text && (
                  <div className={`p-4 rounded-xl text-sm border flex items-start space-x-3 ${
                    profileMessage.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}>
                    {profileMessage.type === "success" ? <CheckCircle size={16} className="mt-0.5" /> : <AlertCircle size={16} className="mt-0.5" />}
                    <span>{profileMessage.text}</span>
                  </div>
                )}

                {/* Avatar Upload */}
                <div className="flex items-center space-x-6">
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-brand-violet to-brand-pink p-[3px] flex-shrink-0 glow-violet group">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-dark-card flex items-center justify-center text-xl font-bold text-brand-violet">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="text-white" size={16} />
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Profile Photo</h4>
                    <p className="text-xs text-dark-muted mt-1">Upload a JPG, PNG, or GIF. Max 2MB.</p>
                  </div>
                </div>

                {/* Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-dark-muted uppercase tracking-wider">Display Name</label>
                    <input
                      type="text"
                      required
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full bg-dark-deep border border-dark-border focus:border-brand-violet rounded-xl px-4 py-3.5 text-white placeholder-dark-muted outline-none transition-all text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-dark-muted uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full bg-dark-deep border border-dark-border focus:border-brand-violet rounded-xl px-4 py-3.5 text-white placeholder-dark-muted outline-none transition-all text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-dark-muted uppercase tracking-wider">UI Theme</label>
                    <select
                      value={profileData.theme}
                      onChange={(e) => setProfileData({ ...profileData, theme: e.target.value })}
                      className="w-full bg-dark-deep border border-dark-border focus:border-brand-violet rounded-xl px-4 py-3 text-white outline-none transition-all text-xs"
                    >
                      <option value="dark">Dark Mode</option>
                      <option value="light">Light Mode</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-dark-muted uppercase tracking-wider">Default AI Engine</label>
                    <select
                      value={profileData.defaultProvider}
                      onChange={(e) => setProfileData({ ...profileData, defaultProvider: e.target.value })}
                      className="w-full bg-dark-deep border border-dark-border focus:border-brand-violet rounded-xl px-4 py-3 text-white outline-none transition-all text-xs"
                    >
                      <option value="gemini">Google Gemini 1.5</option>
                      <option value="openai">OpenAI GPT-4o</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="bg-brand-violet hover:bg-brand-purple text-white font-semibold rounded-xl px-6 py-3.5 text-xs transition-all duration-300 shadow-lg"
                >
                  {profileSaving ? "Saving Profile..." : "Save Changes"}
                </button>
              </form>
            </motion.div>
          )}

          {/* TAB 2: Security */}
          {activeTab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass rounded-3xl p-8 border border-white/5 bg-dark-card/45 space-y-6"
            >
              <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-dark-border pb-4">
                <Lock className="text-brand-pink" size={18} />
                <span>Security & Password</span>
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-6">
                {pwdMessage.text && (
                  <div className={`p-4 rounded-xl text-sm border flex items-start space-x-3 ${
                    pwdMessage.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}>
                    {pwdMessage.type === "success" ? <CheckCircle size={16} className="mt-0.5" /> : <AlertCircle size={16} className="mt-0.5" />}
                    <span>{pwdMessage.text}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-dark-muted uppercase tracking-wider">Current Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={pwdData.currentPassword}
                      onChange={(e) => setPwdData({ ...pwdData, currentPassword: e.target.value })}
                      className="w-full bg-dark-deep border border-dark-border focus:border-brand-pink rounded-xl px-4 py-3.5 text-white placeholder-dark-muted outline-none transition-all text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-dark-muted uppercase tracking-wider">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={pwdData.newPassword}
                      onChange={(e) => setPwdData({ ...pwdData, newPassword: e.target.value })}
                      className="w-full bg-dark-deep border border-dark-border focus:border-brand-pink rounded-xl px-4 py-3.5 text-white placeholder-dark-muted outline-none transition-all text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-dark-muted uppercase tracking-wider">Confirm Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={pwdData.confirmPassword}
                      onChange={(e) => setPwdData({ ...pwdData, confirmPassword: e.target.value })}
                      className="w-full bg-dark-deep border border-dark-border focus:border-brand-pink rounded-xl px-4 py-3.5 text-white placeholder-dark-muted outline-none transition-all text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={pwdSaving}
                  className="bg-brand-pink hover:bg-brand-purple text-white font-semibold rounded-xl px-6 py-3.5 text-xs transition-all duration-300 shadow-lg"
                >
                  {pwdSaving ? "Updating Password..." : "Update Password"}
                </button>
              </form>
            </motion.div>
          )}

          {/* TAB 3: Skin & Hair Profile */}
          {activeTab === "diagnosis" && (
            <motion.div
              key="diagnosis"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Skin Diagnostics */}
              <div className="glass rounded-3xl p-7 border border-white/5 bg-dark-card/40 flex flex-col justify-between min-h-[260px] relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-brand-violet">
                    <Heart size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Skin Diagnostic Profile</span>
                  </div>
                  <h4 className="text-xl font-bold text-white capitalize">
                    {user?.skinProfile?.skinType === "unknown" ? "Configure Profile" : `${user?.skinProfile?.skinType} Skin`}
                  </h4>
                  <p className="text-xs text-dark-muted leading-relaxed font-medium">
                    {user?.skinProfile?.concerns?.length > 0
                      ? `Logged concerns: ${user.skinProfile.concerns.join(", ")}.`
                      : "No concerns logged yet. Start a consultation to analyze your skin type."}
                  </p>
                </div>
                <button
                  onClick={() => navigate("/consultation")}
                  className="w-full mt-6 bg-brand-violet hover:bg-brand-purple text-white font-bold py-3.5 rounded-xl text-xs transition-all"
                >
                  Retake Skin Consultation
                </button>
              </div>

              {/* Hair Diagnostics */}
              <div className="glass rounded-3xl p-7 border border-white/5 bg-dark-card/40 flex flex-col justify-between min-h-[260px] relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-brand-pink">
                    <Activity size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Hair Diagnostic Profile</span>
                  </div>
                  <h4 className="text-xl font-bold text-white capitalize">
                    {user?.hairProfile?.hairType === "unknown" ? "Configure Profile" : `${user?.hairProfile?.hairType} Hair`}
                  </h4>
                  <p className="text-xs text-dark-muted leading-relaxed font-medium">
                    {user?.hairProfile?.concerns?.length > 0
                      ? `Logged concerns: ${user.hairProfile.concerns.join(", ")}.`
                      : "No concerns logged yet. Start a consultation to analyze your hair type."}
                  </p>
                </div>
                <button
                  onClick={() => navigate("/consultation")}
                  className="w-full mt-6 bg-brand-pink hover:bg-brand-purple text-white font-bold py-3.5 rounded-xl text-xs transition-all"
                >
                  Retake Hair Consultation
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 4: Usage Stats */}
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass rounded-3xl p-8 border border-white/5 bg-dark-card/45 space-y-6"
            >
              <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-dark-border pb-4">
                <BarChart2 className="text-brand-blue" size={18} />
                <span>Usage & Quota Analytics</span>
              </h3>

              {analyticsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-2xl shimmer" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* AI Chat Limit */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-semibold text-white">
                      <span>AI Messages Sent</span>
                      <span className="text-brand-violet font-bold">
                        {user?.usage?.aiMessagesCount || 0} {user?.subscription?.plan === "free" ? "/ 20" : ""}
                      </span>
                    </div>
                    <div className="w-full bg-dark-deep h-3 rounded-full border border-dark-border overflow-hidden p-[2px]">
                      <div
                        className="h-full bg-gradient-to-r from-brand-violet to-brand-pink rounded-full glow-violet"
                        style={{
                          width: `${
                            user?.subscription?.plan === "free"
                              ? Math.min(((user?.usage?.aiMessagesCount || 0) / 20) * 100, 100)
                              : 100
                          }%`
                        }}
                      />
                    </div>
                    {user?.subscription?.plan === "free" && (
                      <p className="text-[10px] text-dark-muted font-medium">
                        Resetting on {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Tasks Progress */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-semibold text-white">
                      <span>Task Completion Rate</span>
                      <span className="text-brand-blue font-bold">{analytics?.tasks?.completionRate || 0}%</span>
                    </div>
                    <div className="w-full bg-dark-deep h-3 rounded-full border border-dark-border overflow-hidden p-[2px]">
                      <div
                        className="h-full bg-gradient-to-r from-brand-blue to-brand-indigo rounded-full"
                        style={{ width: `${analytics?.tasks?.completionRate || 0}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-dark-muted font-medium">
                      {analytics?.tasks?.completed || 0} completed, {analytics?.tasks?.pending || 0} pending
                    </p>
                  </div>

                  {/* Notes created */}
                  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <div>
                      <h4 className="text-xs font-semibold text-white">Total Notes Created</h4>
                      <p className="text-[10px] text-dark-muted mt-0.5">Stored in Cloud DB</p>
                    </div>
                    <span className="text-xl font-bold text-brand-pink">{analytics?.notes?.total || 0}</span>
                  </div>

                  {/* CPU/API Resource Status */}
                  <div className="p-4 border border-brand-violet/15 bg-brand-purple/5 rounded-2xl space-y-3">
                    <div className="flex items-center space-x-2 text-brand-violet">
                      <Cpu size={14} className="animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">AI Engine Status</span>
                    </div>
                    <p className="text-xs text-dark-muted leading-relaxed font-medium">
                      System API channels are operating normally. Selected model:{" "}
                      <span className="text-white font-semibold capitalize">
                        {user?.settings?.defaultProvider || "gemini"}
                      </span>.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;
