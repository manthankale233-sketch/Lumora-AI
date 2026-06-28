import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { motion, AnimatePresence } from "framer-motion";

// Pages
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Consultation from "./pages/Consultation";
import Utilities from "./pages/Utilities";
import ProgressTracker from "./pages/ProgressTracker";
import Profile from "./pages/Profile";
import Billing from "./pages/Billing";

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-dark-deep text-dark-text overflow-hidden relative">
      {/* Background Grid Overlay */}
      <div className="absolute inset-0 bg-grid pointer-events-none z-0"></div>

      {/* Floating Background Aurora Orbs */}
      <div className="absolute -top-40 -left-40 aurora-violet rounded-full blur-[150px] opacity-15 pointer-events-none z-0"></div>
      <div className="absolute -bottom-40 -right-40 aurora-emerald rounded-full blur-[150px] opacity-15 pointer-events-none z-0"></div>

      {/* Mobile Top Header */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* Sidebar (handles both desktop and mobile drawer) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area with Page Transitions */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen relative z-10">
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }} // Smooth, slow luxury deceleration curve
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

function AppContent() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout><Dashboard /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/chat" element={
        <ProtectedRoute>
          <MainLayout><Chat /></MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/consultation" element={
        <ProtectedRoute>
          <MainLayout><Consultation /></MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/utilities" element={
        <ProtectedRoute>
          <MainLayout><Utilities /></MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/progress" element={
        <ProtectedRoute>
          <MainLayout><ProgressTracker /></MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <MainLayout><Profile /></MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/billing" element={
        <ProtectedRoute>
          <MainLayout><Billing /></MainLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
