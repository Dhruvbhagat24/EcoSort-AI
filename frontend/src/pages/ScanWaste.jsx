import { useState } from "react";
import { FiCamera, FiUpload, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import API from "../services/api";

function ScanWaste() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!image) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", image);

      const res = await API.post("/waste/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setResult(res.data);
      setImage(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to analyze image");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto", backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", marginBottom: "32px", color: "#000" }}>Scan Waste</h1>

      {!result ? (
        <div>
          {/* File Upload Box */}
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "2px dashed #8b5cf6",
              borderRadius: "12px",
              padding: "48px 24px",
              textAlign: "center",
              cursor: "pointer",
              background: "#f3e8ff",
              transition: "all 0.3s"
            }}
          >
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <FiCamera size={48} color="#8b5cf6" style={{ marginBottom: "12px" }} />
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
              {preview ? "Image Selected" : "Take or Upload Photo"}
            </div>
            <div style={{ fontSize: "14px", color: "#4b5563" }}>
              {preview ? "Click to change image" : "Click to select waste image"}
            </div>
          </label>

          {/* Image Preview */}
          {preview && (
            <div style={{ marginTop: "24px", textAlign: "center" }}>
              <img
                src={preview}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb"
                }}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              style={{
                marginTop: "20px",
                padding: "12px 16px",
                background: "#fee2e2",
                color: "#7f1d1d",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <FiAlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <button
              onClick={handleAnalyze}
              disabled={!preview || loading}
              style={{
                flex: 1,
                padding: "12px 24px",
                background: preview ? "#8b5cf6" : "#d1d5db",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: preview ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <FiUpload size={18} />
              {loading ? "Analyzing..." : "Analyze Waste"}
            </button>
            {preview && (
              <button
                onClick={handleReset}
                style={{
                  padding: "12px 24px",
                  background: "#e5e7eb",
                  color: "#1f2937",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Analysis Result */
        <div>
          <div
            style={{
              background: result.recyclable ? "#d1fae5" : "#fecaca",
              border: `2px solid ${result.recyclable ? "#10b981" : "#f87171"}`,
              borderRadius: "12px",
              padding: "24px",
              textAlign: "center",
              marginBottom: "24px"
            }}
          >
            <FiCheckCircle
              size={48}
              color={result.recyclable ? "#10b981" : "#ef4444"}
              style={{ marginBottom: "12px" }}
            />
            <div style={{ fontSize: "28px", fontWeight: "700", color: "#1f2937", marginBottom: "8px" }}>
              {result.wasteType}
            </div>
            <div style={{ fontSize: "16px", color: "#4b5563" }}>
              {result.recyclable ? "♻️ This item is recyclable!" : "This item is not recyclable"}
            </div>
          </div>

          {/* Result Details Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
            <div style={resultCardStyle}>
              <div style={labelStyle}>Category</div>
              <div style={valueStyle}>{result.category}</div>
            </div>
            <div style={resultCardStyle}>
              <div style={labelStyle}>Eco Score</div>
              <div style={{ ...valueStyle, color: result.ecoScore >= 70 ? "#10b981" : result.ecoScore >= 50 ? "#f59e0b" : "#ef4444" }}>
                {result.ecoScore}/100
              </div>
            </div>
          </div>

          {/* Disposal Method */}
          <div style={resultCardStyle}>
            <div style={labelStyle}>Disposal Method</div>
            <div style={valueStyle}>{result.disposalMethod}</div>
          </div>

          {/* Environmental Impact */}
          <div style={{ ...resultCardStyle, marginTop: "16px" }}>
            <div style={labelStyle}>Environmental Impact</div>
            <div style={{ fontSize: "14px", color: "#1f2937", lineHeight: "1.6" }}>{result.environmentalImpact}</div>
          </div>

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div style={{ ...resultCardStyle, marginTop: "16px" }}>
              <div style={labelStyle}>Recommendations</div>
              <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px", color: "#1f2937", fontSize: "14px" }}>
                {result.recommendations.map((rec, i) => (
                  <li key={i} style={{ marginBottom: "4px" }}>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <button
              onClick={handleReset}
              style={{
                flex: 1,
                padding: "12px 24px",
                background: "#8b5cf6",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <FiCamera size={18} />
              Scan Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const resultCardStyle = {
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "16px"
};

const labelStyle = {
  fontSize: "12px",
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: "8px"
};

const valueStyle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1f2937"
};

export default ScanWaste;