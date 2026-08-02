import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  MapPin,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { COLORS, CATEGORY_COLORS, FONTS, FONT_IMPORT } from "../theme";

const SEVERITY_OPTIONS = [
  { value: "Low", label: "Low", hint: "A few items" },
  { value: "Medium", label: "Medium", hint: "Noticeable pile" },
  { value: "High", label: "High", hint: "Large dump / hazardous" },
];

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
            AI read on this photo
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

      {hazardous && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: COLORS.dangerBg,
            border: `1px solid ${COLORS.danger}44`,
            borderRadius: 12,
            padding: "12px 14px",
            marginBottom: 16,
            textAlign: "left",
          }}
        >
          <AlertTriangle
            size={18}
            color={COLORS.danger}
            style={{ flexShrink: 0 }}
          />
          <span style={{ fontSize: 13, color: COLORS.danger, fontWeight: 600 }}>
            This appears to include hazardous material — flag this clearly for
            the cleanup team.
          </span>
        </div>
      )}

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
            For context
          </div>
          <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.5 }}>
            {disposal_tip}
          </div>
        </div>
      )}
    </>
  );
}

export default function ReportWaste() {
  const navigate = useNavigate();
  const [step, setStep] = useState("upload");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [form, setForm] = useState({
    description: "",
    latitude: "",
    longitude: "",
    severity: "Medium",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  async function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setPredicting(true);
    try {
      const data = new FormData();
      data.append("image", file);
      const res = await api.post("/reports/preview", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPrediction(res.data);
      setStep("preview");
      getLocation();
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

  function getLocation() {
    if (!navigator.geolocation) {
      toast.error("Location services not available on this device");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        toast.success("Location captured!");
      },
      () =>
        toast.error(
          "Location is required — please allow location access to report a dump site",
        ),
    );
  }

  async function handleConfirmSubmit() {
    if (!form.latitude || !form.longitude) {
      toast.error("Location is required before submitting a dumping report");
      return;
    }
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("description", form.description);
      data.append("severity", form.severity);
      data.append("latitude", form.latitude);
      data.append("longitude", form.longitude);
      data.append("image", image);
      const res = await api.post("/reports", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      setStep("submitted");
      toast.success(
        `+${res.data.pointsAwarded} points — thanks for reporting!`,
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  }

  function resetAll() {
    setImage(null);
    setPreview(null);
    setPrediction(null);
    setForm({
      description: "",
      latitude: "",
      longitude: "",
      severity: "Medium",
    });
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

  if (step === "submitted" && result) {
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
              marginBottom: 6,
            }}
          >
            Dumping report submitted!
          </h2>
          <p
            style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20 }}
          >
            The cleanup team has been notified.
          </p>
          <PredictionCard {...result} />
          <div
            style={{
              background: COLORS.successBg,
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
                color: COLORS.success,
              }}
            >
              +{result.pointsAwarded}
            </div>
            <div
              style={{ fontSize: 13, color: COLORS.success, fontWeight: 500 }}
            >
              points — thanks for keeping your area clean
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={resetAll} style={{ ...btnGhost, flex: 1 }}>
              Report another
            </button>
            <button
              onClick={() => navigate("/")}
              style={{ ...btnPrimary, flex: 1 }}
            >
              Go home
            </button>
          </div>
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
            Confirm dumping report
          </div>
          <p
            style={{ fontSize: 13, color: COLORS.textFaint, marginBottom: 20 }}
          >
            Not saved yet — add details and confirm below.
          </p>

          {preview && (
            <img
              src={preview}
              alt="dump site"
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

          <div style={{ textAlign: "left", marginTop: 20, marginBottom: 16 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: COLORS.textMuted,
                display: "block",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              How bad is it?
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {SEVERITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, severity: opt.value }))
                  }
                  style={{
                    flex: 1,
                    padding: "10px 6px",
                    borderRadius: 10,
                    cursor: "pointer",
                    textAlign: "center",
                    border: "none",
                    background:
                      form.severity === opt.value
                        ? COLORS.accent
                        : COLORS.surfaceAlt,
                    color:
                      form.severity === opt.value ? "#fff" : COLORS.textMuted,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>
                    {opt.hint}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "left", marginBottom: 16 }}>
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
              Details (optional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
              placeholder="E.g. been here about a week, near the bus stop..."
              style={{
                width: "100%",
                border: `1px solid ${COLORS.border}`,
                background: COLORS.bg,
                color: COLORS.text,
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 14,
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
                fontFamily: FONTS.body,
              }}
            />
          </div>

          <div style={{ textAlign: "left", marginBottom: 24 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: COLORS.textMuted,
                display: "block",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Location <span style={{ color: COLORS.danger }}>*required</span>
            </label>
            {form.latitude ? (
              <p
                style={{
                  fontSize: 13,
                  color: COLORS.success,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <MapPin size={14} /> Captured:{" "}
                {parseFloat(form.latitude).toFixed(4)},{" "}
                {parseFloat(form.longitude).toFixed(4)}
              </p>
            ) : (
              <button
                type="button"
                onClick={getLocation}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 16px",
                  background: COLORS.dangerBg,
                  color: COLORS.danger,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: FONTS.body,
                }}
              >
                <MapPin size={14} /> Location needed — tap to capture
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
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
              onClick={handleConfirmSubmit}
              disabled={submitting || !form.latitude}
              style={{
                ...btnPrimary,
                flex: 1,
                background: !form.latitude ? COLORS.textFaint : COLORS.accent,
                cursor: !form.latitude ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Submitting..." : "Confirm & submit"}
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
          Report dumping
        </h1>
        <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 28 }}>
          Spotted trash dumped near you? Snap a photo and flag it for cleanup.
        </p>

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
                Analyzing photo…
              </span>
            </>
          ) : (
            <>
              <Upload size={28} color={COLORS.textMuted} />
              <span
                style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 8 }}
              >
                Click to upload photo
              </span>
              <span
                style={{ fontSize: 11, color: COLORS.textFaint, marginTop: 4 }}
              >
                Photo of the dump site — doesn't need to be a single clean item
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
