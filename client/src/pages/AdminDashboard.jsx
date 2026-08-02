import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Users,
  FileText,
  Package,
  CheckCircle,
  ShieldCheck,
  Trash2,
  Crown,
  Download,
  MapPin,
  Plus,
  X,
} from "lucide-react";
import api, { ASSET_BASE_URL } from "../api/axios";
import toast from "react-hot-toast";
import { SkeletonGrid } from "../components/Skeleton";
import { COLORS, CATEGORY_COLORS, FONTS, FONT_IMPORT } from "../theme";

const STATUS_COLORS = {
  Reported: "#E8C547",
  "In Progress": "#5B9BD5",
  Resolved: COLORS.success,
};

function exportCSV(data, filename) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csv = [
    keys.join(","),
    ...data.map((row) => keys.map((k) => `"${row[k] ?? ""}"`).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`${filename} downloaded!`);
}

const chartTick = { fontSize: 11, fill: COLORS.textMuted };
const tooltipStyle = {
  contentStyle: {
    background: COLORS.surfaceAlt,
    border: "none",
    borderRadius: 8,
    fontSize: 12,
    color: COLORS.text,
  },
  labelStyle: { color: COLORS.text },
  itemStyle: { color: COLORS.text },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [reports, setReports] = useState([]);
  const [points, setPoints] = useState([]);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [showPointForm, setShowPointForm] = useState(false);
  const [pointForm, setPointForm] = useState({
    name: "",
    latitude: "",
    longitude: "",
    type: "recycling",
  });
  const [savingPoint, setSavingPoint] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/users"),
      api.get("/admin/listings"),
      api.get("/reports"),
      api.get("/map/collection-points"),
    ])
      .then(([s, u, l, r, p]) => {
        setStats(s.data);
        setUsers(u.data);
        setListings(l.data);
        setReports(r.data);
        setPoints(p.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id, status) {
    await api.patch(`/reports/${id}/status`, { status });
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success("Status updated");
  }

  async function updateRole(id, role) {
    await api.patch(`/admin/users/${id}/role`, { role });
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    toast.success("Role updated");
  }

  async function deleteListing(id) {
    if (!window.confirm("Delete this listing?")) return;
    await api.delete(`/admin/listings/${id}`);
    setListings((prev) => prev.filter((l) => l.id !== id));
    toast.success("Listing deleted");
  }

  async function createPoint(e) {
    e.preventDefault();
    setSavingPoint(true);
    try {
      const res = await api.post("/map/collection-points", pointForm);
      setPoints((prev) => [...prev, { ...pointForm, id: res.data.id }]);
      setPointForm({
        name: "",
        latitude: "",
        longitude: "",
        type: "recycling",
      });
      setShowPointForm(false);
      toast.success("Collection point added");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to add collection point",
      );
    } finally {
      setSavingPoint(false);
    }
  }

  async function deletePoint(id) {
    if (!window.confirm("Delete this collection point?")) return;
    await api.delete(`/map/collection-points/${id}`);
    setPoints((prev) => prev.filter((p) => p.id !== id));
    toast.success("Collection point deleted");
  }

  const TH = ({ children }) => (
    <th
      style={{
        padding: "12px 14px",
        textAlign: "left",
        fontWeight: 600,
        color: COLORS.textMuted,
        background: COLORS.surfaceAlt,
        whiteSpace: "nowrap",
        fontSize: 12,
      }}
    >
      {children}
    </th>
  );
  const TD = ({ children, style = {} }) => (
    <td
      style={{
        padding: "11px 14px",
        borderBottom: `1px solid ${COLORS.border}`,
        fontSize: 13,
        color: COLORS.text,
        ...style,
      }}
    >
      {children}
    </td>
  );
  const exportBtn = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    border: "none",
    borderRadius: 10,
    padding: "8px 14px",
    background: COLORS.surface,
    color: COLORS.text,
    cursor: "pointer",
    fontSize: 13,
    fontFamily: FONTS.body,
  };
  const selectStyle = {
    border: "none",
    borderRadius: 8,
    padding: "4px 8px",
    fontSize: 12,
    background: COLORS.surfaceAlt,
    color: COLORS.text,
    fontFamily: FONTS.body,
    cursor: "pointer",
  };
  const tableWrap = {
    background: COLORS.surface,
    borderRadius: 14,
    overflow: "hidden",
  };

  const tabs = [
    ["overview", "Overview"],
    ["reports", `Reports (${reports.length})`],
    ["users", `Users (${users.length})`],
    ["listings", `Listings (${listings.length})`],
    ["points", `Points (${points.length})`],
  ];

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: COLORS.bg,
          fontFamily: FONTS.body,
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
          <SkeletonGrid cols={4} />
        </div>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        fontFamily: FONTS.body,
        color: COLORS.text,
      }}
    >
      <style>{FONT_IMPORT}</style>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 24,
          }}
        >
          <ShieldCheck size={20} color={COLORS.accent} />
          <h1
            style={{
              fontFamily: FONTS.display,
              fontSize: 24,
              fontWeight: 800,
              margin: 0,
            }}
          >
            Admin dashboard
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            gap: 4,
            borderBottom: `1px solid ${COLORS.border}`,
            marginBottom: 24,
          }}
        >
          {tabs.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                border: "none",
                background: "none",
                padding: "10px 16px",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: FONTS.body,
                color: tab === key ? COLORS.text : COLORS.textMuted,
                borderBottom:
                  tab === key
                    ? `2px solid ${COLORS.accent}`
                    : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "overview" && stats && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 14,
                marginBottom: 24,
              }}
            >
              {[
                {
                  icon: Users,
                  label: "Users",
                  value: stats.cards.totalUsers,
                  accent: false,
                },
                {
                  icon: FileText,
                  label: "Reports",
                  value: stats.cards.totalReports,
                  accent: true,
                },
                {
                  icon: Package,
                  label: "Listings",
                  value: stats.cards.totalListings,
                  accent: false,
                },
                {
                  icon: CheckCircle,
                  label: "Resolved",
                  value: stats.cards.resolvedReports,
                  accent: false,
                },
              ].map((c) => (
                <div
                  key={c.label}
                  style={{
                    background: COLORS.surface,
                    borderRadius: 14,
                    padding: "18px 22px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: COLORS.surfaceAlt,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <c.icon
                        size={16}
                        color={c.accent ? COLORS.accent : COLORS.textMuted}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: COLORS.textMuted,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {c.label}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 26,
                      fontWeight: 600,
                      color: c.accent ? COLORS.accent : COLORS.text,
                    }}
                  >
                    {c.value}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  background: COLORS.surface,
                  borderRadius: 14,
                  padding: "20px 22px",
                }}
              >
                <h3
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 14,
                    fontWeight: 700,
                    marginBottom: 16,
                  }}
                >
                  Reports over 14 days
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats.reportsOverTime}>
                    <XAxis
                      dataKey="date"
                      tick={chartTick}
                      tickFormatter={(d) => d.slice(5)}
                      axisLine={{ stroke: COLORS.border }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={chartTick}
                      allowDecimals={false}
                      axisLine={{ stroke: COLORS.border }}
                      tickLine={false}
                    />
                    <Tooltip {...tooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke={COLORS.accent}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div
                style={{
                  background: COLORS.surface,
                  borderRadius: 14,
                  padding: "20px 22px",
                }}
              >
                <h3
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 14,
                    fontWeight: 700,
                    marginBottom: 16,
                  }}
                >
                  By category
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.reportsByCategory} layout="vertical">
                    <XAxis
                      type="number"
                      tick={chartTick}
                      allowDecimals={false}
                      axisLine={{ stroke: COLORS.border }}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="category"
                      type="category"
                      tick={chartTick}
                      width={60}
                      axisLine={{ stroke: COLORS.border }}
                      tickLine={false}
                    />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {stats.reportsByCategory.map((e) => (
                        <Cell
                          key={e.category}
                          fill={CATEGORY_COLORS[e.category] || COLORS.textMuted}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div
                style={{
                  background: COLORS.surface,
                  borderRadius: 14,
                  padding: "20px 22px",
                }}
              >
                <h3
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 14,
                    fontWeight: 700,
                    marginBottom: 16,
                  }}
                >
                  By status
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.reportsByStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {stats.reportsByStatus.map((e) => (
                        <Cell
                          key={e.status}
                          fill={STATUS_COLORS[e.status] || COLORS.textMuted}
                        />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                    <Legend
                      iconType="circle"
                      iconSize={10}
                      wrapperStyle={{ fontSize: 12, color: COLORS.textMuted }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div
                style={{
                  background: COLORS.surface,
                  borderRadius: 14,
                  padding: "20px 22px",
                }}
              >
                <h3
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 14,
                    fontWeight: 700,
                    marginBottom: 16,
                  }}
                >
                  Top reporters
                </h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {stats.topUsers.map((u, i) => (
                    <div
                      key={u.id}
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <Crown
                        size={14}
                        color={i === 0 ? COLORS.accent : COLORS.textFaint}
                      />
                      <span style={{ flex: 1, fontSize: 14 }}>{u.name}</span>
                      <span
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: 13,
                          color: COLORS.textMuted,
                        }}
                      >
                        {u.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "reports" && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 12,
              }}
            >
              <button
                onClick={() => exportCSV(reports, "rebinit-reports.csv")}
                style={exportBtn}
              >
                <Download size={14} color={COLORS.accent} /> Export CSV
              </button>
            </div>
            <div style={tableWrap}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["#", "User", "Category", "Status", "Date", "Photo"].map(
                      (h) => (
                        <TH key={h}>{h}</TH>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => {
                    const c = CATEGORY_COLORS[r.category] || COLORS.textMuted;
                    return (
                      <tr key={r.id}>
                        <TD>{r.id}</TD>
                        <TD>{r.user_name || "—"}</TD>
                        <TD>
                          <span
                            style={{
                              background: c + "22",
                              color: c,
                              borderRadius: 6,
                              padding: "2px 8px",
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {r.category || "unknown"}
                          </span>
                        </TD>
                        <TD>
                          <select
                            value={r.status}
                            onChange={(e) => updateStatus(r.id, e.target.value)}
                            style={selectStyle}
                          >
                            <option>Reported</option>
                            <option>In Progress</option>
                            <option>Resolved</option>
                          </select>
                        </TD>
                        <TD style={{ color: COLORS.textMuted }}>
                          {new Date(r.created_at).toLocaleDateString("en-IN")}
                        </TD>
                        <TD>
                          {r.image_url && (
                            <a
                              href={`${ASSET_BASE_URL}${r.image_url}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: COLORS.accent, fontSize: 12 }}
                            >
                              View
                            </a>
                          )}
                        </TD>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {reports.length === 0 && (
                <div
                  style={{
                    padding: 24,
                    textAlign: "center",
                    color: COLORS.textMuted,
                    fontSize: 13,
                  }}
                >
                  No reports yet.
                </div>
              )}
            </div>
          </>
        )}

        {tab === "users" && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 12,
              }}
            >
              <button
                onClick={() =>
                  exportCSV(
                    users.map((u) => ({
                      id: u.id,
                      name: u.name,
                      email: u.email,
                      role: u.role,
                      points: u.points,
                      reports: u.reportCount,
                    })),
                    "rebinit-users.csv",
                  )
                }
                style={exportBtn}
              >
                <Download size={14} color={COLORS.accent} /> Export CSV
              </button>
            </div>
            <div style={tableWrap}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {[
                      "Name",
                      "Email",
                      "Role",
                      "Points",
                      "Reports",
                      "Change role",
                    ].map((h) => (
                      <TH key={h}>{h}</TH>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <TD style={{ fontWeight: 500 }}>{u.name}</TD>
                      <TD style={{ color: COLORS.textMuted }}>{u.email}</TD>
                      <TD>
                        <span
                          style={{
                            background:
                              u.role === "admin"
                                ? COLORS.accentBg
                                : COLORS.surfaceAlt,
                            color:
                              u.role === "admin"
                                ? COLORS.accent
                                : COLORS.textMuted,
                            borderRadius: 6,
                            padding: "2px 8px",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {u.role}
                        </span>
                      </TD>
                      <TD style={{ fontFamily: FONTS.mono }}>{u.points}</TD>
                      <TD style={{ fontFamily: FONTS.mono }}>
                        {u.reportCount}
                      </TD>
                      <TD>
                        <select
                          value={u.role}
                          onChange={(e) => updateRole(u.id, e.target.value)}
                          style={selectStyle}
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "listings" && (
          <div style={tableWrap}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Title", "Category", "User", "Status", "Date", ""].map(
                    (h) => (
                      <TH key={h}>{h}</TH>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => {
                  const c = CATEGORY_COLORS[l.category] || COLORS.textMuted;
                  return (
                    <tr key={l.id}>
                      <TD style={{ fontWeight: 500 }}>{l.title}</TD>
                      <TD>
                        <span
                          style={{
                            background: c + "22",
                            color: c,
                            borderRadius: 6,
                            padding: "2px 8px",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {l.category}
                        </span>
                      </TD>
                      <TD style={{ color: COLORS.textMuted }}>{l.user_name}</TD>
                      <TD>
                        <span
                          style={{
                            background:
                              l.status === "Available"
                                ? COLORS.successBg
                                : COLORS.surfaceAlt,
                            color:
                              l.status === "Available"
                                ? COLORS.success
                                : COLORS.textMuted,
                            borderRadius: 6,
                            padding: "2px 8px",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {l.status}
                        </span>
                      </TD>
                      <TD style={{ color: COLORS.textMuted }}>
                        {new Date(l.created_at).toLocaleDateString("en-IN")}
                      </TD>
                      <TD>
                        <button
                          onClick={() => deleteListing(l.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: COLORS.danger,
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </TD>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {listings.length === 0 && (
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                  color: COLORS.textMuted,
                  fontSize: 13,
                }}
              >
                No listings yet.
              </div>
            )}
          </div>
        )}

        {tab === "points" && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 12,
              }}
            >
              <button
                onClick={() => setShowPointForm((v) => !v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: "none",
                  borderRadius: 10,
                  padding: "8px 14px",
                  background: COLORS.accent,
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: FONTS.body,
                }}
              >
                <Plus size={14} /> Add collection point
              </button>
            </div>

            {showPointForm && (
              <form
                onSubmit={createPoint}
                style={{
                  background: COLORS.surface,
                  borderRadius: 14,
                  padding: 20,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 15,
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    New collection point
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowPointForm(false)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <X size={16} color={COLORS.textMuted} />
                  </button>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <input
                    required
                    placeholder="Name (e.g. GHMC Dry Waste - Banjara Hills)"
                    value={pointForm.name}
                    onChange={(e) =>
                      setPointForm({ ...pointForm, name: e.target.value })
                    }
                    style={{
                      border: `1px solid ${COLORS.border}`,
                      background: COLORS.bg,
                      color: COLORS.text,
                      borderRadius: 8,
                      padding: "10px 12px",
                      fontSize: 13,
                      outline: "none",
                      fontFamily: FONTS.body,
                    }}
                  />
                  <input
                    required
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    value={pointForm.latitude}
                    onChange={(e) =>
                      setPointForm({ ...pointForm, latitude: e.target.value })
                    }
                    style={{
                      border: `1px solid ${COLORS.border}`,
                      background: COLORS.bg,
                      color: COLORS.text,
                      borderRadius: 8,
                      padding: "10px 12px",
                      fontSize: 13,
                      outline: "none",
                      fontFamily: FONTS.body,
                    }}
                  />
                  <input
                    required
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    value={pointForm.longitude}
                    onChange={(e) =>
                      setPointForm({ ...pointForm, longitude: e.target.value })
                    }
                    style={{
                      border: `1px solid ${COLORS.border}`,
                      background: COLORS.bg,
                      color: COLORS.text,
                      borderRadius: 8,
                      padding: "10px 12px",
                      fontSize: 13,
                      outline: "none",
                      fontFamily: FONTS.body,
                    }}
                  />
                  <select
                    value={pointForm.type}
                    onChange={(e) =>
                      setPointForm({ ...pointForm, type: e.target.value })
                    }
                    style={{
                      border: `1px solid ${COLORS.border}`,
                      background: COLORS.bg,
                      color: COLORS.text,
                      borderRadius: 8,
                      padding: "10px 12px",
                      fontSize: 13,
                      fontFamily: FONTS.body,
                      cursor: "pointer",
                    }}
                  >
                    <option value="recycling">Recycling</option>
                    <option value="ewaste">E-waste</option>
                    <option value="compost">Compost</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={savingPoint}
                  style={{
                    background: COLORS.accent,
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 20px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: FONTS.body,
                  }}
                >
                  {savingPoint ? "Adding..." : "Add point"}
                </button>
              </form>
            )}

            <div style={tableWrap}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Name", "Type", "Latitude", "Longitude", ""].map((h) => (
                      <TH key={h}>{h}</TH>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {points.map((p) => (
                    <tr key={p.id}>
                      <TD style={{ fontWeight: 500 }}>{p.name}</TD>
                      <TD>
                        <span
                          style={{
                            background: COLORS.accentBg,
                            color: COLORS.accent,
                            borderRadius: 6,
                            padding: "2px 8px",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {p.type}
                        </span>
                      </TD>
                      <TD
                        style={{
                          fontFamily: FONTS.mono,
                          color: COLORS.textMuted,
                        }}
                      >
                        {parseFloat(p.latitude).toFixed(4)}
                      </TD>
                      <TD
                        style={{
                          fontFamily: FONTS.mono,
                          color: COLORS.textMuted,
                        }}
                      >
                        {parseFloat(p.longitude).toFixed(4)}
                      </TD>
                      <TD>
                        <button
                          onClick={() => deletePoint(p.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: COLORS.danger,
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </table>
              {points.length === 0 && (
                <div style={{ padding: 40, textAlign: "center" }}>
                  <MapPin
                    size={32}
                    color={COLORS.textFaint}
                    style={{ marginBottom: 8 }}
                  />
                  <div style={{ color: COLORS.textMuted, fontSize: 13 }}>
                    No collection points yet. Add one above.
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
