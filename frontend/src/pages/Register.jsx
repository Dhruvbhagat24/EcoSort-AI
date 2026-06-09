import { useState } from "react";

function Register() {
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Register:", formData);
  };

  return (
    <main style={{ padding: "32px 24px", maxWidth: "400px", margin: "0 auto", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", marginBottom: "24px" }}>Create Account</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px", color: "#333" }}>Full Name</label>
          <input
            type="text"
            placeholder="Your name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px", boxSizing: "border-box" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px", color: "#333" }}>Email</label>
          <input
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px", boxSizing: "border-box" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "6px", color: "#333" }}>Password</label>
          <input
            type="password"
            placeholder="Min 6 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "14px", boxSizing: "border-box" }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "12px 24px",
            background: "#8b5cf6",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            marginTop: "8px"
          }}
        >
          Create Account
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: "16px", fontSize: "14px", color: "#666" }}>
        Already have an account? <a href="/" style={{ color: "#8b5cf6", textDecoration: "none", fontWeight: "600" }}>Login</a>
      </p>
    </main>
  );
}

export default Register;
