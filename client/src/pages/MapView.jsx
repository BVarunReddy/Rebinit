import React, { useEffect, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import api from "../api/axios";
import { COLORS, CATEGORY_COLORS, FONTS, FONT_IMPORT } from "../theme";

const POINT_COLORS = {
  recycling: COLORS.success,
  ewaste: CATEGORY_COLORS.ewaste,
  compost: CATEGORY_COLORS.organic,
  general: CATEGORY_COLORS.paper,
};

function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) {
      resolve(window.L);
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve(window.L);
    document.head.appendChild(script);
  });
}

export default function MapView() {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef([]);
  const [points, setPoints] = useState([]);
  const [geoReports, setGeoReports] = useState([]);
  const [userPos, setUserPos] = useState(null);
  const [showReports, setShowReports] = useState(true);
  const [showPoints, setShowPoints] = useState(true);
  const [L, setL] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      loadLeaflet(),
      api.get("/map/collection-points"),
      api.get("/map/reports"),
    ])
      .then(([LLib, pointsRes, reportsRes]) => {
        setL(LLib);
        setPoints(pointsRes.data);
        setGeoReports(reportsRes.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        () => {},
      );
  }, []);

  useEffect(() => {
    if (!L || !mapRef.current || leafletMap.current) return;
    const map = L.map(mapRef.current).setView(userPos || [17.385, 78.4867], 12);
    // Dark tile layer to match the app shell instead of the default light OSM tiles
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution: "© OpenStreetMap, © CARTO",
      },
    ).addTo(map);
    leafletMap.current = map;
  }, [L, userPos]);

  useEffect(() => {
    const map = leafletMap.current;
    if (!map || !L) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (userPos) {
      const m = L.marker(userPos, {
        icon: L.divIcon({
          className: "",
          html: `<div style="width:16px;height:16px;border-radius:50%;background:${COLORS.accent};border:3px solid #0B0D0C;box-shadow:0 0 0 4px ${COLORS.accent}44"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        }),
      })
        .addTo(map)
        .bindPopup("<b>You are here</b>");
      markersRef.current.push(m);
    }

    if (showPoints)
      points.forEach((p) => {
        const color = POINT_COLORS[p.type] || COLORS.textMuted;
        const m = L.marker([parseFloat(p.latitude), parseFloat(p.longitude)], {
          icon: L.divIcon({
            className: "",
            html: `<div style="width:22px;height:22px;border-radius:6px;background:${color};border:2px solid #17191A;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px">♻</div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          }),
        })
          .addTo(map)
          .bindPopup(
            `<b>${p.name}</b><br><small>${p.type}</small><br><a href="https://maps.google.com/?q=${p.latitude},${p.longitude}" target="_blank" style="color:${COLORS.accent}">Get directions →</a>`,
          );
        markersRef.current.push(m);
      });

    if (showReports)
      geoReports.forEach((r) => {
        const color = CATEGORY_COLORS[r.category] || COLORS.textMuted;
        const m = L.marker([parseFloat(r.latitude), parseFloat(r.longitude)], {
          icon: L.divIcon({
            className: "",
            html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2.5px solid #17191A;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          }),
        })
          .addTo(map)
          .bindPopup(`<b>Report #${r.id}</b><br>${r.category} — ${r.status}`);
        markersRef.current.push(m);
      });
  }, [L, points, geoReports, userPos, showReports, showPoints]);

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
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
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
              <MapPin size={20} color={COLORS.accent} />
              <h1
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 22,
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                Waste map
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: COLORS.textMuted }}>
              Collection points and waste reports near you.
            </p>
          </div>
          <button
            onClick={() => {
              if (!navigator.geolocation) return;
              navigator.geolocation.getCurrentPosition((pos) => {
                const p = [pos.coords.latitude, pos.coords.longitude];
                setUserPos(p);
                leafletMap.current?.setView(p, 13);
              });
            }}
            style={{
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
            }}
          >
            <Navigation size={14} color={COLORS.accent} /> Locate me
          </button>
        </div>

        <div
          style={{
            background: COLORS.surface,
            borderRadius: 12,
            padding: "12px 18px",
            marginBottom: 14,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setShowPoints((v) => !v)}
            style={{
              border: "none",
              borderRadius: 20,
              padding: "6px 14px",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: FONTS.body,
              background: showPoints ? COLORS.accent : COLORS.surfaceAlt,
              color: showPoints ? "#fff" : COLORS.textMuted,
            }}
          >
            ♻ Collection points ({points.length})
          </button>
          <button
            onClick={() => setShowReports((v) => !v)}
            style={{
              border: "none",
              borderRadius: 20,
              padding: "6px 14px",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: FONTS.body,
              background: showReports ? COLORS.accent : COLORS.surfaceAlt,
              color: showReports ? "#fff" : COLORS.textMuted,
            }}
          >
            ● Reports ({geoReports.length})
          </button>
        </div>

        <div
          style={{ borderRadius: 16, overflow: "hidden", position: "relative" }}
        >
          {loading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 999,
                background: COLORS.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontFamily: FONTS.mono, color: COLORS.textMuted }}>
                Loading map…
              </span>
            </div>
          )}
          <div ref={mapRef} style={{ height: 500, width: "100%" }} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginTop: 14,
          }}
        >
          {[
            { label: "Collection points", value: points.length, accent: false },
            {
              label: "Geotagged reports",
              value: geoReports.length,
              accent: true,
            },
            {
              label: "Resolved reports",
              value: geoReports.filter((r) => r.status === "Resolved").length,
              accent: false,
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: COLORS.surface,
                borderRadius: 12,
                padding: "14px 18px",
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
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 22,
                  fontWeight: 600,
                  color: s.accent ? COLORS.accent : COLORS.text,
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
