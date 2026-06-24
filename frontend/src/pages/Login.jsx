import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiArrowRight, FiMail, FiLock } from "react-icons/fi";
import { useAuth } from "../context/useAuth";

function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || "/scan";

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate(from, { replace: true });
    }
  }, [authLoading, from, isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={pageStyle}>
      {/* Ambient orbs */}
      <div style={{ ...orbStyle, top: "10%",  left: "5%",  width: 320, height: 320, background: "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)" }} />
      <div style={{ ...orbStyle, bottom: "15%", right: "8%", width: 260, height: 260, background: "radial-gradient(circle, rgba(14,165,233,0.14) 0%, transparent 70%)" }} />

      <div style={layoutStyle}>
        {/* Left hero panel */}
        <div style={heroPanelStyle}>
          <div style={heroContentStyle}>
            <div style={heroBadgeStyle}>
              <span style={{ fontSize: "16px" }}>♻</span>
              <span>EcoSort AI</span>
            </div>
            <h1 style={heroTitleStyle}>
              Classify waste.<br />
              <span style={{ color: "var(--success)" }}>Protect</span> the planet.
            </h1>
            <p style={heroSubStyle}>
              AI-powered waste classification that helps you make smarter recycling decisions — instantly.
            </p>

            <div style={heroStatsStyle}>
              {[
                { num: "98%",  label: "Model Accuracy"    },
                { num: "10+",  label: "Waste Categories"  },
                { num: "Real", label: "Time Analysis"     }
              ].map(({ num, label }) => (
                <div key={label} style={heroStatItemStyle}>
                  <div style={heroStatNumStyle}>{num}</div>
                  <div style={heroStatLabelStyle}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div style={formPanelStyle}>
          <div style={formCardStyle}>
            <div style={{ marginBottom: "28px" }}>
              <h2 style={formTitleStyle}>Welcome back</h2>
              <p style={formSubStyle}>Sign in to your EcoSort account.</p>
            </div>

            {error && <div style={errorBannerStyle}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <FieldGroup
                label="Email address"
                icon={<FiMail size={15} color={focusedField === "email" ? "var(--accent)" : "var(--text-tertiary)"} />}
                focused={focusedField === "email"}
              >
                <input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={inputStyle}
                />
              </FieldGroup>

              <FieldGroup
                label="Password"
                icon={<FiLock size={15} color={focusedField === "password" ? "var(--accent)" : "var(--text-tertiary)"} />}
                focused={focusedField === "password"}
              >
                <input
                  id="login-password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={inputStyle}
                />
              </FieldGroup>

              <SubmitButton loading={loading} label="Sign in" loadingLabel="Signing in..." />
            </form>

            <p style={footerTextStyle}>
              Don't have an account?{" "}
              <Link to="/register" style={linkStyle}>Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ── Sub-components ── */

function FieldGroup({ label, icon, focused, children }) {
  return (
    <div>
      <label style={fieldLabelStyle}>{label}</label>
      <div style={{
        ...inputWrapStyle,
        borderColor: focused ? "var(--accent)" : "var(--border)",
        boxShadow:   focused ? "0 0 0 3px var(--accent-light)" : "none"
      }}>
        {icon}
        {children}
      </div>
    </div>
  );
}

function SubmitButton({ loading, label, loadingLabel }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="submit"
      id="login-submit"
      disabled={loading}
      style={{
        ...submitBtnStyle,
        opacity: loading ? 0.72 : 1,
        cursor: loading ? "not-allowed" : "pointer",
        transform: hovered && !loading ? "translateY(-1px)" : "translateY(0)",
        boxShadow: hovered && !loading
          ? "0 8px 24px rgba(16, 185, 129, 0.40)"
          : "0 4px 14px rgba(16, 185, 129, 0.25)"
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {loading ? loadingLabel : <>{label} <FiArrowRight size={15} /></>}
    </button>
  );
}

/* ── Styles ── */

const pageStyle = {
  minHeight: "100svh",
  display: "flex",
  alignItems: "stretch",
  position: "relative",
  overflow: "hidden",
  background: "var(--bg)"
};

const orbStyle = {
  position: "fixed",
  borderRadius: "50%",
  pointerEvents: "none",
  zIndex: 0
};

const layoutStyle = {
  display: "flex",
  flex: 1,
  position: "relative",
  zIndex: 1
};

const heroPanelStyle = {
  flex: "1 1 55%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "48px",
  background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F2922 100%)",
  position: "relative",
  overflow: "hidden"
};

const heroContentStyle = {
  maxWidth: "420px",
  position: "relative",
  zIndex: 1
};

const heroBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "6px 14px",
  borderRadius: "var(--radius-full)",
  background: "rgba(16, 185, 129, 0.15)",
  border: "1px solid rgba(16, 185, 129, 0.30)",
  color: "#34D399",
  fontSize: "0.82rem",
  fontWeight: 700,
  letterSpacing: "0.04em",
  marginBottom: "28px"
};

const heroTitleStyle = {
  fontSize: "clamp(2rem, 3.5vw, 3rem)",
  fontWeight: 800,
  color: "#F8FAFC",
  lineHeight: 1.12,
  letterSpacing: "-0.04em",
  marginBottom: "16px"
};

const heroSubStyle = {
  fontSize: "1rem",
  color: "#94A3B8",
  lineHeight: 1.7,
  marginBottom: "40px"
};

const heroStatsStyle = {
  display: "flex",
  gap: "28px"
};

const heroStatItemStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px"
};

const heroStatNumStyle = {
  fontSize: "1.5rem",
  fontWeight: 800,
  color: "#34D399",
  letterSpacing: "-0.03em"
};

const heroStatLabelStyle = {
  fontSize: "0.78rem",
  color: "#64748B",
  fontWeight: 600
};

const formPanelStyle = {
  flex: "1 1 45%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "48px 32px",
  background: "var(--bg)"
};

const formCardStyle = {
  width: "100%",
  maxWidth: "400px"
};

const formTitleStyle = {
  fontSize: "clamp(1.6rem, 3vw, 2rem)",
  fontWeight: 800,
  letterSpacing: "-0.03em",
  color: "var(--text-primary)",
  marginBottom: "6px"
};

const formSubStyle = {
  fontSize: "0.95rem",
  color: "var(--text-secondary)"
};

const errorBannerStyle = {
  padding: "12px 14px",
  background: "var(--danger-light)",
  color: "#B91C1C",
  border: "1px solid var(--danger-border)",
  borderRadius: "var(--radius-md)",
  fontSize: "0.9rem",
  marginBottom: "16px",
  animation: "fadeSlideUp 0.2s ease both"
};

const fieldLabelStyle = {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "var(--text-primary)",
  marginBottom: "8px"
};

const inputWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "0 14px",
  height: "46px",
  borderRadius: "var(--radius-md)",
  background: "#fff",
  border: "1.5px solid var(--border)",
  transition: "border-color 0.18s ease, box-shadow 0.18s ease"
};

const inputStyle = {
  flex: 1,
  height: "100%",
  border: "none",
  outline: "none",
  background: "transparent",
  fontSize: "0.95rem",
  color: "var(--text-primary)",
  fontFamily: "var(--font-sans)"
};

const submitBtnStyle = {
  width: "100%",
  minHeight: "48px",
  border: "none",
  borderRadius: "var(--radius-md)",
  background: "linear-gradient(135deg, #10B981, #059669)",
  color: "#fff",
  fontSize: "0.96rem",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  marginTop: "8px",
  transition: "transform 0.18s var(--ease-out), box-shadow 0.18s ease, opacity 0.18s ease",
  fontFamily: "var(--font-sans)"
};

const footerTextStyle = {
  textAlign: "center",
  marginTop: "24px",
  fontSize: "0.9rem",
  color: "var(--text-secondary)"
};

const linkStyle = {
  color: "var(--success)",
  textDecoration: "none",
  fontWeight: 700
};

export default Login;
