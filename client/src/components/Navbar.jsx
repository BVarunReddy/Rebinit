import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, Trophy, Map, ShieldCheck, LogOut, Bell, Package, User, Menu, X, Recycle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { COLORS, FONTS, FONT_IMPORT } from '../theme';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get('/notifications/unread-count')
      .then(r => setUnread(r.data.count))
      .catch(() => {});
  }, [user, location.pathname]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/report', icon: FileText, label: 'Report Dumping' },
    { to: '/recycle', icon: Recycle, label: 'My Recycling' },
    { to: '/marketplace', icon: Package, label: 'Market' },
    { to: '/rewards', icon: Trophy, label: 'Rewards' },
    { to: '/map', icon: Map, label: 'Map' },
    ...(user?.role === 'admin' ? [{ to: '/admin', icon: ShieldCheck, label: 'Admin' }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{FONT_IMPORT}</style>
      <nav style={{
        background: COLORS.surface, color: COLORS.text,
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: FONTS.body, position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* Logo — single accent color, no rainbow letters */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: COLORS.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Recycle size={15} color={COLORS.bg} />
          </div>
          <span style={{ fontFamily: FONTS.display, fontSize: 17, fontWeight: 800, color: COLORS.text }}>
            Rebinit
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="desktop-nav">
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 10px', borderRadius: 8,
                background: isActive(l.to) ? COLORS.surfaceAlt : 'transparent',
                color: isActive(l.to) ? COLORS.accent : COLORS.textMuted,
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
              }}>
                <l.icon size={14} />{l.label}
              </div>
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link to="/notifications" style={{ textDecoration: 'none', position: 'relative' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: isActive('/notifications') ? COLORS.surfaceAlt : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Bell size={16} color={COLORS.textMuted} />
              {unread > 0 && (
                <div style={{ position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: '50%', background: COLORS.accent, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unread > 9 ? '9+' : unread}
                </div>
              )}
            </div>
          </Link>

          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: isActive('/profile') ? COLORS.surfaceAlt : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <User size={16} color={COLORS.textMuted} />
            </div>
          </Link>

          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '6px 10px', color: COLORS.textMuted, cursor: 'pointer', fontSize: 12, fontFamily: FONTS.body }}>
            <LogOut size={13} /> Logout
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            className="hamburger"
          >
            {menuOpen ? <X size={20} color={COLORS.text} /> : <Menu size={20} color={COLORS.text} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: COLORS.surface, padding: '12px 24px 20px', position: 'sticky', top: 56, zIndex: 99 }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', color: isActive(l.to) ? COLORS.accent : COLORS.textMuted, fontSize: 14, fontWeight: 500, borderBottom: `1px solid ${COLORS.border}` }}>
                <l.icon size={16} />{l.label}
              </div>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}