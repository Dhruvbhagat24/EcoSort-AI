import { useEffect, useState } from "react";
import { FiFilter, FiDownload } from "react-icons/fi";
import API from "../services/api";

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get("/waste/history");
        setHistory(res.data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const categories = ["All", "Plastic", "Paper", "Metal", "Glass", "Organic"];
  const filtered = categoryFilter === "All" ? history : history.filter(h => h.category === categoryFilter);

  const exportCSV = () => {
    const csv = [
      ["Date", "Waste Type", "Category", "Eco Score", "Recyclable", "Disposal Method"],
      ...filtered.map(h => [
        new Date(h.createdAt).toLocaleDateString(),
        h.wasteType,
        h.category,
        h.ecoScore,
        h.recyclable ? "Yes" : "No",
        h.disposalMethod
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "EcoSort_History.csv";
    a.click();
  };

  if (loading) return <div style={{ padding: "32px", textAlign: "center" }}>Loading...</div>;

  return (
    <main style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ margin: 0 }}>Analysis History</h1>
        <button
          onClick={exportCSV}
          style={{
            background: "#10b981",
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px"
          }}
        >
          <FiDownload size={16} /> Export CSV
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", overflowX: "auto", paddingBottom: "8px" }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            style={{
              padding: "8px 16px",
              border: categoryFilter === cat ? "2px solid #8b5cf6" : "1px solid #e5e7eb",
              borderRadius: "20px",
              background: categoryFilter === cat ? "#f3e8ff" : "#fff",
              color: categoryFilter === cat ? "#8b5cf6" : "#666",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: categoryFilter === cat ? "600" : "400",
              whiteSpace: "nowrap"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* History List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 24px", color: "#999" }}>
          <FiFilter size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
          <p>No analyses found in this category.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {filtered.map(scan => (
            <div
              key={scan._id}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                <div>
                  <div style={labelStyle}>Waste Type</div>
                  <div style={valueStyle}>{scan.wasteType}</div>
                </div>
                <div>
                  <div style={labelStyle}>Category</div>
                  <div style={valueStyle}>{scan.category}</div>
                </div>
                <div>
                  <div style={labelStyle}>Eco Score</div>
                  <div style={{ ...valueStyle, color: scan.ecoScore >= 70 ? "#10b981" : scan.ecoScore >= 50 ? "#f59e0b" : "#ef4444" }}>
                    {scan.ecoScore}
                  </div>
                </div>
                <div>
                  <div style={labelStyle}>Recyclable</div>
                  <div style={valueStyle}>{scan.recyclable ? "✅ Yes" : "❌ No"}</div>
                </div>
              </div>
              <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #f0f0f0" }}>
                <div style={labelStyle}>Disposal Method</div>
                <div style={{ fontSize: "14px", color: "#333" }}>{scan.disposalMethod}</div>
              </div>
              {scan.recommendations && scan.recommendations.length > 0 && (
                <div style={{ marginTop: "12px" }}>
                  <div style={labelStyle}>Recommendations</div>
                  <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px", color: "#666", fontSize: "14px" }}>
                    {scan.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div style={{ marginTop: "12px", fontSize: "12px", color: "#999" }}>
                {new Date(scan.createdAt).toLocaleDateString()} at {new Date(scan.createdAt).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

const labelStyle = {
  fontSize: "12px",
  color: "#999",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: "4px"
};

const valueStyle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#333"
};

export default History;
