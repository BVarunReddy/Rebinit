import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Package, Trophy, Map, Recycle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SkeletonGrid, SkeletonList } from '../components/Skeleton';
import api from '../api/axios';
import { COLORS, FONTS, FONT_IMPORT } from '../theme';

function Mascot({ size = 84 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect x="22" y="38" width="56" height="48" rx="10" fill={COLORS.accent} />
      <rect x="30" y="46" width="16" height="32" rx="4" fill={COLORS.bg} opacity="0.2" />
      <rect x="54" y="46" width="16" height="32" rx="4" fill={COLORS.bg} opacity="0.2" />
      <rect x="16" y="26" width="68" height="14" rx="7" fill={COLORS.bg} />
      <circle cx="38" cy="18" r="5" fill={COLORS.bg} />
      <circle cx="62" cy="18" r="5" fill={COLORS.bg} />
      <circle cx="45" cy="58" r="4" fill={COLORS.bg} />
      <circle cx="55" cy="58" r="4" fill={COLORS.bg} />
      <path d="M42 68 Q50 74 58 68" stroke={COLORS.bg} strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

const STATUS_COLORS = {
  Resolved: COLORS.success,
  'In Progress': '#5B9BD5',
  Reported: '#E8C547',
};

export default function Home() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [rewards, setRewards] = useState({ points: 0, rank: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/my'),
      api.get('/rewards/me'),
    ]).then(([r, rw]) => {
      setReports(r.data);
      setRewards(rw.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Reports filed', value: reports.length, accent: false },
    { label: 'Points earned', value: rewards.points, accent: true },
    { label: 'Your rank', value: `#${rewards.rank || 1}`, accent: false },
  ];

  const links = [
    { to: '/report', icon: FileText, label: 'Report Dumping', desc: 'Flag a dump site for cleanup' },
    { to: '/recycle', icon: Recycle, label: 'My Recycling', desc: 'Log an item, earn points' },
    { to: '/marketplace', icon: Package, label: 'Marketplace', desc: 'Buy and sell recyclables' },
    { to: '/rewards', icon: Trophy, label: 'Rewards', desc: 'Points and leaderboard' },
    { to: '/map', icon: Map, label: 'Map', desc: 'Collection points near you' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: FONTS.body, color: COLORS.text }}>
      <style>{FONT_IMPORT}</style>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>

        {/* Hero */}
        <div style={{ background: COLORS.surface, borderRadius: 20, padding: '28px 32px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 4, fontWeight: 500 }}>Welcome back</p>
            <h1 style={{ fontFamily: FONTS.display, fontSize: 26, fontWeight: 800, margin: '0 0 4px' }}>{user?.name}</h1>
            <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0 }}>Keep sorting, keep earning.</p>
          </div>
          <Mascot size={72} />
        </div>

        {/* Stat cards */}
        {loading
          ? <SkeletonGrid cols={3} />
          : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
              {cards.map(c => (
                <div key={c.label} style={{ background: COLORS.surface, borderRadius: 14, padding: '18px 22px' }}>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{c.label}</div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 28, fontWeight: 600, color: c.accent ? COLORS.accent : COLORS.text }}>{c.value}</div>
                </div>
              ))}
            </div>
          )
        }

        {/* Quick links — neutral icon badges, accent only on hover, so 5 links don't turn into 5 competing colors */}
        <h2 style={{ fontFamily: FONTS.display, fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Quick actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 28 }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{ textDecoration: 'none' }}>
              <div className="quick-link" style={{ background: COLORS.surface, borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'background 0.15s' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: COLORS.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <l.icon size={20} color={COLORS.accent} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.text }}>{l.label}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{l.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent reports */}
        {loading ? (
          <SkeletonList rows={3} />
        ) : reports.length > 0 && (
          <>
            <h2 style={{ fontFamily: FONTS.display, fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Recent reports</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reports.slice(0, 3).map(r => (
                <div key={r.id} style={{ background: COLORS.surface, borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>Report #{r.id} — {r.category}</div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{new Date(r.created_at).toLocaleDateString('en-IN')}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: (STATUS_COLORS[r.status] || COLORS.textMuted) + '22', color: STATUS_COLORS[r.status] || COLORS.textMuted }}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <style>{`.quick-link:hover { background: ${COLORS.surfaceAlt} !important; }`}</style>
    </div>
  );
}