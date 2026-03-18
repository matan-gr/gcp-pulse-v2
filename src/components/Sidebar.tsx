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
  X, 
  Zap,
  Sparkles,
  Bookmark,
  Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';
import { Tooltip } from './ui/Tooltip';

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

  const menuItems = [
    { id: 'all', label: 'Discover Feed', icon: Compass, hint: 'Personalized feed aggregating all GCP sources.' },
    { id: 'weekly-brief', label: 'Weekly Brief', icon: Sparkles, badge: 'AI Generated', hint: 'AI-curated summary of the past week\'s most important updates.' },
    { id: 'updates', label: 'Updates & Innovation', icon: Rocket, hint: 'Focus on new product launches and innovative features.' },
    { id: 'cloud-blog', label: 'Cloud Blog', icon: BookOpen, hint: 'Latest news and stories from the official Google Cloud Blog.' },
    { id: 'release-notes', label: 'Release Notes', icon: FileText, hint: 'Technical documentation of changes across all GCP products.' },
    { id: 'deprecations', label: 'Product Deprecations', icon: CalendarOff, hint: 'Track upcoming service retirements and migration paths.' },
    { id: 'youtube', label: 'GCP YouTube Channel', icon: Youtube, hint: 'Video content and tutorials from the Google Cloud YouTube channel.' },
    { id: 'incidents', label: 'Cloud Incidents', icon: Activity, hint: 'Real-time status updates and incident reports.' },
    { id: 'security', label: 'Security Bulletins', icon: ShieldAlert, hint: 'Critical security updates and vulnerability reports.' },
    { id: 'architecture', label: 'Architecture', icon: Layers, hint: 'Best practices and reference architectures for GCP.' },
  ];

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
            className={`fixed top-0 left-0 h-full w-72 bg-[var(--color-bg-sidebar)] dark:bg-[var(--color-bg-sidebar-dark)] border-r border-[var(--color-border)] dark:border-[var(--color-border-dark)] z-[50] flex flex-col`}
          >
            {/* Logo Area */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
              <div className="flex items-center space-x-2 group cursor-pointer">
                <div className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                  <Zap size={18} className="text-white" />
                </div>
                <span className="text-lg font-medium text-[var(--color-text)] dark:text-[var(--color-text-dark)] tracking-tight">GCP Pulse</span>
              </div>

              {/* Mobile Close Button */}
              {!isDesktop && (
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] dark:hover:bg-[var(--color-bg-hover-dark)] rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto custom-scrollbar">
              
              {/* Main Menu */}
              <div>
                <div className="flex items-center px-4 mb-2">
                  <span className="text-[11px] font-semibold text-[var(--color-text-muted)] dark:text-[var(--color-text-muted-dark)] uppercase tracking-wider">Menu</span>
                </div>
                <div className="space-y-1">
                  {menuItems.map((item) => {
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
                        <Tooltip content={item.hint || ''} position="right" delay={0.5}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-3">
                              <Icon size={18} className={isActive ? 'text-[var(--color-primary)] dark:text-blue-500' : 'text-[var(--color-text-muted)] dark:text-[var(--color-text-muted-dark)] group-hover:text-[var(--color-primary)] dark:group-hover:text-blue-500'} />
                              <span>{item.label}</span>
                            </div>
                            {item.badge && (
                              <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ml-2 border transition-all duration-300",
                                isActive 
                                  ? "bg-blue-100 dark:bg-blue-500/30 text-[var(--color-primary)] dark:text-blue-400 border-[var(--color-primary)]/20" 
                                  : "bg-[var(--color-bg-hover)] dark:bg-[var(--color-bg-card-dark)] text-[var(--color-text-muted)] dark:text-[var(--color-text-muted-dark)] border-[var(--color-border)] dark:border-[var(--color-border-dark)]"
                              )}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </Tooltip>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Personal Section */}
              <div>
                <div className="flex items-center px-4 mb-2">
                  <span className="text-[11px] font-semibold text-[var(--color-text-muted)] dark:text-[var(--color-text-muted-dark)] uppercase tracking-wider">Workspace</span>
                </div>
                <div className="space-y-1">
                  {[
                    { id: 'saved', label: 'Read Later', icon: Bookmark },
                    { id: 'tools', label: 'Tools', icon: Wrench },
                  ].map((item) => {
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
                        <div className="flex items-center space-x-3">
                          <Icon size={18} className={isActive ? 'text-[var(--color-primary)] dark:text-blue-400' : 'text-[var(--color-text-muted)] dark:text-[var(--color-text-muted-dark)] group-hover:text-[var(--color-primary)] dark:group-hover:text-blue-400'} />
                          <span>{item.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </nav>
            
            {/* Sidebar Footer */}
            <div className="h-16 flex items-center border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)] px-6">
               <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2 text-[11px] font-semibold text-[var(--color-text-muted)] dark:text-[var(--color-text-muted-dark)] uppercase tracking-wider">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-brand-secondary)] animate-pulse" />
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
