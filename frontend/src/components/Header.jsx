import React from "react";
import { Menu, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-dark-border bg-[#05030a]/95 backdrop-blur-md px-6 flex items-center justify-between md:hidden w-full z-30 flex-shrink-0">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="p-1.5 text-dark-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-tr from-brand-purple to-brand-pink p-1.5 rounded-lg flex items-center justify-center">
            <Sparkles className="text-white" size={14} />
          </div>
          <span className="text-base font-bold bg-gradient-to-r from-white via-brand-indigo to-brand-pink bg-clip-text text-transparent">
            Lumora AI
          </span>
        </div>
      </div>

      {/* User Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-blue to-brand-purple p-[1px]">
        {user?.avatar ? (
          <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
        ) : (
          <div className="w-full h-full rounded-full bg-dark-card flex items-center justify-center text-xs font-bold text-brand-violet">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
