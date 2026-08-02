import React, { useEffect, useState } from "react";
import { Upload, RotateCcw, CheckCircle2, Recycle } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { COLORS, CATEGORY_COLORS, FONTS, FONT_IMPORT } from "../theme";

function PredictionCard({
  category,
  confidence,
  recyclable,
  hazardous,
  disposal_tip,
}) {
  const color = CATEGORY_COLORS[category] || COLORS.textMuted;
  return (
    <>
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 24,
          background: color,
          margin: "0 auto 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
        }}
      >
        ♻️
      </div>
      <div
        style={{
          display: "inline-block",
          background: color + "22",
          color,
          borderRadius: 20,
          padding: "6px 18px",
          fontSize: 15,
          fontWeight: 700,
          marginBottom: 20,
          textTransform: "capitalize",
        }}
      >
        {category}
      </div>
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span
            style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 500 }}
          >
            AI Confidence
          </span>
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 13,
              fontWeight: 600,
              color,
            }}
          >
            {(confidence || 0).toFixed(1)}%
          </span>
        </div>
        <div
          style={{
            height: 10,
            background: COLORS.surfaceAlt,
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${confidence || 0}%`,
              background: color,
              borderRadius: 99,
              transition: "width 1s ease",
            }}
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {recyclable !== null && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              fontWeight: 700,
              padding: "6px 12px",
              borderRadius: 20,
              background: recyclable ? COLORS.successBg : COLORS.surfaceAlt,
              color: recyclable ? COLORS.success : COLORS.textMuted,
            }}
          >
            {recyclable ? "♻️ Recyclable" : "🗑️ Not recyclable"}
          </span>
        )}
        {hazardous && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              fontWeight: 700,
              padding: "6px 12px",
              borderRadius: 20,
              background: COLORS.dangerBg,
              color: COLORS.danger,
            }}
          >
            ⚠️ Handle with care
          </span>
        )}
      </div>
      {disposal_tip && (
        <div
          style={{
            background: COLORS.surfaceAlt,
            borderRadius: 12,
            padding: "14px 16px",
            marginBottom: 8,
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: COLORS.textMuted,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 6,
            }}
          >
            How to dispose of it
          </div>
          <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.5 }}>
            {disposal_tip}
          </div>
        </div>
      )}
    </>
  );
}

export default function MyRecycling() {
  const [step, setStep] = useState("upload");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .get("/recycling/stats")
      .then((r) => setStats(r.data))
      .catch(() => {});
  }, [step]);

  async function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setPredicting(true);
    try {
      const data = new FormData();
      data.append("image", file);
      const res = await api.post("/recycling/preview", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPrediction(res.data);
      setStep("preview");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not classify image");
    } finally {
      setPredicting(false);
    }
  }

  function retake() {
    setImage(null);
    setPreview(null);
    setPrediction(null);
    setStep("upload");
  }

  async function confirmLog() {
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("image", image);
      const res = await api.post("/recycling", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      setStep("logged");
      if (res.data.pointsAwarded > 0)
        toast.success(`+${res.data.pointsAwarded} points!`);
      else toast("Logged — no points for non-recyclable items", { icon: "ℹ️" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to log item");
    } finally {
      setSubmitting(false);
    }
  }

  function resetAll() {
    setImage(null);
    setPreview(null);
    setPrediction(null);
    setResult(null);
    setStep("upload");
  }

  const cardWrap = {
    minHeight: "100vh",
    background: COLORS.bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: FONTS.body,
    padding: 24,
  };
  const card = {
    background: COLORS.surface,
    borderRadius: 20,
    padding: 40,
    maxWidth: 420,
    width: "100%",
    textAlign: "center",
    color: COLORS.text,
  };
  const btnPrimary = {
    background: COLORS.accent,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "12px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: FONTS.body,
  };
  const btnGhost = {
    background: COLORS.surfaceAlt,
    color: COLORS.text,
    border: "none",
    borderRadius: 10,
    padding: "12px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: FONTS.body,
  };

  if (step === "logged" && result) {
    return (
      <div style={cardWrap}>
        <style>{FONT_IMPORT}</style>
        <div style={card}>
          <CheckCircle2
            size={40}
            color={COLORS.success}
            style={{ marginBottom: 12 }}
          />
          <h2
            style={{
              fontFamily: FONTS.display,
              fontSize: 22,
              fontWeight: 800,
              marginBottom: 20,
            }}
          >
            Logged!
          </h2>
          <PredictionCard {...result} />
          <div
            style={{
              background:
                result.pointsAwarded > 0 ? COLORS.successBg : COLORS.surfaceAlt,
              borderRadius: 12,
              padding: "14px",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 28,
                fontWeight: 700,
                color:
                  result.pointsAwarded > 0 ? COLORS.success : COLORS.textMuted,
              }}
            >
              {result.pointsAwarded > 0 ? `+${result.pointsAwarded}` : "0"}
            </div>
            <div
              style={{
                fontSize: 13,
                color:
                  result.pointsAwarded > 0 ? COLORS.success : COLORS.textMuted,
                fontWeight: 500,
              }}
            >
              {result.pointsAwarded > 0
                ? "points added to your total"
                : "no points — not recyclable"}
            </div>
          </div>
          <button onClick={resetAll} style={{ ...btnPrimary, width: "100%" }}>
            Log another item
          </button>
        </div>
      </div>
    );
  }

  if (step === "preview" && prediction) {
    return (
      <div style={cardWrap}>
        <style>{FONT_IMPORT}</style>
        <div style={card}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: COLORS.textMuted,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 4,
            }}
          >
            Prediction preview
          </div>
          <p
            style={{ fontSize: 13, color: COLORS.textFaint, marginBottom: 20 }}
          >
            Not logged yet — confirm below.
          </p>
          {preview && (
            <img
              src={preview}
              alt="item"
              style={{
                width: "100%",
                maxHeight: 160,
                objectFit: "cover",
                borderRadius: 12,
                marginBottom: 20,
              }}
            />
          )}
          <PredictionCard {...prediction} />
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button
              onClick={retake}
              style={{
                ...btnGhost,
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <RotateCcw size={15} /> Retake
            </button>
            <button
              onClick={confirmLog}
              disabled={submitting}
              style={{ ...btnPrimary, flex: 1 }}
            >
              {submitting ? "Logging..." : "Confirm & log"}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            marginBottom: 6,
          }}
        >
          My recycling
        </h1>
        <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 20 }}>
          Log an item you're recycling — earn points instantly.
        </p>

        {stats && (
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <div
              style={{
                flex: 1,
                background: COLORS.surface,
                borderRadius: 12,
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 22,
                  fontWeight: 700,
                  color: COLORS.text,
                }}
              >
                {stats.total_items || 0}
              </div>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>
                items logged
              </div>
            </div>
            <div
              style={{
                flex: 1,
                background: COLORS.surface,
                borderRadius: 12,
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 22,
                  fontWeight: 700,
                  color: COLORS.accent,
                }}
              >
                {stats.diverted_items || 0}
              </div>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>
                diverted from landfill
              </div>
            </div>
          </div>
        )}

        <label
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: `2px dashed ${COLORS.border}`,
            borderRadius: 12,
            padding: predicting ? 40 : "32px",
            cursor: predicting ? "default" : "pointer",
            background: COLORS.surface,
            minHeight: 160,
          }}
        >
          {predicting ? (
            <>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: `3px solid ${COLORS.surfaceAlt}`,
                  borderTopColor: COLORS.accent,
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <span
                style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 12 }}
              >
                Classifying...
              </span>
            </>
          ) : (
            <>
              <Recycle size={28} color={COLORS.textMuted} />
              <span
                style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 8 }}
              >
                Upload a photo of the item
              </span>
              <span
                style={{ fontSize: 11, color: COLORS.textFaint, marginTop: 4 }}
              >
                Single item, clear photo works best
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            disabled={predicting}
            style={{ display: "none" }}
          />
        </label>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
