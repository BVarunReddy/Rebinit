import React, { useEffect, useState } from 'react';
import { Plus, X, Upload, MapPin, Package, Phone, Mail, MessageCircle, CheckCircle2, Trash2, Search, SlidersHorizontal, RefreshCw, AlertCircle } from 'lucide-react';
import api, { getImageUrl } from '../api/axios';
import toast from 'react-hot-toast';
import { SkeletonGrid } from '../components/Skeleton';
import { COLORS, CATEGORY_COLORS, FONTS, FONT_IMPORT } from '../theme';

const CATEGORIES = ['paper', 'plastic', 'organic', 'glass', 'ewaste', 'metal', 'textile', 'trash'];
const SELLABLE_CATEGORIES = CATEGORIES.filter(c => c !== 'trash');

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [view, setView] = useState('browse');
  const [form, setForm] = useState({ title: '', category: 'plastic', description: '', quantity: '', location: '', price: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [contactItem, setContactItem] = useState(null);

  // Debounce search/location/price so we're not firing a request on every keystroke
  useEffect(() => {
    const t = setTimeout(() => fetchListings(), 400);
    return () => clearTimeout(t);
  }, [filter, search, location, minPrice, maxPrice]);

  useEffect(() => { if (view === 'mine') fetchMyListings(); }, [view]);

  async function fetchListings() {
    setLoading(true);
    setLoadError(false);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('category', filter);
      if (search) params.set('search', search);
      if (location) params.set('location', location);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      const res = await api.get(`/listings?${params.toString()}`);
      setListings(res.data);
    } catch {
      setLoadError(true);
    } finally { setLoading(false); }
  }

  async function fetchMyListings() {
    try {
      const res = await api.get('/listings/my');
      setMyListings(res.data);
    } catch { toast.error('Failed to load your listings'); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (image) data.append('image', image);
      await api.post('/listings', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Listing created!');
      setShowForm(false);
      setForm({ title: '', category: 'plastic', description: '', quantity: '', location: '', price: '' });
      setImage(null); setPreview(null);
      fetchListings();
    } catch { toast.error('Failed to create listing'); }
    finally { setSubmitting(false); }
  }

  async function markSold(id) {
    try {
      await api.patch(`/listings/${id}/status`, { status: 'Sold' });
      setMyListings(prev => prev.map(l => l.id === id ? { ...l, status: 'Sold' } : l));
      toast.success('Marked as sold!');
    } catch { toast.error('Failed to update listing'); }
  }

  async function removeListing(id) {
    if (!window.confirm('Delete this listing permanently?')) return;
    try {
      await api.delete(`/listings/${id}`);
      setMyListings(prev => prev.filter(l => l.id !== id));
      toast.success('Listing deleted');
    } catch { toast.error('Failed to delete listing'); }
  }

  function clearFilters() {
    setFilter('all'); setSearch(''); setLocation(''); setMinPrice(''); setMaxPrice('');
  }

  const inputStyle = { width: '100%', border: `1px solid ${COLORS.border}`, background: COLORS.bg, color: COLORS.text, borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: FONTS.body };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: COLORS.textMuted, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 };
  const hasActiveFilters = filter !== 'all' || search || location || minPrice || maxPrice;

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: FONTS.body, color: COLORS.text }}>
      <style>{FONT_IMPORT}</style>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Package size={20} color={COLORS.accent} />
              <h1 style={{ fontFamily: FONTS.display, fontSize: 24, fontWeight: 800, margin: 0 }}>Marketplace</h1>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: COLORS.textMuted }}>Browse listings and contact sellers directly, or list your own.</p>
          </div>
          <button onClick={() => setShowForm(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: COLORS.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONTS.body }}>
            <Plus size={15} /> New listing
          </button>
        </div>

        <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${COLORS.border}`, marginBottom: 20 }}>
          {[['browse', 'Browse'], ['mine', 'My listings']].map(([key, label]) => (
            <button key={key} onClick={() => setView(key)} style={{ border: 'none', background: 'none', padding: '10px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: FONTS.body, color: view === key ? COLORS.text : COLORS.textMuted, borderBottom: view === key ? `2px solid ${COLORS.accent}` : '2px solid transparent', marginBottom: -1 }}>{label}</button>
          ))}
        </div>

        {showForm && (
          <div style={{ background: COLORS.surface, borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: FONTS.display, fontSize: 17, fontWeight: 700, margin: 0 }}>Create listing</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color={COLORS.textMuted} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Title</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Cardboard boxes" required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                    {SELLABLE_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Quantity</label>
                  <input value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 10 kg" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Price (₹)</label>
                  <input type="number" min="0" step="1" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="e.g. 200 (leave blank if free)" style={inputStyle} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Location</label>
                  <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Hyderabad" style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Describe the material..." style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Photo (optional)</label>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px dashed ${COLORS.border}`, borderRadius: 10, padding: preview ? 0 : '20px', cursor: 'pointer', background: COLORS.surfaceAlt, overflow: 'hidden', minHeight: 80 }}>
                  {preview ? <img src={preview} alt="preview" style={{ maxHeight: 120, objectFit: 'cover', width: '100%' }} /> : <><Upload size={20} color={COLORS.textMuted} /><span style={{ fontSize: 13, color: COLORS.textMuted, marginLeft: 8 }}>Upload photo</span></>}
                  <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { setImage(f); setPreview(URL.createObjectURL(f)); } }} style={{ display: 'none' }} />
                </label>
              </div>
              <button type="submit" disabled={submitting} style={{ width: '100%', background: COLORS.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: FONTS.body }}>
                {submitting ? 'Creating...' : 'Create listing'}
              </button>
            </form>
          </div>
        )}

        {view === 'browse' && (
          <>
            {/* Search bar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: COLORS.textMuted }} />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search listings by title or description..."
                  style={{ ...inputStyle, paddingLeft: 36 }}
                />
              </div>
              <button onClick={() => setShowFilters(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, border: `1px solid ${hasActiveFilters ? COLORS.accent : COLORS.border}`, borderRadius: 10, padding: '10px 14px', background: showFilters ? COLORS.surfaceAlt : COLORS.surface, color: hasActiveFilters ? COLORS.accent : COLORS.text, cursor: 'pointer', fontSize: 13, fontFamily: FONTS.body, fontWeight: 500 }}>
                <SlidersHorizontal size={14} /> Filters {hasActiveFilters && '•'}
              </button>
            </div>

            {/* Filter panel */}
            {showFilters && (
              <div style={{ background: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Location</label>
                  <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Hyderabad" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Min price (₹)</label>
                  <input type="number" min="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Max price (₹)</label>
                  <input type="number" min="0" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="No limit" style={inputStyle} />
                </div>
                {hasActiveFilters && (
                  <button onClick={clearFilters} style={{ gridColumn: '1 / -1', background: 'none', border: 'none', color: COLORS.textMuted, fontSize: 12, cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: FONTS.body }}>
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Category chips */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {['all', ...CATEGORIES].map(cat => (
                <button key={cat} onClick={() => setFilter(cat)} style={{
                  border: filter === cat ? 'none' : `1px solid ${COLORS.border}`, borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: FONTS.body,
                  background: filter === cat ? (cat === 'all' ? COLORS.accent : CATEGORY_COLORS[cat]) : COLORS.surface,
                  color: filter === cat ? '#fff' : COLORS.textMuted,
                }}>
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            {/* Content: loading / error / empty / grid */}
            {loading ? (
              <SkeletonGrid cols={3} />
            ) : loadError ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <AlertCircle size={40} color={COLORS.danger} style={{ marginBottom: 12 }} />
                <p style={{ color: COLORS.text, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Couldn't load listings</p>
                <p style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 16 }}>Something went wrong reaching the server.</p>
                <button onClick={fetchListings} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: COLORS.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONTS.body }}>
                  <RefreshCw size={13} /> Try again
                </button>
              </div>
            ) : listings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Package size={40} color={COLORS.textFaint} style={{ marginBottom: 12 }} />
                <p style={{ color: COLORS.textMuted, fontSize: 14 }}>{hasActiveFilters ? 'No listings match your filters.' : 'No listings yet. Be the first to post!'}</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {listings.map(l => {
                  const catColor = CATEGORY_COLORS[l.category] || COLORS.textMuted;
                  return (
                    <div key={l.id} style={{ background: COLORS.surface, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      {l.image_url
                        ? <img src={getImageUrl(l.image_url)} alt={l.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                        : <div style={{ height: 100, background: COLORS.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={32} color={catColor} /></div>
                      }
                      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: catColor + '22', color: catColor, marginBottom: 8, display: 'inline-block', width: 'fit-content' }}>{l.category}</span>
                          {l.price != null && <span style={{ fontFamily: FONTS.mono, fontSize: 15, fontWeight: 700, color: COLORS.accent }}>₹{Number(l.price).toLocaleString()}</span>}
                        </div>
                        <h3 style={{ fontSize: 14, fontWeight: 600, margin: '6px 0 4px', color: COLORS.text }}>{l.title}</h3>
                        {l.description && <p style={{ fontSize: 12, color: COLORS.textMuted, margin: '0 0 8px', lineHeight: 1.5 }}>{l.description.length > 80 ? l.description.slice(0, 80) + '...' : l.description}</p>}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, marginBottom: 12 }}>
                          <div>
                            {l.quantity && <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.textMuted, fontWeight: 600 }}>{l.quantity}</span>}
                            {l.location && <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}><MapPin size={11} color={COLORS.textMuted} /><span style={{ fontSize: 11, color: COLORS.textMuted }}>{l.location}</span></div>}
                          </div>
                          <div style={{ fontSize: 11, color: COLORS.textMuted }}>by {l.user_name}</div>
                        </div>
                        <button
                          onClick={() => setContactItem(l)}
                          style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: COLORS.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '9px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONTS.body }}
                        >
                          <MessageCircle size={14} /> Contact seller
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {view === 'mine' && (
          myListings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Package size={40} color={COLORS.textFaint} style={{ marginBottom: 12 }} />
              <p style={{ color: COLORS.textMuted, fontSize: 14 }}>You haven't listed anything yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myListings.map(l => {
                const catColor = CATEGORY_COLORS[l.category] || COLORS.textMuted;
                return (
                  <div key={l.id} style={{ background: COLORS.surface, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: catColor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Package size={18} color={catColor} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{l.title} {l.price != null && <span style={{ color: COLORS.accent, fontFamily: FONTS.mono, fontSize: 13 }}> · ₹{Number(l.price).toLocaleString()}</span>}</div>
                        <div style={{ fontSize: 12, color: COLORS.textMuted }}>{l.quantity} {l.location ? `· ${l.location}` : ''}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: l.status === 'Available' ? COLORS.successBg : COLORS.surfaceAlt, color: l.status === 'Available' ? COLORS.success : COLORS.textMuted }}>
                      {l.status}
                    </span>
                    {l.status === 'Available' && (
                      <button onClick={() => markSold(l.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: COLORS.surfaceAlt, color: COLORS.text, border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: FONTS.body }}>
                        <CheckCircle2 size={13} /> Mark sold
                      </button>
                    )}
                    <button onClick={() => removeListing(l.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.danger }}><Trash2 size={16} /></button>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {contactItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={() => setContactItem(null)}>
          <div style={{ background: COLORS.surface, borderRadius: 16, padding: 28, width: 340, maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Contact seller</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{contactItem.user_name}</div>
              </div>
              <button onClick={() => setContactItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} color={COLORS.textMuted} /></button>
            </div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20 }}>Re: "{contactItem.title}"{contactItem.price != null && ` · ₹${Number(contactItem.price).toLocaleString()}`}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {contactItem.user_phone && (
                <a href={`tel:${contactItem.user_phone}`} style={{ display: 'flex', alignItems: 'center', gap: 10, background: COLORS.surfaceAlt, borderRadius: 10, padding: '12px 14px', textDecoration: 'none', color: COLORS.text }}>
                  <Phone size={16} color={COLORS.accent} /><span style={{ fontSize: 14 }}>{contactItem.user_phone}</span>
                </a>
              )}
              <a href={`mailto:${contactItem.user_email}?subject=${encodeURIComponent('Re: ' + contactItem.title)}`} style={{ display: 'flex', alignItems: 'center', gap: 10, background: COLORS.surfaceAlt, borderRadius: 10, padding: '12px 14px', textDecoration: 'none', color: COLORS.text }}>
                <Mail size={16} color={COLORS.accent} /><span style={{ fontSize: 14 }}>{contactItem.user_email}</span>
              </a>
              {!contactItem.user_phone && (
                <div style={{ fontSize: 12, color: COLORS.textFaint, marginTop: 4 }}>Seller hasn't added a phone number — email is the only contact method for now.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
