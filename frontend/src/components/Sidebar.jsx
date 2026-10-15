import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, BarChart2, CloudRain, TrendingUp,
  Table, Info, Droplets
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',            label: 'Dashboard',          icon: LayoutDashboard },
  { to: '/analysis',    label: 'Rainfall Analysis',  icon: BarChart2 },
  { to: '/seasonal',    label: 'Seasonal Analysis',  icon: CloudRain },
  { to: '/statistics',  label: 'Statistics',         icon: TrendingUp },
  { to: '/explorer',    label: 'Data Explorer',      icon: Table },
  { to: '/about',       label: 'About & Methods',    icon: Info },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-64 z-30 flex flex-col"
           style={{ background: 'linear-gradient(180deg, #0a0f1e 0%, #0d1528 100%)' }}>
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40
                          flex items-center justify-center">
            <Droplets size={18} className="text-teal-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">RainfallViz</p>
            <p className="text-slate-500 text-xs">India 1901–2015</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
          Navigation
        </p>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-xs text-slate-600 leading-relaxed">
          Data: India Meteorological Department
          <br />
          Source: data.gov.in
        </p>
      </div>
    </aside>
  );
}
