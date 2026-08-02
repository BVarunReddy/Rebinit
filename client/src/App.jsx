import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { COLORS, FONTS } from "./theme";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import ReportWaste from "./pages/ReportWaste";
import MyRecycling from "./pages/MyRecycling";
import Marketplace from "./pages/Marketplace";
import Rewards from "./pages/Rewards";
import MapView from "./pages/MapView";
import AdminDashboard from "./pages/AdminDashboard";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function Layout({ children }) {
  const { user } = useAuth();
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: COLORS.surface,
            color: COLORS.text,
            fontFamily: FONTS.body,
            fontSize: "13px",
            borderRadius: "10px",
            padding: "12px 16px",
          },
          success: {
            iconTheme: { primary: COLORS.success, secondary: COLORS.surface },
          },
          error: {
            iconTheme: { primary: COLORS.danger, secondary: COLORS.surface },
          },
        }}
      />
      {user && <Navbar />}
      {children}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <ReportWaste />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recycle"
              element={
                <ProtectedRoute>
                  <MyRecycling />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute>
                  <Marketplace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rewards"
              element={
                <ProtectedRoute>
                  <Rewards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <MapView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
