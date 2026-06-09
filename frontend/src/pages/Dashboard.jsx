import { useEffect, useState } from "react";
import { FiTrendingUp, FiPackage, FiRefreshCw, FiAward } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import API from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          API.get("/waste/stats"),
          API.get("/waste/recent")
        ]);
        setStats(statsRes.data);
        setRecent(recentRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: "32px", textAlign: "center" }}>Loading...</div>;

  const chartData = stats
    ? [
        { name: "Plastic", count: stats.plastic || 0 },
        { name: "Paper", count: stats.paper || 0 },
        { name: "Metal", count: stats.metal || 0 },
        { name: "Glass", count: stats.glass || 0 },
        { name: "Organic", count: stats.organic || 0 }
      ]
    : [];

  return (
    <main style={{ padding: "24px" }}>
      <h1 style={{ marginBottom: "24px" }}>Dashboard</h1>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        <div style={cardStyle}>
          <div style={cardIconStyle}><FiPackage size={24} /></div>
          <div>
            <div style={cardLabelStyle}>Total Scans</div>
            <div style={cardValueStyle}>{stats?.totalUploads || 0}</div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardIconStyle}><FiAward size={24} /></div>
          <div>
            <div style={cardLabelStyle}>Avg Eco Score</div>
            <div style={cardValueStyle}>{stats?.averageEcoScore || 0}</div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardIconStyle}><FiRefreshCw size={24} color="#22c55e" /></div>
          <div>
            <div style={cardLabelStyle}>Recyclable Found</div>
            <div style={cardValueStyle}>{stats?.recyclableCount || 0}</div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardIconStyle}><FiTrendingUp size={24} color="#3b82f6" /></div>
          <div>
            <div style={cardLabelStyle}>Avg Impact</div>
            <div style={cardValueStyle}>{stats?.averageImpact || "N/A"}</div>
          </div>
        </div>
      </div>

      {/* Category Breakdown Chart */}
      {chartData.length > 0 && (
        <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "16px", marginBottom: "32px" }}>
          <h2 style={{ marginTop: 0 }}>Waste by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Scans */}
      <div>
        <h2>Recent Scans</h2>
        {recent.length === 0 ? (
          <p style={{ color: "#999", textAlign: "center", padding: "24px" }}>No scans yet. Start by scanning waste!</p>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {recent.slice(0, 5).map(scan => (
              <div key={scan._id} style={{ background: "#f9fafb", borderRadius: "8px", padding: "16px", border: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontWeight: "600", fontSize: "16px" }}>{scan.wasteType}</span>
                  <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}
                    >{scan.category}</span>
                </div>
                <p style={{ margin: "0 0 8px 0", color: "#666", fontSize: "14px" }}>{scan.disposalMethod}</p>
                <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#999" }}>
                  <span>🎯 Eco Score: {scan.ecoScore}</span>
                  <span>{scan.recyclable ? "♻️ Recyclable" : "⚠️ Non-recyclable"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

const cardStyle = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "16px",
  display: "flex",
  alignItems: "center",
  gap: "12px"
};

const cardIconStyle = {
  fontSize: "32px",
  color: "#8b5cf6"
};

const cardLabelStyle = {
  fontSize: "12px",
  color: "#999",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const cardValueStyle = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#111",
  marginTop: "4px"
};

export default Dashboard;
