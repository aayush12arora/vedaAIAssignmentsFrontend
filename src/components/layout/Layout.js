import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  Menu,
  ArrowLeft,
  Home,
  Users,
  BookOpen,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';
import Sidebar from './Sidebar';
import './Layout.css';

const getPageLabel = (pathname) => {
  if (pathname.startsWith('/paper/')) return 'Create New';
  if (pathname === '/create') return 'Create Assignment';
  return 'Assignment';
};

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const pageLabel = getPageLabel(location.pathname);
  const canGoBack = location.pathname !== '/';

  return (
    <div className="layout">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="layout-body">
        {/* Top header bar */}
        <header className="layout-header">
          <div className="lh-left">
            {/* Mobile hamburger */}
            <button
              className="lh-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            {canGoBack && (
              <button
                className="lh-back-btn"
                onClick={() => navigate(-1)}
                aria-label="Go back"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <LayoutGrid size={16} className="lh-grid-icon" />
            <span className="lh-page-title">{pageLabel}</span>
          </div>
          <div className="lh-right">
            <button className="lh-icon-btn" aria-label="Notifications">
              <Bell size={20} />
              <span className="lh-notif-dot" />
            </button>
            <div className="lh-user">
              <div className="lh-avatar">J</div>
              <span className="lh-user-name">John Doe</span>
              <ChevronDown size={14} />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="layout-main">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="mobile-bottom-nav">
          <a href="/" className="mbn-item">
            <Home size={20} />
            <span>Home</span>
          </a>
          <a href="/" className="mbn-item">
            <Users size={20} />
            <span>My Groups</span>
          </a>
          <a href="/" className="mbn-item">
            <BookOpen size={20} />
            <span>Library</span>
          </a>
          <a href="/" className="mbn-item">
            <Sparkles size={20} />
            <span>AI Toolkit</span>
          </a>
        </nav>
      </div>
    </div>
  );
};

export default Layout;
