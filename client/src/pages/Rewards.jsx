import React, { useEffect, useState } from "react";
import { Trophy, Zap, Clock, Gift, Ticket, Copy, Check } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { SkeletonGrid, SkeletonList } from "../components/Skeleton";
import { COLORS, FONTS, FONT_IMPORT } from "../theme";

export default function Rewards() {
  const [myData, setMyData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [myVouchers, setMyVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("history");
  const [redeemingId, setRedeemingId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const MEDALS = ["🥇", "🥈", "🥉"];

  useEffect(() => {
    Promise.all([
      api.get("/rewards/me"),
      api.get("/rewards/leaderboard?limit=10"),
      api.get("/redemptions/catalog"),
      api.get("/redemptions/mine"),
    ])
      .then(([meRes, lbRes, catalogRes, vouchersRes]) => {
        setMyData(meRes.data);
        setLeaderboard(lbRes.data);
        setCatalog(catalogRes.data);
        setMyVouchers(vouchersRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function redeem(item) {
    setRedeemingId(item.id);
    try {
      const res = await api.post(`/redemptions/${item.id}`);
      toast.success(`Redeemed! Code: ${res.data.code}`);
      setMyData((prev) => ({
        ...prev,
        points: prev.points - item.points_cost,
      }));
      const [vouchersRes] = await Promise.all([api.get("/redemptions/mine")]);
      setMyVouchers(vouchersRes.data);
      setTab("vouchers");
    } catch (err) {
      toast.error(err.response?.data?.message || "Redemption failed");
    } finally {
      setRedeemingId(null);
    }
  }

  function copyCode(code) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Code copied!");
    setTimeout(() => setCopiedCode(null), 2000);
  }

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: COLORS.bg,
          fontFamily: FONTS.body,
        }}
      >
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 24px" }}>
          <SkeletonGrid cols={3} />
          <div style={{ marginTop: 24 }}>
            <SkeletonList rows={4} />
          </div>
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
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 6,
          }}
        >
          <Trophy size={22} color={COLORS.accent} />
          <h1
            style={{
              fontFamily: FONTS.display,
              fontSize: 26,
              fontWeight: 800,
              margin: 0,
            }}
          >
            Rewards
          </h1>
        </div>
        <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 28 }}>
          Your points, rank, and redeemable vouchers.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
            marginBottom: 28,
          }}
        >
          {[
            { label: "Total points", value: myData?.points ?? 0, accent: true },
            {
              label: "Your rank",
              value: `#${myData?.rank ?? 1}`,
              accent: false,
            },
            {
              label: "Vouchers redeemed",
              value: myVouchers.length,
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
                  fontSize: 12,
                  color: COLORS.textMuted,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 4,
                }}
              >
                {c.label}
              </div>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 28,
                  fontWeight: 600,
                  color: c.accent ? COLORS.accent : COLORS.text,
                }}
              >
                {c.value}
              </div>
            </div>
          ))}
        </div>

        {leaderboard.length > 0 && (
          <div
            style={{
              background: COLORS.surface,
              borderRadius: 14,
              padding: "18px 22px",
              marginBottom: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                Progress to #1
              </span>
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 13,
                  color: COLORS.textMuted,
                }}
              >
                {myData?.points} / {leaderboard[0]?.points} pts
              </span>
            </div>
            <div
              style={{
                height: 8,
                background: COLORS.surfaceAlt,
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 99,
                  background: COLORS.accent,
                  width: `${Math.min(100, ((myData?.points ?? 0) / (leaderboard[0]?.points || 1)) * 100)}%`,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: 4,
            borderBottom: `1px solid ${COLORS.border}`,
            marginBottom: 18,
            flexWrap: "wrap",
          }}
        >
          {[
            ["history", "History"],
            ["leaderboard", "Leaderboard"],
            ["redeem", "Redeem"],
            ["vouchers", `My vouchers (${myVouchers.length})`],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                border: "none",
                background: "none",
                padding: "10px 16px",
                fontSize: 14,
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

        {tab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {!myData?.history || myData.history.length === 0 ? (
              <div
                style={{
                  padding: "40px 0",
                  textAlign: "center",
                  color: COLORS.textMuted,
                  fontSize: 14,
                }}
              >
                No rewards yet — report some waste to earn points!
              </div>
            ) : (
              myData.history.map((entry) => {
                const isNegative = entry.points < 0;
                return (
                  <div
                    key={entry.id}
                    style={{
                      background: COLORS.surface,
                      borderRadius: 12,
                      padding: "14px 18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: isNegative
                            ? COLORS.dangerBg
                            : COLORS.accentBg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isNegative ? (
                          <Gift size={16} color={COLORS.danger} />
                        ) : (
                          <Zap size={16} color={COLORS.accent} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>
                          {entry.reason}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: COLORS.textMuted,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            marginTop: 2,
                          }}
                        >
                          <Clock size={11} />
                          {new Date(entry.created_at).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 16,
                        fontWeight: 600,
                        color: isNegative ? COLORS.danger : COLORS.accent,
                      }}
                    >
                      {isNegative ? entry.points : `+${entry.points}`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === "leaderboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {leaderboard.map((entry, i) => (
              <div
                key={entry.id}
                style={{
                  background: entry.isMe ? COLORS.accent : COLORS.surface,
                  borderRadius: 12,
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: entry.isMe
                      ? "rgba(0,0,0,0.15)"
                      : COLORS.surfaceAlt,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {i < 3 ? (
                    <span style={{ fontSize: 18 }}>{MEDALS[i]}</span>
                  ) : (
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 13,
                        fontWeight: 600,
                        color: entry.isMe ? "#fff" : COLORS.textMuted,
                      }}
                    >
                      #{entry.rank}
                    </span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: entry.isMe ? "#fff" : COLORS.text,
                    }}
                  >
                    {entry.name}
                    {entry.isMe && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 11,
                          background: "rgba(0,0,0,0.2)",
                          color: "#fff",
                          borderRadius: 6,
                          padding: "2px 7px",
                          fontWeight: 600,
                        }}
                      >
                        You
                      </span>
                    )}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 16,
                    fontWeight: 600,
                    color: entry.isMe ? "#fff" : COLORS.text,
                  }}
                >
                  {entry.points.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === "redeem" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 14,
            }}
          >
            {catalog.map((item) => {
              const affordable = (myData?.points ?? 0) >= item.points_cost;
              return (
                <div
                  key={item.id}
                  style={{
                    background: COLORS.surface,
                    borderRadius: 14,
                    padding: 18,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: COLORS.accentBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Gift size={16} color={COLORS.accent} />
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: COLORS.textMuted,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      marginBottom: 4,
                    }}
                  >
                    {item.partner_name}
                  </div>
                  <div
                    style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: COLORS.textMuted,
                      marginBottom: 16,
                      flex: 1,
                    }}
                  >
                    {item.description}
                  </div>
                  <button
                    onClick={() => redeem(item)}
                    disabled={!affordable || redeemingId === item.id}
                    style={{
                      border: "none",
                      borderRadius: 10,
                      padding: "10px",
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: FONTS.body,
                      cursor: affordable ? "pointer" : "not-allowed",
                      background: affordable
                        ? COLORS.accent
                        : COLORS.surfaceAlt,
                      color: affordable ? "#fff" : COLORS.textFaint,
                    }}
                  >
                    {redeemingId === item.id
                      ? "Redeeming..."
                      : `${item.points_cost} pts`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {tab === "vouchers" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {myVouchers.length === 0 ? (
              <div
                style={{
                  padding: "40px 0",
                  textAlign: "center",
                  color: COLORS.textMuted,
                  fontSize: 14,
                }}
              >
                No vouchers redeemed yet — check the Redeem tab.
              </div>
            ) : (
              myVouchers.map((v) => (
                <div
                  key={v.id}
                  style={{
                    background: COLORS.surface,
                    borderRadius: 12,
                    padding: "14px 18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          color: COLORS.textMuted,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        {v.partner_name}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        {v.title}
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 12,
                        color: COLORS.textMuted,
                      }}
                    >
                      {new Date(v.redeemed_at).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: COLORS.surfaceAlt,
                      borderRadius: 8,
                      padding: "10px 14px",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <Ticket size={14} color={COLORS.accent} />
                      <span
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: 14,
                          fontWeight: 700,
                          letterSpacing: 0.5,
                        }}
                      >
                        {v.code}
                      </span>
                    </div>
                    <button
                      onClick={() => copyCode(v.code)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: COLORS.textMuted,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {copiedCode === v.code ? (
                        <Check size={15} color={COLORS.success} />
                      ) : (
                        <Copy size={15} />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
