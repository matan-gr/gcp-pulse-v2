import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Rocket, 
  BookOpen, 
  FileText, 
  CalendarOff, 
  Youtube, 
  Activity, 
  ShieldAlert, 
  Layers, 
  Database,
  Bookmark, 
  Wrench, 
  X, 
  Zap,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isPresentationMode: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isDesktopOpen: boolean;
}

export const Sidebar = React.memo<SidebarProps>(({ 
  activeTab, 
  setActiveTab, 
  isPresentationMode,
  isOpen,
  setIsOpen,
  isDesktopOpen
}) => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) setIsOpen(false); // Close mobile menu state when switching to desktop
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsOpen]);

  const platformItems = [
    { id: 'all', label: 'Discover Feed', icon: Compass },
    { id: 'weekly-brief', label: 'Weekly Brief', icon: Sparkles, badge: 'AI Generated' },
  ];

  const cloudBlogItems = [
    { id: 'cloud-blog', label: 'Main Blog', icon: BookOpen },
    { id: 'blog-ai', label: 'AI & Machine Learning', icon: Zap },
    { id: 'blog-data', label: 'Data & Analytics', icon: Layers },
    { id: 'blog-databases', label: 'Databases', icon: Database },
    { id: 'blog-containers', label: 'Containers & GKE', icon: Rocket },
    { id: 'blog-networking', label: 'Networking', icon: Activity },
    { id: 'blog-security', label: 'Security & Identity', icon: ShieldAlert },
    { id: 'medium-blog', label: 'Medium Blog', icon: BookOpen },
    { id: 'press-corner', label: 'Press Corner', icon: FileText },
  ];

  const technicalItems = [
    { id: 'release-notes', label: 'Release Notes', icon: FileText },
    { id: 'gemini-enterprise', label: 'Gemini Enterprise', icon: Sparkles },
    { id: 'updates', label: 'Product Updates', icon: Rocket },
    { id: 'ai-research', label: 'AI Research', icon: Sparkles },
    { id: 'deprecations', label: 'Product Deprecations', icon: CalendarOff },
    { id: 'security', label: 'Security Bulletins', icon: ShieldAlert },
    { id: 'architecture', label: 'Architecture Center', icon: Layers },
    { id: 'youtube', label: 'GCP YouTube', icon: Youtube },
    { id: 'incidents', label: 'Cloud Incidents', icon: Activity },
  ];

  const personalItems = [
    { id: 'saved', label: 'Read Later', icon: Bookmark },
    { id: 'tools', label: 'Tools', icon: Wrench },
  ];

  const renderNavGroup = (title: string, items: typeof platformItems) => (
    <div className="mb-6">
      <div className="flex items-center px-4 mb-2">
        <span className="text-[10px] font-bold text-[#5f6368] dark:text-[var(--color-text-muted-dark)] uppercase tracking-widest">{title}</span>
      </div>
      <div className="space-y-0.5">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                if (!isDesktop) setIsOpen(false);
              }}
              className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <Icon size={16} className={isActive ? 'text-[#1a73e8] dark:text-blue-500' : 'text-[#5f6368] dark:text-[var(--color-text-muted-dark)] group-hover:text-[#1a73e8] dark:group-hover:text-blue-500'} />
                  <span className="text-sm font-medium truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ml-2 border transition-all duration-300",
                    isActive 
                      ? "bg-[#d2e3fc] dark:bg-blue-500/30 text-[#1a73e8] dark:text-blue-400 border-[#1a73e8]/20" 
                      : "bg-[#f1f3f4] dark:bg-[var(--color-bg-card-dark)] text-[#5f6368] dark:text-[var(--color-text-muted-dark)] border-[#dadce0] dark:border-[var(--color-border-dark)]"
                  )}>
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar Container */}
      <AnimatePresence>
        {((isDesktop && isDesktopOpen) || (!isDesktop && isOpen)) && (
          <motion.div 
            initial={isDesktop ? { x: -280, opacity: 0 } : { x: -280 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed top-0 left-0 h-full w-72 bg-[var(--color-bg-sidebar)] dark:bg-[var(--color-bg-sidebar-dark)] border-r border-[#dadce0] dark:border-[var(--color-border-dark)] z-[50] flex flex-col`}
          >
            {/* Logo Area */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-[#dadce0] dark:border-[var(--color-border-dark)]">
              <div className="flex items-center space-x-2 group cursor-pointer">
                <div className="w-8 h-8 bg-[#1a73e8] rounded-full flex items-center justify-center">
                  <Zap size={18} className="text-white" />
                </div>
                <span className="text-lg font-medium text-[#202124] dark:text-[var(--color-text-dark)] tracking-tight">GCP Pulse</span>
              </div>

              {/* Mobile Close Button */}
              {!isDesktop && (
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-[#5f6368] hover:bg-[#f1f3f4] dark:hover:bg-[var(--color-bg-card-dark)] rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
              {renderNavGroup("Intelligence", platformItems)}
              {renderNavGroup("Cloud Blog", cloudBlogItems)}
              {renderNavGroup("Technical Updates", technicalItems)}
              {renderNavGroup("Workspace", personalItems)}
            </nav>
            
            {/* Sidebar Footer */}
            <div className="h-16 flex items-center border-t border-[#dadce0] dark:border-[var(--color-border-dark)] px-6">
               <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2 text-[11px] font-semibold text-[#5f6368] dark:text-[var(--color-text-muted-dark)] uppercase tracking-wider">
                    <div className="w-2 h-2 rounded-full bg-[#188038] animate-pulse" />
                    <span>Live</span>
                  </div>
               </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Overlay for mobile */}
      {isOpen && !isDesktop && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-[45]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
});
