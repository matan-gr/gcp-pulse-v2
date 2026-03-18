
import React, { useState } from 'react';
import { 
  ExternalLink, 
  Search, 
  Bookmark, 
  Terminal, 
  Database, 
  Shield, 
  Globe, 
  Cpu, 
  Layout, 
  Cloud, 
  Zap, 
  MessageSquare, 
  Settings, 
  Activity, 
  BarChart3, 
  Lock,
  FileText,
  Server,
  Key,
  Eye,
  CreditCard,
  Layers,
  Box,
  Share2,
  ShieldAlert,
  HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Shortcut {
  title: string;
  url: string;
  category: 'Compute' | 'Storage' | 'Networking' | 'Security' | 'Operations' | 'AI' | 'Billing' | 'Databases';
  description: string;
  icon: React.ElementType;
}

const SHORTCUTS: Shortcut[] = [
  {
    title: 'Compute Engine',
    url: 'https://console.cloud.google.com/compute/instances',
    category: 'Compute',
    description: 'Manage VM instances, disks, and machine images.',
    icon: Cpu
  },
  {
    title: 'GKE Clusters',
    url: 'https://console.cloud.google.com/kubernetes/list',
    category: 'Compute',
    description: 'Manage Kubernetes clusters and workloads.',
    icon: Layout
  },
  {
    title: 'Cloud Run',
    url: 'https://console.cloud.google.com/run',
    category: 'Compute',
    description: 'Build and deploy scalable containerized apps.',
    icon: Cloud
  },
  {
    title: 'Cloud Functions',
    url: 'https://console.cloud.google.com/functions/list',
    category: 'Compute',
    description: 'Event-driven serverless functions.',
    icon: Zap
  },
  {
    title: 'Cloud Storage',
    url: 'https://console.cloud.google.com/storage/browser',
    category: 'Storage',
    description: 'Object storage for all your data.',
    icon: HardDrive
  },
  {
    title: 'Cloud SQL',
    url: 'https://console.cloud.google.com/sql/instances',
    category: 'Databases',
    description: 'Managed MySQL, PostgreSQL, and SQL Server.',
    icon: Database
  },
  {
    title: 'Firestore',
    url: 'https://console.cloud.google.com/firestore/data',
    category: 'Databases',
    description: 'NoSQL document database for mobile and web.',
    icon: Layers
  },
  {
    title: 'VPC Networks',
    url: 'https://console.cloud.google.com/networking/networks/list',
    category: 'Networking',
    description: 'Manage virtual networks, subnets, and firewalls.',
    icon: Globe
  },
  {
    title: 'Load Balancing',
    url: 'https://console.cloud.google.com/net-services/loadbalancing/list',
    category: 'Networking',
    description: 'Distribute traffic across your applications.',
    icon: Share2
  },
  {
    title: 'Cloud IAM',
    url: 'https://console.cloud.google.com/iam-admin/iam',
    category: 'Security',
    description: 'Manage permissions and service accounts.',
    icon: Shield
  },
  {
    title: 'Secret Manager',
    url: 'https://console.cloud.google.com/security/secret-manager',
    category: 'Security',
    description: 'Store and manage sensitive information.',
    icon: Key
  },
  {
    title: 'Cloud Logging',
    url: 'https://console.cloud.google.com/logs/query',
    category: 'Operations',
    description: 'Real-time log management and analysis.',
    icon: FileText
  },
  {
    title: 'Cloud Monitoring',
    url: 'https://console.cloud.google.com/monitoring',
    category: 'Operations',
    description: 'Full-stack monitoring and alerting.',
    icon: BarChart3
  },
  {
    title: 'Vertex AI',
    url: 'https://console.cloud.google.com/vertex-ai',
    category: 'AI',
    description: 'Unified AI platform for ML development.',
    icon: Zap
  },
  {
    title: 'Billing Overview',
    url: 'https://console.cloud.google.com/billing',
    category: 'Billing',
    description: 'Manage costs, budgets, and invoices.',
    icon: CreditCard
  },
  {
    title: 'Cloud Shell',
    url: 'https://shell.cloud.google.com/?show=terminal',
    category: 'Operations',
    description: 'Interactive shell environment for Google Cloud.',
    icon: Terminal
  },
  {
    title: 'Service Health',
    url: 'https://console.cloud.google.com/servicehealth',
    category: 'Operations',
    description: 'Status of Google Cloud services.',
    icon: Activity
  },
  {
    title: 'Security Command Center',
    url: 'https://console.cloud.google.com/security/command-center',
    category: 'Security',
    description: 'Security management and data risk platform.',
    icon: ShieldAlert
  }
];

export const ConsoleShortcuts: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(SHORTCUTS.map(s => s.category))).sort();

  const filteredShortcuts = SHORTCUTS.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                         s.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Bookmark className="text-blue-600" size={24} />
              Console Shortcuts
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Quick access to the most used Google Cloud Console pages.</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search shortcuts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              !activeCategory 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredShortcuts.map((shortcut) => (
              <motion.a
                key={shortcut.title}
                href={shortcut.url}
                target="_blank"
                rel="noopener noreferrer"
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-500/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <shortcut.icon className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <ExternalLink className="text-slate-300 group-hover:text-blue-500 transition-colors" size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {shortcut.title}
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-900 rounded">
                      {shortcut.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {shortcut.description}
                  </p>
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </div>

        {filteredShortcuts.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-400" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No shortcuts found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Try adjusting your search or category filter.</p>
          </div>
        )}
      </div>
      
      <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2">
        <Zap size={14} className="text-amber-500" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pro Tip: Use Cmd+K in the console for even faster navigation</p>
      </div>
    </div>
  );
};
