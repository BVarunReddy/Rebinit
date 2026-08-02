import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Recycle, Sparkles, Map, Trophy } from "lucide-react";
import { COLORS, FONTS, FONT_IMPORT } from "../theme";

const SLIDES = [
  {
    icon: Recycle,
    title: "Sort waste.\nEarn rewards.",
    desc: "Report illegal dumps, schedule pickups, and get points for every action you take.",
  },
  {
    icon: Sparkles,
    title: "AI classifies\nyour waste.",
    desc: "Just snap a photo. Our AI identifies the waste type instantly — plastic, paper, glass, and more.",
  },
  {
    icon: Map,
    title: "Find collection\npoints near you.",
    desc: "Locate recycling centres, e-waste kiosks, and compost points on an interactive map.",
  },
  {
    icon: Trophy,
    title: "Climb the\nleaderboard.",
    desc: "Compete with your community. The more you recycle, the higher you rank.",
  },
];

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const slide = SLIDES[current];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        fontFamily: FONTS.body,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{FONT_IMPORT}</style>
      <div
        style={{
          padding: "20px 24px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={() => navigate("/login")}
          style={{
            background: "none",
            border: "none",
            fontSize: 14,
            color: COLORS.textMuted,
            cursor: "pointer",
            fontFamily: FONTS.body,
          }}
        >
          Skip
        </button>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 32px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 40,
            background: COLORS.surface,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
            boxShadow: `0 20px 60px rgba(0,0,0,0.4)`,
          }}
        >
          <slide.icon size={56} color={COLORS.accent} strokeWidth={1.5} />
        </div>
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Recycle size={16} color={COLORS.accent} />
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
            fontSize: 30,
            fontWeight: 800,
            color: COLORS.text,
            marginBottom: 16,
            whiteSpace: "pre-line",
            lineHeight: 1.2,
          }}
        >
          {slide.title}
        </h1>
        <p
          style={{
            fontSize: 15,
            color: COLORS.textMuted,
            lineHeight: 1.7,
            maxWidth: 320,
            margin: 0,
          }}
        >
          {slide.desc}
        </p>
      </div>

      <div style={{ padding: "32px 24px 48px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginBottom: 28,
          }}
        >
          {SLIDES.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? 24 : 8,
                height: 8,
                borderRadius: 99,
                cursor: "pointer",
                background: i === current ? COLORS.accent : COLORS.surfaceAlt,
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
        <button
          onClick={() =>
            current < SLIDES.length - 1
              ? setCurrent((c) => c + 1)
              : navigate("/login")
          }
          style={{
            width: "100%",
            background: COLORS.accent,
            color: "#fff",
            border: "none",
            borderRadius: 14,
            padding: "16px",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontFamily: FONTS.display,
          }}
        >
          {current === SLIDES.length - 1 ? "Get started" : "Next"}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
