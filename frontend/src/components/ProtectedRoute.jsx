import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullScreenLoader message="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}

function FullScreenLoader({ message }) {
  return (
    <main style={loaderStyle}>
      <div style={loaderCardStyle}>{message}</div>
    </main>
  );
}

const loaderStyle = {
  minHeight: "100svh",
  display: "grid",
  placeItems: "center",
  padding: "24px",
  background: "linear-gradient(180deg, #f7fbf8 0%, #eef5f1 100%)"
};

const loaderCardStyle = {
  padding: "18px 20px",
  borderRadius: "16px",
  background: "rgba(255, 255, 255, 0.9)",
  border: "1px solid rgba(148, 163, 184, 0.2)",
  color: "#0f172a",
  fontWeight: 700,
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)"
};

export default ProtectedRoute;