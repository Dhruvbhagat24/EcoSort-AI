import { useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCamera,
  FiCheckCircle,
  FiLoader,
  FiRefreshCw,
  FiUpload
} from "react-icons/fi";
import { analyzeWaste } from "../services/api";

/* ─────────────────────────────────────────
   Normalizers (unchanged)
───────────────────────────────────────── */
const normalizeConfidence = (value) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return { raw: 0, display: "0%" };
  const pct = numeric <= 1 ? Math.round(numeric * 100) : Math.round(numeric);
  return { raw: pct, display: `${pct}%` };
};

const normalizeEcoScore = (value) => {
  const numeric = Number(value);
  return Number.isNaN(numeric) ? 0 : Math.round(numeric);
};

const normalizeResult = (data) => {
  const conf = normalizeConfidence(data?.confidence);
  return {
    id:                  data?._id,
    wasteType:           data?.wasteType || data?.category || "Unknown",
    category:            data?.category  || "Unknown",
    confidence:          conf.display,
    confidenceRaw:       conf.raw,
    recyclable:          Boolean(data?.recyclable),
    ecoScore:            normalizeEcoScore(data?.ecoScore),
    disposalMethod:      data?.disposalMethod || "Not available",
    environmentalImpact: data?.environmentalImpact || "No environmental impact details available.",
    recommendations:     Array.isArray(data?.recommendations) ? data.recommendations : []
  };
};

/* ─────────────────────────────────────────
   Waste icon map
───────────────────────────────────────── */
const WASTE_ICONS = {
  plastic:   "♻️",
  paper:     "📄",
  glass:     "🍾",
  metal:     "🥫",
  battery:   "🔋",
  organic:   "🍌",
  clothes:   "👕",
  shoes:     "👟",
  cardboard: "📦",
  trash:     "🗑️",
  default:   "🗑️"
};

