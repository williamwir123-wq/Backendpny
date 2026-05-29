import { Link, NavLink, useLocation } from 'react-router-dom';
import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import HeroIcon from './HeroIcon';
import './Sidebar.css';

const navGroups = [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    items: [{ to: '/dashboard', icon: 'dashboard', label: 'Dashboard Kota' }],
  },
  {
    label: 'Monitoring',
    icon: 'map',
    items: [
      { to: '/peta', icon: 'map', label: 'Peta Interaktif' },
      { to: '/udara', icon: 'cloud', label: 'Kualitas Udara' },
      { to: '/lalu-lintas', icon: 'road', label: 'Lalu Lintas' },
      { to: '/transportasi', icon: 'truck', label: 'Transportasi' },
      { to: '/energi', icon: 'energy', label: 'Energi' },
      { to: '/air-bersih', icon: 'water', label: 'Air Bersih' },
      { to: '/sampah', icon: 'trash', label: 'Sampah' },
    ],
  },
  {
    label: 'Layanan',
    icon: 'government',
    items: [
      { to: '/layanan-kota', icon: 'government', label: 'Layanan Kota' },
      { to: '/layanan-publik', icon: 'health', label: 'Layanan Publik' },
    ],
  },
  {
    label: 'Akun',
    icon: 'profile',
    items: [{ to: '/profil', icon: 'profile', label: 'Profil Saya' }],
  },
  {
    label: 'Admin',
    icon: 'admin',
    adminOnly: true,
    items: [{ to: '/admin', icon: 'admin', label: 'Panel Admin' }],
  },
];

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const groups = navGroups.filter(group => !group.adminOnly || user?.role === 'admin');

  const isGroupActive = (group) => group.items.some(item => location.pathname === item.to);
  const toggleSearch = () => {
    setSearchOpen(open => {
      const nextOpen = !open;
      if (nextOpen) {
        window.setTimeout(() => searchInputRef.current?.focus(), 0);
      }
      return nextOpen;
    });
  };

  return (
    <header className="dashboard-nav">
      <div className="dashboard-nav-inner">
        <Link className="dashboard-nav-brand" to="/dashboard" aria-label="Dashboard Smart City">
          <BrandLogo compact className="dashboard-nav-logo" />
        </Link>

        <nav className={`dashboard-nav-menu ${searchOpen ? 'searching' : ''}`} aria-label="Navigasi dashboard">
          <label className={`dashboard-nav-search ${searchOpen ? 'open' : ''}`}>
            <button
              type="button"
              aria-label={searchOpen ? 'Tutup search dashboard' : 'Buka search dashboard'}
              onClick={toggleSearch}
            >
              <HeroIcon name="search" />
            </button>
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search dashboard"
              aria-label="Search dashboard"
              onBlur={(event) => {
                if (!event.target.value) setSearchOpen(false);
              }}
            />
          </label>

          {groups.map(group => (
            <div className={`dashboard-nav-group ${isGroupActive(group) ? 'active' : ''}`} key={group.label}>
              {group.items.length === 1 ? (
                <NavLink to={group.items[0].to} className={({ isActive }) => `dashboard-nav-trigger ${isActive ? 'active' : ''}`}>
                  <HeroIcon name={group.icon} />
                  <span>{group.label}</span>
                </NavLink>
              ) : (
                <>
                  <button className="dashboard-nav-trigger" type="button">
                    <HeroIcon name={group.icon} />
                    <span>{group.label}</span>
                    <HeroIcon name="chevronDown" className="dashboard-nav-caret" />
                  </button>
                  <div className="dashboard-nav-dropdown">
                    {group.items.map(item => (
                      <NavLink key={item.to} to={item.to} className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
                        <span className="dashboard-nav-item-icon"><HeroIcon name={item.icon} /></span>
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
}
