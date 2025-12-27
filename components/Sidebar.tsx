import React from 'react';
import { Terminal, Bug, Box, FileCode, Zap, Layers, Crown, Settings } from 'lucide-react';
import { AppMode, UserTier } from '../types';

interface SidebarProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  tier: UserTier;
  setTier: (tier: UserTier) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mode, setMode, tier, setTier }) => {
  const menuItems = [
    { id: AppMode.GENERATOR, icon: Terminal, label: 'Generator', labelAr: 'توليد الكود' },
    { id: AppMode.DEBUGGER, icon: Bug, label: 'Debugger', labelAr: 'تصحيح' },
    { id: AppMode.REFACTOR, icon: Layers, label: 'Refactor', labelAr: 'إعادة هيكلة' },
    { id: AppMode.EXPLAINER, icon: FileCode, label: 'Explain', labelAr: 'شرح' },
  ];

  return (
    <div className="w-20 lg:w-64 h-full bg-dark-surface border-r border-dark-border flex flex-col justify-between transition-all duration-300 z-20">
      <div>
        {/* Header */}
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-dark-border">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-neon-blue to-neon-purple flex items-center justify-center shadow-lg shadow-neon-blue/20">
            <Zap className="text-white w-5 h-5" fill="white" />
          </div>
          <span className="hidden lg:block ml-3 font-bold text-lg tracking-wider text-white">
            Ultra<span className="text-neon-blue">Code</span>
          </span>
        </div>

        {/* Menu */}
        <nav className="mt-6 flex flex-col gap-2 px-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id)}
              className={`flex items-center p-3 rounded-xl transition-all duration-200 group relative
                ${mode === item.id 
                  ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/30' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <item.icon className={`w-5 h-5 ${mode === item.id ? 'animate-pulse' : ''}`} />
              <span className="hidden lg:block ml-3 font-medium">{item.label}</span>
              
              {/* Tooltip for mobile */}
              <div className="lg:hidden absolute left-14 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-gray-700 pointer-events-none">
                {item.label}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tier & Settings */}
      <div className="p-4 border-t border-dark-border">
        <div className={`rounded-xl p-4 mb-4 border transition-all duration-500 cursor-pointer overflow-hidden relative group
          ${tier === 'PRO' 
            ? 'bg-gradient-to-br from-neon-purple/20 to-blue-900/20 border-neon-purple/50' 
            : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}
            onClick={() => setTier(tier === 'FREE' ? 'PRO' : 'FREE')}
        >
          <div className="flex items-center gap-3 relative z-10">
            <div className={`p-2 rounded-lg ${tier === 'PRO' ? 'bg-neon-purple text-white' : 'bg-gray-800 text-gray-400'}`}>
              <Crown className="w-5 h-5" />
            </div>
            <div className="hidden lg:block">
              <p className={`text-sm font-bold ${tier === 'PRO' ? 'text-white' : 'text-gray-300'}`}>
                {tier === 'PRO' ? 'Ultra PRO' : 'Free Plan'}
              </p>
              <p className="text-xs text-gray-500">
                {tier === 'PRO' ? 'Unlimited Speed' : 'Click to Upgrade'}
              </p>
            </div>
          </div>
          
          {/* Futuristic background effect for Pro */}
          {tier === 'PRO' && (
            <div className="absolute top-0 right-0 w-20 h-20 bg-neon-purple/30 blur-2xl -mr-10 -mt-10 animate-pulse-slow"></div>
          )}
        </div>
        
        <button className="w-full flex items-center justify-center lg:justify-start p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
            <Settings className="w-5 h-5" />
            <span className="hidden lg:block ml-3 text-sm">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;