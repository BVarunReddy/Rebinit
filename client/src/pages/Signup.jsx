import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Recycle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import { COLORS, FONTS, FONT_IMPORT } from "../theme";

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/signup", form);
      login(res.data.token, res.data.user);
      toast.success("Account created!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { label: "Full name", key: "name", type: "text" },
    { label: "Email", key: "email", type: "email" },
    { label: "Password", key: "password", type: "password" },
  ];
  const inputStyle = {
    width: "100%",
    border: `1px solid ${COLORS.border}`,
    background: COLORS.bg,
    color: COLORS.text,
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: FONTS.body,
  };
  const labelStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: COLORS.textMuted,
    display: "block",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONTS.body,
      }}
    >
      <style>{FONT_IMPORT}</style>
      <div
        style={{
          background: COLORS.surface,
          borderRadius: 16,
          padding: 40,
          width: "100%",
          maxWidth: 400,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: COLORS.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Recycle size={18} color="#fff" />
          </div>
          <span
            style={{
              fontFamily: FONTS.display,
              fontSize: 20,
              fontWeight: 800,
              color: COLORS.text,
            }}
          >
            Rebinit
          </span>
        </div>
        <h1
          style={{
            fontFamily: FONTS.display,
            fontSize: 22,
            fontWeight: 800,
            marginBottom: 6,
            color: COLORS.text,
          }}
        >
          Create account
        </h1>
        <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 28 }}>
          Join and start earning points
        </p>

        <form onSubmit={handleSubmit}>
          {fields.map((f) => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{f.label}</label>
              <input
                type={f.type}
                value={form[f.key]}
                required
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                style={inputStyle}
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
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
              marginTop: 8,
              fontFamily: FONTS.body,
            }}
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            color: COLORS.textMuted,
            marginTop: 20,
          }}
        >
          Have an account?{" "}
          <Link to="/login" style={{ color: COLORS.accent, fontWeight: 600 }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
