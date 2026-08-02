import React, { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { SkeletonList } from "../components/Skeleton";
import { COLORS, FONTS, FONT_IMPORT } from "../theme";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/notifications")
      .then((r) => setNotifications(r.data))
      .catch(() => toast.error("Failed to load notifications"))
      .finally(() => setLoading(false));
  }, []);

  async function markAllRead() {
    await api.patch("/notifications/mark-read");
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    toast.success("All marked as read");
  }

  async function markOneRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)),
    );
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      // revert on failure so the UI doesn't lie about state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 0 } : n)),
      );
    }
  }

  const unread = notifications.filter((n) => !n.is_read).length;

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
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <Bell size={20} color={COLORS.accent} />
              <h1
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 24,
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                Notifications
                {unread > 0 && (
                  <span
                    style={{
                      marginLeft: 10,
                      fontSize: 13,
                      background: COLORS.accent,
                      color: "#fff",
                      borderRadius: 20,
                      padding: "2px 10px",
                      fontWeight: 700,
                    }}
                  >
                    {unread}
                  </span>
                )}
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: COLORS.textMuted }}>
              Your latest activity and updates.
            </p>
          </div>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                border: "none",
                borderRadius: 10,
                padding: "8px 14px",
                background: COLORS.surface,
                cursor: "pointer",
                fontSize: 13,
                fontFamily: FONTS.body,
                color: COLORS.text,
              }}
            >
              <CheckCheck size={14} color={COLORS.accent} /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <SkeletonList rows={4} />
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Bell size={40} color={COLORS.textFaint} />
            <p style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 12 }}>
              No notifications yet.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.is_read && markOneRead(n.id)}
                style={{
                  background: n.is_read ? COLORS.surface : COLORS.accentBg,
                  borderRadius: 12,
                  padding: "14px 18px",
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  cursor: n.is_read ? "default" : "pointer",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    flexShrink: 0,
                    background: n.is_read ? COLORS.surfaceAlt : COLORS.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bell
                    size={15}
                    color={n.is_read ? COLORS.textMuted : "#fff"}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: COLORS.text,
                      marginBottom: 2,
                    }}
                  >
                    {n.title}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: COLORS.textMuted,
                      lineHeight: 1.5,
                    }}
                  >
                    {n.message}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: COLORS.textFaint,
                      marginTop: 6,
                    }}
                  >
                    {new Date(n.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                {!n.is_read && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: COLORS.accent,
                      flexShrink: 0,
                      marginTop: 4,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
