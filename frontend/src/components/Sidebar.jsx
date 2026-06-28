import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Activity,
  Camera,
  User,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Palette
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Theme Switching Logic
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem("theme") || "amethyst");

  const changeTheme = (themeName) => {
    setCurrentTheme(themeName);
    localStorage.setItem("theme", themeName);
    if (themeName === "amethyst") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", themeName);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "amethyst";
    if (savedTheme === "amethyst") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "AI Consultation", path: "/consultation", icon: Sparkles },
    { name: "Chat with Annu 💜", path: "/chat", icon: MessageSquare },
    { name: "Diagnostics", path: "/utilities", icon: Activity },
    { name: "Progress Tracker", path: "/progress", icon: Camera },
    { name: "Billing", path: "/billing", icon: CreditCard },
    { name: "Profile", path: "/profile", icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const sidebarVariants = {
    expanded: { width: "260px" },
    collapsed: { width: "80px" }
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.div
        initial={isCollapsed ? "collapsed" : "expanded"}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed md:relative top-0 bottom-0 left-0 h-screen bg-[#05030a] border-r border-dark-border flex flex-col flex-shrink-0 z-50 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{ width: isOpen ? "260px" : undefined }}
      >
        {/* Collapse Toggle Button (Desktop only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-6 -right-3 bg-dark-card border border-dark-border rounded-full p-1 text-dark-muted hover:text-brand-violet hover:border-brand-violet transition-colors z-30 shadow-lg hidden md:block"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Brand Logo & Header */}
        <div className="p-6 flex items-center justify-between border-b border-dark-border h-20">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-brand-purple to-brand-pink p-2 rounded-xl flex items-center justify-center glow-violet">
              <Sparkles className="text-white" size={20} />
            </div>
            {(!isCollapsed || isOpen) && (
              <span className="text-xl font-bold bg-gradient-to-r from-white via-brand-indigo to-brand-pink bg-clip-text text-transparent">
                Lumora AI
              </span>
            )}
          </div>

          {/* Mobile Close Button */}
          {isOpen && (
            <button
              onClick={onClose}
              className="p-1 text-dark-muted hover:text-white md:hidden transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Nav Menu Items */}
        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center space-x-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all relative group ${
                  isActive
                    ? "bg-white/10 border border-white/15"
                    : "hover:bg-white/5"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={20}
                    style={{ color: isActive ? "var(--color-brand-violet)" : "#94a3b8" }}
                    className="transition-colors group-hover:text-brand-violet"
                  />
                  {(!isCollapsed || isOpen) && (
                    <span
                      className="origin-left"
                      style={{ color: isActive ? "#ffffff" : "#e2e8f0" }}
                    >
                      {item.name}
                    </span>
                  )}

                  {/* Active Indicator Bar */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 w-1 h-6 bg-brand-violet rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Theme Selector Widget */}
        {(!isCollapsed || isOpen) && (
          <div className="px-6 py-4 border-t border-dark-border space-y-2.5">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block flex items-center space-x-1">
              <Palette size={10} />
              <span>Theme Preset</span>
            </span>
            <div className="flex space-x-3">
              {[
                { name: "amethyst", color: "bg-purple-500 shadow-purple-500/20" },
                { name: "emerald", color: "bg-emerald-500 shadow-emerald-500/20" },
                { name: "gold", color: "bg-amber-500 shadow-amber-500/20" },
                { name: "rose", color: "bg-pink-500 shadow-pink-500/20" }
              ].map((t) => (
                <button
                  key={t.name}
                  onClick={() => changeTheme(t.name)}
                  className={`w-5 h-5 rounded-full ${t.color} border transition-all shadow-md cursor-pointer ${
                    currentTheme === t.name
                      ? "border-white scale-110 ring-2 ring-white/15"
                      : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                  title={t.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* User Footer Profile */}
        <div className="p-4 border-t border-dark-border space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-blue to-brand-purple p-[2px] flex-shrink-0 relative group">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-dark-card flex items-center justify-center text-sm font-bold text-brand-violet">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-brand-emerald rounded-full border-2 border-dark-deep" />
            </div>
            {(!isCollapsed || isOpen) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: "#ffffff" }}>{user?.name}</p>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-brand-violet)" }}>
                  {user?.subscription?.plan || "free"} Plan
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-4 px-4 py-3.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <LogOut size={20} />
            {(!isCollapsed || isOpen) && (
              <span>Logout</span>
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
