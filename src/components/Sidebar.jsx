import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    Home, User, Globe, MessageSquare, Waves, Activity, AlertTriangle,
    LogOut, Droplets, Shield, Gem, Settings, Target, Camera, Database, Cpu, HelpCircle, Layers,
    Smartphone, Plus, Users, Aperture
} from 'lucide-react'

const navItems = [
    { to: '/', icon: Home, label: 'Monitor', id: 'nav-monitor' },
    { to: '/scanner', icon: Camera, label: 'AI Scanner', id: 'nav-scanner' },
    { to: '/ai-camera', icon: Aperture, label: 'AI Camera', id: 'nav-aicamera' },
    { to: '/family', icon: Users, label: 'Family Safety', id: 'nav-family' },
    { to: '/profile', icon: User, label: 'Inspector', id: 'nav-inspector' },
    { to: '/leaderboard', icon: Globe, label: 'Global Standings', id: 'nav-standings' },
    { to: '/social', icon: MessageSquare, label: 'Community', id: 'nav-community' },
    { to: '/spectroscopy', icon: Database, label: 'Spectroscopy DB', id: 'nav-spectroscopy' },
    { to: '/hardware-demo', icon: Cpu, label: 'Hardware Demo', id: 'nav-hardware' },
    { to: '/music', icon: Waves, label: 'Acoustic Analytics', id: 'nav-acoustic' },
    { to: '/stats', icon: Activity, label: 'Purity Trends', id: 'nav-trends' },
    { to: '/safety', icon: AlertTriangle, label: 'Incident Reports', id: 'nav-complaints' },
    { to: '/planner', icon: Target, label: 'Protocols', id: 'nav-protocols' },
    { to: '/quiz', icon: HelpCircle, label: 'Safety Quiz', id: 'nav-quiz' },
    { to: '/architecture', icon: Layers, label: 'System Control', id: 'nav-architecture' },
]

import { X } from 'lucide-react'

export default function Sidebar({ isOpen, onClose }) {
    const { user, profile, demoLogout, userRole } = useAuth()

    const filteredNavItems = navItems.map(item => {
        if (item.id === 'nav-complaints' && userRole !== 'admin') {
            return { ...item, label: 'Report Issue' };
        }
        if (item.id === 'nav-acoustic' && userRole === 'admin') {
            return { ...item, label: 'Acoustic Desk' };
        }
        if (item.id === 'nav-complaints' && userRole === 'admin') {
            return { ...item, label: 'Complaints Desk' };
        }
        return item;
    }).filter(item => {
        // Family Safety is citizen-only
        if (item.id === 'nav-family' && userRole === 'admin') return false;
        if (userRole === 'admin') return true;
        // Citizen sees: Monitor, Scanner, Family Safety, Community, Trends, Quiz
        return ['nav-monitor', 'nav-scanner', 'nav-family', 'nav-community', 'nav-trends', 'nav-quiz'].includes(item.id);
    });

    return (
        <aside className={`fixed lg:static left-0 top-0 bottom-0 w-64 bg-dark-950/95 backdrop-blur-2xl border-r border-white/5 flex flex-col z-50 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}>
            {/* Logo */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Droplets className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="font-display text-xl font-bold text-white tracking-tight">AquaPure</span>
                        <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3 text-blue-400" />
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Secure Monitor</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="lg:hidden p-2 rounded-lg bg-white/5 text-gray-500 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* User Card */}
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <img
                        src={profile?.avatar || user?.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun'}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full border-2 border-blue-500/50 p-0.5"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">
                            {profile?.name || user?.user_metadata?.full_name || 'Inspector Arjun'}
                        </div>
                        <div className="flex items-center gap-1">
                            <Gem className="w-3 h-3 text-blue-400" />
                            <span className="text-xs text-blue-400 font-medium">
                                {userRole === 'admin' ? 'Senior Inspector' : 'Verified Citizen'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                {filteredNavItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        id={item.id}
                        end={item.to === '/'}
                        className={({ isActive }) =>
                            isActive ? 'sidebar-link-active' : 'sidebar-link'
                        }
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Trust Metrics */}
            <div className="p-4 border-t border-white/5">
                <div className="glass-card p-3 mb-3 bg-blue-500/5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Trust Score</span>
                        <span className="text-sm font-bold text-blue-400">850 🛡️</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">Verification Days</span>
                        <span className="text-sm font-bold text-cyan-400">12 🗓️</span>
                    </div>
                </div>




                <button
                    onClick={demoLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Log Out</span>
                </button>
            </div>
        </aside>
    )
}
