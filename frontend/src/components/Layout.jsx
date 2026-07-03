import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import HeroIcon from './HeroIcon';
import { getEcologyAvatar } from '../utils/avatar';
import './Layout.css';

export default function Layout({ children, title, subtitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const isGuest = user?.isGuest || user?.email === 'guest@smartcity.local';

  useEffect(() => {
    const timer = setTimeout(() => {
      const selectors = [
        '[data-reveal]',
        '.layout-page-title',
        '.mon-section',
        '.mon-card',
        '.lay-section',
        '.lay-card',
        '.pub-panel',
        '.pub-card',
        '.stat-card',
        '.overview-card',
        '.chart-card',
        '.admin-card',
        '.peta-card',
        '.ud-card',
        '.ll-card',
        '.trans-card',
        '.air-card',
        '.energi-card',
        '.sampah-card',
        '.profile-card'
      ];
      const items = Array.from(document.querySelectorAll(selectors.join(',')));

      items.forEach((item, index) => {
        if (!item.hasAttribute('data-reveal')) {
          item.setAttribute('data-reveal', 'fade-up');
          item.style.setProperty('--reveal-delay', `${(index % 8) * 50}ms`);
        }
      });

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '0px 0px -5% 0px',
        threshold: 0.05,
      });

      items.forEach((item) => observer.observe(item));
      return () => observer.disconnect();
    }, 40);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const closeProfileMenu = () => setProfileOpen(false);

  const handleLogin = () => {
    logout();
    closeProfileMenu();
    navigate('/login');
  };

  const handleEditProfile = () => {
    closeProfileMenu();
    navigate('/profil?edit=1');
  };

  const handleSignOut = () => {
    logout();
    closeProfileMenu();
    navigate('/login');
  };

  const dashboardTools = (
    <>
      <button className="layout-notification" type="button" aria-label="Notifikasi">
        <HeroIcon name="bell" />
      </button>
      <div className={`layout-profile-menu ${profileOpen ? 'open' : ''}`}>
        <button
          className="layout-profile"
          type="button"
          aria-label="Menu profil pengguna"
          aria-expanded={profileOpen}
          onClick={() => setProfileOpen(open => !open)}
        >
          <img src={user?.foto_profile || getEcologyAvatar(user?.nama)} className="layout-avatar-img" alt="Avatar" />
        </button>
        <div className="layout-profile-dropdown">
          <div className="layout-dropdown-info">
            <span className="layout-dropdown-name">{user?.nama || 'Pengguna'}</span>
            <span className="layout-dropdown-role">{isGuest ? 'guest demo' : user?.role || 'warga'}</span>
          </div>
          {isGuest ? (
            <button type="button" onClick={handleLogin}>Log In</button>
          ) : (
            <button type="button" onClick={handleEditProfile}>Edit Profile</button>
          )}
          <button type="button" onClick={handleSignOut}>Sign Out</button>
        </div>
      </div>
    </>
  );

  return (
    <div className="layout">
      <header className="layout-topbar">
        <div className="layout-topbar-inner">
          <Sidebar mobileActions={dashboardTools} />

          <div className="layout-tools" aria-label="Dashboard tools">
            {dashboardTools}
          </div>
        </div>
      </header>

      <main className="layout-main">
        {(title || subtitle) && (
          <div className="layout-page-title">
            {title && <h1 className="layout-title">{title}</h1>}
            {subtitle && <p className="layout-subtitle">{subtitle}</p>}
          </div>
        )}
        <div className="layout-content">{children}</div>
      </main>
    </div>
  );
}