function getWasteIcon(category = "") {
  return WASTE_ICONS[category.toLowerCase()] || WASTE_ICONS.default;
}

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
function ScanWaste() {
  const [image,   setImage]   = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  /* Handlers (unchanged logic) */
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (preview) URL.revokeObjectURL(preview);
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      if (preview) URL.revokeObjectURL(preview);
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

      const res = await analyzeWaste(formData);
      setResult(normalizeResult(res.data));
      setImage(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to analyze image");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const ecoScoreColor = useMemo(() => {
    if (!result) return "var(--text-secondary)";
    if (result.ecoScore >= 70) return "var(--success)";
    if (result.ecoScore >= 50) return "var(--warn)";
    return "var(--danger)";
  }, [result]);

  /* ── Render ── */
  return (
    <div style={pageStyle}>
      <main style={shellStyle}>

        {/* ── Hero ── */}
        <section style={heroStyle}>
          <div style={heroBadgeStyle}>
            <span>🤖</span>
            <span>AI Waste Scanner</span>
          </div>
          <h1 style={heroTitleStyle}>Scan. Classify. Dispose.</h1>
          <p style={heroSubStyle}>
            Capture an image, analyze it with EfficientNet-B0, and receive instant
            disposal guidance, eco score, and recycling recommendations.
          </p>
        </section>

        <section style={contentGridStyle}>
          {/* ── Upload panel ── */}
          <div style={panelStyle}>

            {/* Drop zone */}
            <label
              id="upload-dropzone"
              style={{
                ...uploadZoneStyle,
                borderColor: dragOver ? "var(--accent)" : preview ? "var(--success-border)" : "var(--border)",
                background:  dragOver ? "var(--accent-light)" : preview ? "var(--success-light)" : "#F8FAFC"
              }}
              onDragOver={e => { e.preventDefault(); setDragOver(true);  }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              <div style={uploadIconCircleStyle}>
                <FiCamera size={28} color={preview ? "var(--success)" : "var(--accent)"} />
              </div>
              <div style={uploadTextStyle}>
                {preview ? "Image ready · tap to replace" : "Drop your image here or tap to browse"}
              </div>
              <div style={uploadHintStyle}>
                {preview ? "Camera, gallery, or drag & drop" : "JPG, PNG, WEBP — max 10 MB"}
              </div>
            </label>

            {/* Preview */}
            {preview && (
              <div style={previewWrapStyle}>
                <img src={preview} alt="Waste preview" style={previewImgStyle} />
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={errorBannerStyle}>
                <FiAlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div style={actionsStyle}>
              <AnalyzeButton loading={loading} disabled={!preview} onClick={handleAnalyze} />
              <button id="scan-reset-btn" onClick={handleReset} style={resetBtnStyle}>
                <FiRefreshCw size={16} />
                Reset
              </button>
            </div>

            {/* Tips */}
            {!preview && !result && (
              <div style={tipsStyle}>
                {[
                  { icon: "📸", text: "Use good lighting for best accuracy" },
                  { icon: "🎯", text: "Center the object in frame"          },
                  { icon: "📐", text: "Avoid blurry or distant shots"       }
                ].map(tip => (
                  <div key={tip.text} style={tipItemStyle}>
                    <span>{tip.icon}</span>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>{tip.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Result panel ── */}
          <div style={panelStyle}>
            {!result ? (
              <EmptyResultState loading={loading} />
            ) : (
              <ResultView result={result} ecoScoreColor={ecoScoreColor} />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */

function AnalyzeButton({ loading, disabled, onClick }) {
  const [hovered, setHovered] = useState(false);
  const isDisabled = disabled || loading;

  return (
    <button
      id="scan-analyze-btn"
      onClick={onClick}
      disabled={isDisabled}
      style={{
        ...analyzeBtnStyle,
        opacity:   isDisabled ? 0.6 : 1,
        cursor:    isDisabled ? "not-allowed" : "pointer",
        transform: hovered && !isDisabled ? "translateY(-2px)" : "none",
        boxShadow: hovered && !isDisabled
          ? "0 10px 28px rgba(16,185,129,0.40)"
          : "0 4px 14px rgba(16,185,129,0.22)"
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {loading
        ? <><FiLoader className="spin" size={17} /> Analyzing…</>
        : <><FiUpload size={17} /> Analyze Waste</>
      }
    </button>
  );
}

function EmptyResultState({ loading }) {
  return (
    <div style={emptyResultStyle}>
      <div style={emptyIconStyle}>
        {loading ? <FiLoader className="spin" size={36} color="var(--accent)" /> : <FiCheckCircle size={36} color="var(--text-tertiary)" />}
      </div>
      <h2 style={{ fontSize: "1.2rem", color: "var(--text-primary)", margin: 0 }}>
        {loading ? "Analyzing image…" : "Results appear here"}
      </h2>
      <p style={{ color: "var(--text-secondary)", maxWidth: "32ch", margin: 0, lineHeight: 1.7, fontSize: "0.92rem" }}>
        {loading
          ? "Our AI model is classifying your waste — this takes just a second."
          : "Upload a waste image and tap Analyze to see category, confidence, eco score, and disposal guidance."
        }
      </p>
    </div>
  );
}

function ResultView({ result, ecoScoreColor }) {
  const icon = getWasteIcon(result.category);

  return (
    <div style={{ animation: "fadeSlideUp 0.35s var(--ease-out) both" }}>
      {/* Banner */}
      <div style={{
        ...resultBannerStyle,
        background:   result.recyclable ? "var(--success-light)" : "var(--danger-light)",
        borderColor:  result.recyclable ? "var(--success-border)" : "var(--danger-border)"
      }}>
        <span style={{ fontSize: "40px" }}>{icon}</span>
        <div>
          <div style={resultWasteTypeStyle}>{result.wasteType}</div>
          <div style={{ marginTop: "4px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            {result.recyclable ? "✅ Recyclable item" : "⚠️ Handle as non-recyclable waste"}
          </div>
        </div>
        <div style={{
          ...recyclableBadgeStyle,
          background: result.recyclable ? "var(--success-light)" : "var(--danger-light)",
          color:      result.recyclable ? "var(--success)"       : "var(--danger)",
          borderColor: result.recyclable ? "var(--success-border)" : "var(--danger-border)"
        }}>
          {result.recyclable ? "Recyclable" : "Non-recyclable"}
        </div>
      </div>

      {/* Metrics grid */}
      <div style={metricGridStyle}>
        <MetricCard label="Category" value={result.category} />
        <MetricCard label="Recyclable" value={result.recyclable ? "Yes" : "No"} />
      </div>

      {/* Confidence bar */}
      <ProgressMetric
        label="Confidence"
        value={result.confidence}
        pct={result.confidenceRaw}
        color={result.confidenceRaw >= 80
          ? "linear-gradient(90deg, #10B981, #059669)"
          : result.confidenceRaw >= 60
            ? "linear-gradient(90deg, #F59E0B, #D97706)"
            : "linear-gradient(90deg, #EF4444, #DC2626)"
        }
      />

      {/* Eco Score bar */}
      <ProgressMetric
        label="Eco Score"
        value={`${result.ecoScore}/100`}
        pct={result.ecoScore}
        color={`linear-gradient(90deg, ${ecoScoreColor}, ${ecoScoreColor}88)`}
        valueColor={ecoScoreColor}
      />

      {/* Detail cards */}
      <DetailCard label="Disposal Method"    text={result.disposalMethod}      />
      <DetailCard label="Environmental Impact" text={result.environmentalImpact} />

      {/* Recommendations */}
      <div style={detailCardStyle}>
        <div style={detailLabelStyle}>Recommendations</div>
        {result.recommendations.length > 0 ? (
          <ul style={recListStyle}>
            {result.recommendations.map(rec => (
              <li key={rec} style={recItemStyle}>{rec}</li>
            ))}
          </ul>
        ) : (
          <div style={detailTextStyle}>No recommendations available.</div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div style={metricCardStyle}>
      <div style={metricLabelStyle}>{label}</div>
      <div style={metricValueStyle}>{value}</div>
    </div>
  );
}

function ProgressMetric({ label, value, pct, color, valueColor }) {
  return (
    <div style={progressMetricStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <div style={metricLabelStyle}>{label}</div>
        <div style={{ ...metricValueStyle, color: valueColor || "var(--text-primary)", fontSize: "0.95rem" }}>{value}</div>
      </div>
      <div style={progressTrackStyle}>
        <div style={{ ...progressFillStyle, width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function DetailCard({ label, text }) {
  return (
    <div style={detailCardStyle}>
      <div style={detailLabelStyle}>{label}</div>
      <div style={detailTextStyle}>{text}</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Styles
───────────────────────────────────────── */

const pageStyle = {
  minHeight: "100svh",
  padding: "32px 20px 48px",
  background: "var(--bg)"
};

const shellStyle = {
  maxWidth: "1200px",
  margin: "0 auto"
};

const heroStyle = {
  marginBottom: "28px"
};

const heroBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "5px 14px",
  borderRadius: "var(--radius-full)",
  background: "rgba(14,165,233,0.10)",
  border: "1px solid rgba(14,165,233,0.25)",
  color: "var(--accent)",
  fontSize: "0.78rem",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  marginBottom: "14px"
};

const heroTitleStyle = {
  fontSize: "clamp(2rem, 4vw, 3rem)",
  fontWeight: 800,
  letterSpacing: "-0.04em",
  color: "var(--text-primary)",
  lineHeight: 1.1,
  marginBottom: "10px",
  maxWidth: "16ch"
};

const heroSubStyle = {
  fontSize: "1rem",
  color: "var(--text-secondary)",
  lineHeight: 1.7,
  maxWidth: "60ch"
};

const contentGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "20px",
  alignItems: "start"
};

const panelStyle = {
  background: "var(--surface)",
  border: "1.5px solid var(--border)",
  borderRadius: "var(--radius-2xl)",
  boxShadow: "var(--shadow-md)",
  padding: "24px",
  backdropFilter: "blur(8px)"
};

/* Upload zone */
const uploadZoneStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "28px 20px",
  borderRadius: "var(--radius-xl)",
  border: "2px dashed",
  cursor: "pointer",
  textAlign: "center",
  gap: "8px",
  transition: "all 0.2s ease",
  marginBottom: "16px"
};

const uploadIconCircleStyle = {
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  background: "#fff",
  display: "grid",
  placeItems: "center",
  boxShadow: "var(--shadow-sm)",
  marginBottom: "4px"
};

const uploadTextStyle = {
  fontSize: "0.96rem",
  fontWeight: 700,
  color: "var(--text-primary)"
};

const uploadHintStyle = {
  fontSize: "0.82rem",
  color: "var(--text-secondary)"
};

const previewWrapStyle = {
  borderRadius: "var(--radius-lg)",
  overflow: "hidden",
  border: "1.5px solid var(--border)",
  marginBottom: "16px",
  background: "#F8FAFC"
};

const previewImgStyle = {
  display: "block",
  width: "100%",
  maxHeight: "320px",
  objectFit: "cover"
};

const errorBannerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "12px 14px",
  borderRadius: "var(--radius-md)",
  background: "var(--danger-light)",
  color: "#B91C1C",
  border: "1px solid var(--danger-border)",
  fontSize: "0.9rem",
  marginBottom: "14px"
};

const actionsStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap"
};

const analyzeBtnStyle = {
  flex: "1 1 180px",
  minHeight: "48px",
  border: "none",
  borderRadius: "var(--radius-md)",
  background: "linear-gradient(135deg, #10B981, #059669)",
  color: "#fff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  fontSize: "0.96rem",
  fontWeight: 700,
  transition: "transform 0.18s var(--ease-out), box-shadow 0.18s ease, opacity 0.18s ease",
  fontFamily: "var(--font-sans)"
};

const resetBtnStyle = {
  minHeight: "48px",
  padding: "0 18px",
  borderRadius: "var(--radius-md)",
  border: "1.5px solid var(--border)",
  background: "#fff",
  color: "var(--text-primary)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  fontSize: "0.92rem",
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "var(--font-sans)"
};

const tipsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  marginTop: "18px",
  padding: "14px",
  borderRadius: "var(--radius-md)",
  background: "#F8FAFC",
  border: "1px solid var(--border-subtle)"
};

const tipItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

/* Empty result */
const emptyResultStyle = {
  minHeight: "360px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  gap: "14px",
  padding: "20px"
};

const emptyIconStyle = {
  width: "72px",
  height: "72px",
  borderRadius: "50%",
  background: "#F1F5F9",
  display: "grid",
  placeItems: "center",
  marginBottom: "4px"
};

/* Result banner */
const resultBannerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  padding: "16px",
  borderRadius: "var(--radius-xl)",
  border: "1.5px solid",
  marginBottom: "16px",
  position: "relative"
};

const resultWasteTypeStyle = {
  fontSize: "1.35rem",
  fontWeight: 800,
  color: "var(--text-primary)",
  lineHeight: 1.1
};

const recyclableBadgeStyle = {
  marginLeft: "auto",
  flexShrink: 0,
  padding: "4px 12px",
  borderRadius: "var(--radius-full)",
  border: "1px solid",
  fontSize: "0.75rem",
  fontWeight: 700,
  alignSelf: "flex-start"
};

/* Metric grid */
const metricGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "10px",
  marginBottom: "12px"
};

const metricCardStyle = {
  padding: "12px 14px",
  borderRadius: "var(--radius-md)",
  background: "#F8FAFC",
  border: "1px solid var(--border-subtle)"
};

const metricLabelStyle = {
  fontSize: "0.72rem",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color: "var(--text-secondary)",
  fontWeight: 700,
  marginBottom: "5px"
};

const metricValueStyle = {
  fontSize: "1rem",
  fontWeight: 800,
  color: "var(--text-primary)"
};

/* Progress metric */
const progressMetricStyle = {
  padding: "12px 14px",
  borderRadius: "var(--radius-md)",
  background: "#F8FAFC",
  border: "1px solid var(--border-subtle)",
  marginBottom: "10px"
};

const progressTrackStyle = {
  height: "6px",
  borderRadius: "var(--radius-full)",
  background: "#E2E8F0",
  overflow: "hidden"
};

const progressFillStyle = {
  height: "100%",
  borderRadius: "inherit",
  animation: "progressFill 0.7s var(--ease-out) both"
};

/* Detail cards */
const detailCardStyle = {
  padding: "14px",
  borderRadius: "var(--radius-md)",
  background: "#fff",
  border: "1px solid var(--border-subtle)",
  marginBottom: "10px"
};

const detailLabelStyle = {
  fontSize: "0.72rem",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color: "var(--text-secondary)",
  fontWeight: 700,
  marginBottom: "6px"
};

const detailTextStyle = {
  fontSize: "0.92rem",
  color: "#334155",
  lineHeight: 1.65
};

const recListStyle = {
  margin: "6px 0 0",
  paddingLeft: "16px",
  color: "#334155"
};

const recItemStyle = {
  fontSize: "0.9rem",
  lineHeight: 1.6,
  marginBottom: "4px"
};

export default ScanWaste;