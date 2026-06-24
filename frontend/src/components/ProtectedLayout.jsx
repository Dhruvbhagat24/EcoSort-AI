import { NavLink } from "react-router-dom";
import { FiLogOut, FiCamera, FiBarChart2, FiClock } from "react-icons/fi";
import { useAuth } from "../context/useAuth";

function ProtectedLayout({ children }) {
  const { user, logout } = useAuth();

  const initial = (user?.name || user?.email || "E").charAt(0).toUpperCase();

  return (
    <div style={layoutStyle}>
      {/* ── Sticky glass header ── */}
      <header style={headerOuterStyle}>
        <div style={headerInnerStyle}>
          {/* Brand */}
          <div style={brandStyle}>
            <div style={brandIconStyle}>
              <span style={{ fontSize: "16px" }}>♻</span>
            </div>
            <div>
              <div style={brandNameStyle}>EcoSort AI</div>
              <div style={brandTaglineStyle}>Smart waste classification</div>
            </div>
          </div>

          {/* Right: user + logout */}
          <div style={headerRightStyle}>
            <div style={userPillStyle}>
              <div style={avatarStyle}>{initial}</div>
              <span style={userNameStyle}>{user?.name || user?.email || "EcoSort User"}</span>
            </div>
            <LogoutButton onClick={logout} />
          </div>
        </div>
      </header>

      {/* ── Tab nav ── */}
      <nav style={navOuterStyle}>
        <div style={navInnerStyle}>
          <NavItem to="/scan"      icon={<FiCamera  size={15} />} label="Scan Waste" />
          <NavItem to="/dashboard" icon={<FiBarChart2 size={15} />} label="Dashboard"  />
          <NavItem to="/history"   icon={<FiClock   size={15} />} label="History"    />
        </div>
      </nav>

      {/* ── Page content ── */}
      <main style={mainStyle}>{children}</main>
    </div>
  );
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        ...navItemStyle,
        ...(isActive ? navItemActiveStyle : navItemInactiveStyle)
      })}
    >
      {icon}
      {label}
    </NavLink>
  );
}

function LogoutButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={logoutStyle}
      onMouseEnter={e => {
        e.currentTarget.style.background = "#FEF2F2";
        e.currentTarget.style.color = "#DC2626";
        e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "#fff";
        e.currentTarget.style.color = "#0F172A";
        e.currentTarget.style.borderColor = "rgba(226,232,240,0.8)";
      }}
    >
      <FiLogOut size={14} />
      Logout
    </button>
  );
}

/* ──────────────── Styles ──────────────── */

const layoutStyle = {
  minHeight: "100svh",
  display: "flex",
  flexDirection: "column",
  background: "var(--bg)"
};

const headerOuterStyle = {
  position: "sticky",
  top: 0,
  zIndex: 100,
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  background: "rgba(248, 250, 252, 0.85)",
  borderBottom: "1px solid var(--border)"
};

const headerInnerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "12px 24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px"
};

const brandStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px"
};

const brandIconStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  background: "linear-gradient(135deg, #10B981, #059669)",
  display: "grid",
  placeItems: "center",
  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.35)"
};

const brandNameStyle = {
  fontSize: "0.96rem",
  fontWeight: 800,
  color: "var(--text-primary)",
  letterSpacing: "-0.02em"
};

const brandTaglineStyle = {
  fontSize: "0.74rem",
  color: "var(--text-secondary)",
  marginTop: "1px"
};

const headerRightStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap"
};

const userPillStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "5px 12px 5px 5px",
  borderRadius: "var(--radius-full)",
  background: "var(--success-light)",
  border: "1px solid var(--success-border)"
};

const avatarStyle = {
  width: "26px",
  height: "26px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #10B981, #059669)",
  color: "#fff",
  fontSize: "0.78rem",
  fontWeight: 800,
  display: "grid",
  placeItems: "center"
};

const userNameStyle = {
  fontSize: "0.84rem",
  fontWeight: 700,
  color: "#059669"
};

const logoutStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "7px 13px",
  borderRadius: "var(--radius-md)",
  border: "1px solid rgba(226,232,240,0.8)",
  background: "#fff",
  color: "var(--text-primary)",
  fontSize: "0.84rem",
  fontWeight: 700,
  cursor: "pointer",
  transition: "all 0.18s ease",
  boxShadow: "var(--shadow-sm)"
};

const navOuterStyle = {
  background: "rgba(248, 250, 252, 0.6)",
  backdropFilter: "blur(8px)",
  borderBottom: "1px solid var(--border-subtle)"
};

const navInnerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 24px",
  display: "flex",
  gap: "2px"
};

const navItemStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "7px",
  padding: "11px 14px",
  fontSize: "0.875rem",
  fontWeight: 600,
  textDecoration: "none",
  borderBottom: "2px solid transparent",
  transition: "all 0.18s ease",
  whiteSpace: "nowrap",
  marginBottom: "-1px"
};

const navItemActiveStyle = {
  color: "var(--success)",
  borderBottomColor: "var(--success)"
};

const navItemInactiveStyle = {
  color: "var(--text-secondary)"
};

const mainStyle = {
  flex: 1,
  minHeight: 0
};

export default ProtectedLayout;