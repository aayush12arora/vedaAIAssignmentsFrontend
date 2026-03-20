import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  FileText,
  Sparkles,
  BookOpen,
  Settings,
  Sparkles as CreateSparkles,
  X,
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ mobileOpen, onClose }) => {
  const navigate = useNavigate();

  const navItems = [
    { to: '/', icon: Home, label: 'Home', type: 'link' },
    { to: '/', icon: Users, label: 'My Groups', type: 'link' },
    { to: '/', icon: FileText, label: 'Assignments', type: 'nav', end: true },
    { to: '/', icon: Sparkles, label: "AI Teacher's Toolkit", type: 'link' },
    { to: '/', icon: BookOpen, label: 'My Library', type: 'link' },
  ];

  const handleCreate = () => {
    navigate('/create');
    onClose?.();
  };

  return (
    <>
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}
      <aside className={`sidebar${mobileOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar-logo-row">
          <Link to="/" className="sidebar-logo" onClick={onClose}>
            <div className="sidebar-logo-icon" aria-hidden="true">
              <svg viewBox="0 0 40 40" className="sidebar-logo-svg" role="img">
                <defs>
                  <linearGradient id="vedaLogoBg" x1="5" y1="4" x2="35" y2="36" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#ff8d62" />
                    <stop offset="0.45" stopColor="#d5531b" />
                    <stop offset="1" stopColor="#6a2316" />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="40" height="40" rx="10" fill="url(#vedaLogoBg)" />
                <path d="M7.5 10.5h8.1l4.7 16.1 3.3-9.3h8.9L24.1 30h-7.4L7.5 10.5Z" fill="#ffffff" />
              </svg>
            </div>
            <span className="sidebar-logo-name">VedaAI</span>
          </Link>
          {mobileOpen && (
            <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="sidebar-create-wrap">
          <button className="sidebar-create-btn" onClick={handleCreate}>
            <CreateSparkles size={17} />
            Create Assignment
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;

            if (item.type === 'nav') {
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `sn-link${isActive ? ' sn-link--active' : ''}`}
                  onClick={onClose}
                >
                  <Icon size={23} strokeWidth={2.15} />
                  <span>{item.label}</span>
                </NavLink>
              );
            }

            return (
              <Link key={item.label} to={item.to} className="sn-link" onClick={onClose}>
                <Icon size={23} strokeWidth={2.15} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <Link to="/" className="sn-link sn-link--settings" onClick={onClose}>
            <Settings size={23} strokeWidth={2.15} />
            <span>Settings</span>
          </Link>
          <div className="sidebar-school-card">
            <div className="school-avatar" aria-hidden="true">
              <div className="school-avatar-ring">
                <svg viewBox="0 0 52 52" className="school-avatar-svg" role="img">
                  <circle cx="26" cy="26" r="26" fill="#ffd8cc" />
                  <circle cx="26" cy="21" r="10" fill="#f3b08d" />
                  <path d="M13 41c2.8-7.7 9.1-11.6 13-11.6S36.2 33.3 39 41" fill="#c7c7c7" />
                  <path d="M18 18c1.2-5.1 4.7-8.1 8-8.1 4.6 0 8.7 3.8 8.7 10.4 0 6.1-2.2 11.1-8.7 11.1-4.9 0-8.4-3.3-8.4-8.4 0-1.7.1-3.1.4-5Z" fill="#d28a54" opacity="0.72" />
                </svg>
              </div>
            </div>
            <div className="school-info">
              <p className="school-name">Delhi Public School</p>
              <p className="school-city">Bokaro Steel City</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
