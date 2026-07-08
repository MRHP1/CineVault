import React from 'react';

interface SidebarProps {
  currentView: 'home' | 'library' | 'settings' | 'player' | 'series-detail';
  setCurrentView: (view: 'home' | 'library' | 'settings' | 'player' | 'series-detail') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        CINEVAULT
      </div>
      <nav>
        <div 
          className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
          onClick={() => setCurrentView('home')}
        >
          Home
        </div>
        <div 
          className={`nav-item ${currentView === 'library' ? 'active' : ''}`}
          onClick={() => setCurrentView('library')}
        >
          Library
        </div>
        <div 
          className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
          onClick={() => setCurrentView('settings')}
        >
          Settings
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
