import React, { useState } from "react";
import { User, Phone, MapPin, LogOut, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { COLORS, FONTS, FONT_IMPORT } from "../theme";

export default function Profile() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch("/auth/profile", form);
      login(localStorage.getItem("token"), res.data.user);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const fields = [
    { label: "Full name", key: "name", icon: User, type: "text" },
    {
      label: "Phone",
      key: "phone",
      icon: Phone,
      type: "tel",
      placeholder: "Your phone number",
    },
    {
      label: "Address",
      key: "address",
      icon: MapPin,
      type: "text",
      placeholder: "Your address",
    },
  ];

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
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 24px" }}>
        <h1
          style={{
            fontFamily: FONTS.display,
            fontSize: 24,
            fontWeight: 800,
            marginBottom: 24,
          }}
        >
          Profile
        </h1>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: COLORS.accentBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <User size={36} color={COLORS.accent} />
          </div>
          <div
            style={{ fontFamily: FONTS.display, fontSize: 20, fontWeight: 700 }}
          >
            {user?.name}
          </div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>
            {user?.email}
          </div>
          <span
            style={{
              marginTop: 8,
              fontSize: 12,
              fontWeight: 600,
              padding: "3px 12px",
              borderRadius: 20,
              background:
                user?.role === "admin" ? COLORS.accentBg : COLORS.surfaceAlt,
              color: user?.role === "admin" ? COLORS.accent : COLORS.textMuted,
            }}
          >
            {user?.role}
          </span>
        </div>

        <div
          style={{
            background: COLORS.surface,
            borderRadius: 16,
            padding: 24,
            marginBottom: 16,
          }}
        >
          <h2
            style={{
              fontFamily: FONTS.display,
              fontSize: 16,
              fontWeight: 700,
              marginBottom: 18,
            }}
          >
            Personal information
          </h2>
          <form onSubmit={handleSave}>
            {fields.map((f) => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: COLORS.textMuted,
                    display: "block",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {f.label}
                </label>
                <div style={{ position: "relative" }}>
                  <f.icon
                    size={14}
                    style={{
                      position: "absolute",
                      left: 12,
                      top: 12,
                      color: COLORS.textMuted,
                    }}
                  />
                  <input
                    type={f.type}
                    value={form[f.key]}
                    placeholder={f.placeholder || ""}
                    onChange={(e) =>
                      setForm({ ...form, [f.key]: e.target.value })
                    }
                    style={{
                      width: "100%",
                      border: `1px solid ${COLORS.border}`,
                      background: COLORS.bg,
                      color: COLORS.text,
                      borderRadius: 8,
                      padding: "10px 12px 10px 34px",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: FONTS.body,
                    }}
                  />
                </div>
              </div>
            ))}
            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%",
                background: COLORS.accent,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "12px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontFamily: FONTS.body,
              }}
            >
              <Save size={14} /> {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            background: COLORS.dangerBg,
            color: COLORS.danger,
            border: "none",
            borderRadius: 10,
            padding: "12px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            fontFamily: FONTS.body,
          }}
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </div>
  );
}
