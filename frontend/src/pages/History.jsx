import { useEffect, useMemo, useState } from "react";
import { FiDownload, FiSearch, FiChevronLeft, FiChevronRight, FiInbox } from "react-icons/fi";
import { getWasteHistory } from "../services/api";

/* ─────────────────────────────────────────
   Constants (unchanged)
───────────────────────────────────────── */
const categories = ["All", "Plastic", "Paper", "Metal", "Glass", "Organic"];
const pageSize   = 6;

/* Waste icon map */
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

/* Category accent color map */
const CATEGORY_COLORS = {
  plastic:  { bg: "rgba(14,165,233,0.08)",  border: "rgba(14,165,233,0.20)",  text: "#0EA5E9"  },
  paper:    { bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.20)",  text: "#D97706"  },
  metal:    { bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.20)", text: "#475569"  },
  glass:    { bg: "rgba(6,182,212,0.08)",   border: "rgba(6,182,212,0.20)",   text: "#0891B2"  },
  organic:  { bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.20)",  text: "#059669"  },
  battery:  { bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.20)",   text: "#DC2626"  },
  clothes:  { bg: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.20)",  text: "#7C3AED"  },
  default:  { bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.20)", text: "#475569"  }
};

function getCategoryColors(category = "") {
  return CATEGORY_COLORS[category.toLowerCase()] || CATEGORY_COLORS.default;
}

/* Normalize (unchanged logic) */
function normalizeHistoryItem(item) {
  return {
    ...item,
    wasteType:      item?.wasteType || item?.category || "Unknown",
    category:       item?.category  || "Unknown",
    confidence:     Number(item?.confidence  ?? 0),
    ecoScore:       Number(item?.ecoScore    ?? 0),
    recyclable:     Boolean(item?.recyclable),
    disposalMethod: item?.disposalMethod || "Not available",
    recommendations: Array.isArray(item?.recommendations) ? item.recommendations : []
  };
}

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
function History() {
  const [history, setHistory]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [searchTerm, setSearchTerm]         = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage]       = useState(1);
  const [exportHovered, setExportHovered]   = useState(false);

  /* Fetch (unchanged) */
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getWasteHistory();
        setHistory(Array.isArray(res.data) ? res.data.map(normalizeHistoryItem) : []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch history:", err);
        setError(err.response?.data?.message || "Failed to load analysis history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  /* Filter (unchanged) */
  const filteredHistory = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return history.filter((item) => {
      const matchesCategory =
        categoryFilter === "All" || item.category.toLowerCase() === categoryFilter.toLowerCase();

      if (!matchesCategory) return false;
      if (!query)           return true;

      const searchableText = [
        item.wasteType,
        item.category,
        item.disposalMethod,
        item.recommendations.join(" "),
        String(item.ecoScore),
        String(item.confidence)
      ].join(" ").toLowerCase();

      return searchableText.includes(query);
    });
  }, [history, searchTerm, categoryFilter]);

  /* Pagination (unchanged) */
  const totalPages       = Math.max(1, Math.ceil(filteredHistory.length / pageSize));
  const safePage         = Math.min(currentPage, totalPages);
  const paginatedHistory = filteredHistory.slice((safePage - 1) * pageSize, safePage * pageSize);

  /* Export CSV (unchanged) */
  const exportCSV = () => {
    const csvRows = [
      ["Date", "Waste Type", "Category", "Confidence", "Eco Score", "Recyclable", "Disposal Method"],
      ...filteredHistory.map((item) => [
        new Date(item.createdAt).toLocaleString(),
        item.wasteType,
        item.category,
        item.confidence,
        item.ecoScore,
        item.recyclable ? "Yes" : "No",
        item.disposalMethod
      ])
    ];

    const csv  = csvRows.map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "EcoSort_History.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const canPrevious = safePage > 1;
  const canNext     = safePage < totalPages;

  /* KPI derivations */
  const avgEcoScore    = filteredHistory.length
    ? Math.round(filteredHistory.reduce((s, i) => s + i.ecoScore, 0) / filteredHistory.length)
    : 0;
  const recyclablePct  = filteredHistory.length
    ? Math.round((filteredHistory.filter(i => i.recyclable).length / filteredHistory.length) * 100)
    : 0;

  /* ── Render ── */
  return (
    <main style={pageStyle}>
      <div style={shellStyle}>

        {/* ── Hero ── */}
        <section style={heroStyle}>
          <div style={heroBadgeStyle}>
            <span>📊</span>
            <span>Waste Intelligence Dashboard</span>
          </div>
          <h1 style={heroTitleStyle}>Track, analyze &amp; improve.</h1>
          <p style={heroSubStyle}>
            Track, analyze and improve recycling habits using AI-powered waste classification.
          </p>
        </section>

        {/* ── KPI Cards ── */}
        <section style={kpiRowStyle}>
          <KpiCard
            icon="🔍"
            value={filteredHistory.length}
            label="Total Scans"
            accent="var(--accent)"
            accentBg="var(--accent-light)"
          />
          <KpiCard
            icon="🌱"
            value={avgEcoScore}
            label="Avg Eco Score"
            accent="var(--success)"
            accentBg="var(--success-light)"
          />
          <KpiCard
            icon="♻️"
            value={`${recyclablePct}%`}
            label="Recyclable Waste"
            accent="#8B5CF6"
            accentBg="rgba(139,92,246,0.10)"
          />
          <KpiCard
            icon="📋"
            value={`${safePage}/${totalPages}`}
            label="Current Page"
            accent="var(--warn)"
            accentBg="var(--warn-light)"
          />
        </section>

        {/* ── Toolbar ── */}
        <section style={toolbarStyle}>
          <SearchBar
            value={searchTerm}
            onChange={val => { setSearchTerm(val); setCurrentPage(1); }}
          />
          <button
            id="export-csv-btn"
            onClick={exportCSV}
            style={{
              ...exportBtnStyle,
              transform: exportHovered ? "translateY(-1px)" : "none",
              boxShadow: exportHovered
                ? "0 8px 24px rgba(14,165,233,0.35)"
                : "var(--shadow-sm)"
            }}
            onMouseEnter={() => setExportHovered(true)}
            onMouseLeave={() => setExportHovered(false)}
          >
            <FiDownload size={15} />
            Export CSV
          </button>
        </section>

        {/* ── Category Filter Chips ── */}
        <section style={filterBarStyle}>
          {categories.map(cat => (
            <FilterChip
              key={cat}
              label={cat}
              active={categoryFilter === cat}
              onClick={() => { setCategoryFilter(cat); setCurrentPage(1); }}
            />
          ))}
        </section>

        {/* ── Content ── */}
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState message={error} />
        ) : filteredHistory.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <section style={gridStyle}>
              {paginatedHistory.map(scan => (
                <ScanCard key={scan._id} scan={scan} />
              ))}
            </section>

            <Pagination
              page={safePage}
              total={totalPages}
              canPrev={canPrevious}
              canNext={canNext}
              onPrev={() => setCurrentPage(p => Math.max(1, p - 1))}
              onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            />
          </>
        )}
      </div>
    </main>
  );
}

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */

function KpiCard({ icon, value, label, accent, accentBg }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...kpiCardStyle,
        transform:  hovered ? "translateY(-3px)" : "none",
        boxShadow:  hovered ? "var(--shadow-lg)" : "var(--shadow-md)",
        borderColor: hovered ? accent : "var(--border)"
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ ...kpiIconStyle, background: accentBg }}>
        <span style={{ fontSize: "22px" }}>{icon}</span>
      </div>
      <div style={kpiNumStyle}>{value}</div>
      <div style={kpiLabelStyle}>{label}</div>
    </div>
  );
}

function SearchBar({ value, onChange }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{
      ...searchWrapStyle,
      borderColor: focused ? "var(--accent)" : "var(--border)",
      boxShadow:   focused ? "0 0 0 3px var(--accent-light), var(--shadow-sm)" : "var(--shadow-sm)"
    }}>
      <FiSearch size={16} color={focused ? "var(--accent)" : "var(--text-tertiary)"} />
      <input
        id="history-search"
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search waste type, category, method, or score…"
        style={searchInputStyle}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", padding: "0 2px", display: "flex" }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      id={`filter-${label.toLowerCase()}`}
      onClick={onClick}
      style={{
        ...chipStyle,
        background: active   ? "var(--success-light)" : hovered ? "#F1F5F9" : "#fff",
        color:      active   ? "var(--success)"       : "var(--text-secondary)",
        borderColor: active  ? "var(--success-border)" : "var(--border)",
        fontWeight: active   ? 700 : 600,
        transform:  hovered  ? "translateY(-1px)" : "none",
        boxShadow:  hovered  ? "var(--shadow-sm)" : "none"
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </button>
  );
}

function ScanCard({ scan }) {
  const [hovered, setHovered]   = useState(false);
  const catColors                = getCategoryColors(scan.category);
  const icon                     = getWasteIcon(scan.category);
  const confidenceNum            = Math.round(scan.confidence);
  const ecoColor                 = scan.ecoScore >= 70 ? "var(--success)" : scan.ecoScore >= 50 ? "var(--warn)" : "var(--danger)";

  return (
    <article
      style={{
        ...cardStyle,
        transform:  hovered ? "translateY(-4px)" : "none",
        boxShadow:  hovered ? "var(--shadow-lg)" : "var(--shadow-md)",
        borderColor: hovered ? "rgba(14,165,233,0.20)" : "var(--border)"
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Card header */}
      <div style={cardHeaderStyle}>
        <div style={cardIconBubbleStyle}>
          <span style={{ fontSize: "24px" }}>{icon}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={cardWasteTypeStyle}>{scan.wasteType}</div>
          <div style={{ ...cardCategoryBadgeStyle, background: catColors.bg, color: catColors.text, borderColor: catColors.border }}>
            {scan.category}
          </div>
        </div>
        <div style={{
          ...recyclablePillStyle,
          background: scan.recyclable ? "var(--success-light)" : "var(--danger-light)",
          color:      scan.recyclable ? "var(--success)"       : "var(--danger)",
          borderColor: scan.recyclable ? "var(--success-border)" : "var(--danger-border)"
        }}>
          {scan.recyclable ? "♻ Recyclable" : "✗ Non-recyclable"}
        </div>
      </div>

      {/* Metrics row */}
      <div style={metricsRowStyle}>
        {/* Confidence with progress bar */}
        <div style={metricBoxStyle}>
          <div style={metricLabelStyle}>Confidence</div>
          <div style={metricValueStyle}>{confidenceNum}%</div>
          <div style={progressTrackStyle}>
            <div style={{
              ...progressFillStyle,
              width: `${confidenceNum}%`,
              background: confidenceNum >= 80
                ? "linear-gradient(90deg, #10B981, #059669)"
                : confidenceNum >= 60
                  ? "linear-gradient(90deg, #F59E0B, #D97706)"
                  : "linear-gradient(90deg, #EF4444, #DC2626)"
            }} />
          </div>
        </div>

        {/* Eco Score */}
        <div style={metricBoxStyle}>
          <div style={metricLabelStyle}>Eco Score</div>
          <div style={{ ...metricValueStyle, color: ecoColor }}>{scan.ecoScore}/100</div>
          <div style={progressTrackStyle}>
            <div style={{
              ...progressFillStyle,
              width: `${scan.ecoScore}%`,
              background: `linear-gradient(90deg, ${ecoColor}, ${ecoColor}88)`
            }} />
          </div>
        </div>
      </div>

      {/* Disposal Method */}
      <div style={detailSectionStyle}>
        <div style={detailLabelStyle}>Disposal Method</div>
        <div style={detailTextStyle}>{scan.disposalMethod}</div>
      </div>

      {/* Recommendations */}
      {scan.recommendations.length > 0 && (
        <div style={detailSectionStyle}>
          <div style={detailLabelStyle}>Recommendations</div>
          <ul style={recListStyle}>
            {scan.recommendations.map(rec => (
              <li key={rec} style={recItemStyle}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Timestamp */}
      <div style={timestampStyle}>
        🕐 {new Date(scan.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        {" at "}
        {new Date(scan.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
      </div>
    </article>
  );
}

function Pagination({ page, total, canPrev, canNext, onPrev, onNext }) {
  return (
    <div style={paginationStyle}>
      <PagButton id="pagination-prev" onClick={onPrev} disabled={!canPrev}>
        <FiChevronLeft size={16} /> Previous
      </PagButton>
      <div style={pageInfoStyle}>Page {page} of {total}</div>
      <PagButton id="pagination-next" onClick={onNext} disabled={!canNext}>
        Next <FiChevronRight size={16} />
      </PagButton>
    </div>
  );
}

function PagButton({ id, onClick, disabled, children }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...pagBtnStyle,
        opacity:   disabled ? 0.45 : 1,
        cursor:    disabled ? "not-allowed" : "pointer",
        background: hovered && !disabled ? "#F1F5F9" : "#fff",
        transform:  hovered && !disabled ? "translateY(-1px)" : "none"
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}

function LoadingSkeleton() {
  return (
    <div style={gridStyle}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ ...cardStyle, minHeight: 220 }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
            <div className="skeleton" style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 12, width: "40%" }} />
            </div>
          </div>
          <div className="skeleton" style={{ height: 12, width: "90%", marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 12, width: "70%", marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 8, width: "100%", borderRadius: "var(--radius-full)" }} />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={emptyStyle}>
      <FiInbox size={44} color="var(--text-tertiary)" />
      <h2 style={{ fontSize: "1.2rem", color: "var(--text-primary)", margin: 0 }}>No matching scans found</h2>
      <p style={{ color: "var(--text-secondary)", maxWidth: "36ch", margin: 0, lineHeight: 1.7 }}>
        Try a different search term or clear the active category filter.
      </p>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div style={{ ...emptyStyle, background: "var(--danger-light)", borderColor: "var(--danger-border)" }}>
      <span style={{ fontSize: "36px" }}>⚠️</span>
      <h2 style={{ fontSize: "1.1rem", color: "#B91C1C", margin: 0 }}>Failed to load history</h2>
      <p style={{ color: "#991B1B", margin: 0 }}>{message}</p>
    </div>
  );
}

/* ─────────────────────────────────────────
   Page Styles
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

/* Hero */
const heroStyle = {
  marginBottom: "32px"
};

const heroBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "5px 14px",
  borderRadius: "var(--radius-full)",
  background: "var(--accent-light)",
  border: "1px solid var(--accent-border)",
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
  marginBottom: "10px"
};

const heroSubStyle = {
  fontSize: "1rem",
  color: "var(--text-secondary)",
  lineHeight: 1.7,
  maxWidth: "60ch"
};

/* KPI row */
const kpiRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "14px",
  marginBottom: "24px"
};

const kpiCardStyle = {
  background: "var(--surface)",
  border: "1.5px solid var(--border)",
  borderRadius: "var(--radius-xl)",
  padding: "20px",
  transition: "transform 0.2s var(--ease-out), box-shadow 0.2s ease, border-color 0.2s ease"
};

const kpiIconStyle = {
  width: "44px",
  height: "44px",
  borderRadius: "var(--radius-md)",
  display: "grid",
  placeItems: "center",
  marginBottom: "12px"
};

const kpiNumStyle = {
  fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
  fontWeight: 800,
  color: "var(--text-primary)",
  letterSpacing: "-0.04em",
  lineHeight: 1
};

const kpiLabelStyle = {
  marginTop: "4px",
  fontSize: "0.78rem",
  color: "var(--text-secondary)",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.06em"
};

/* Toolbar */
const toolbarStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "14px"
};

const searchWrapStyle = {
  flex: "1 1 300px",
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

const searchInputStyle = {
  flex: 1,
  border: "none",
  outline: "none",
  background: "transparent",
  fontSize: "0.92rem",
  color: "var(--text-primary)",
  fontFamily: "var(--font-sans)"
};

const exportBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "0 18px",
  height: "46px",
  borderRadius: "var(--radius-md)",
  border: "1.5px solid var(--accent-border)",
  background: "var(--accent-light)",
  color: "var(--accent)",
  fontSize: "0.88rem",
  fontWeight: 700,
  cursor: "pointer",
  transition: "transform 0.18s var(--ease-out), box-shadow 0.18s ease",
  fontFamily: "var(--font-sans)"
};

/* Filter chips */
const filterBarStyle = {
  display: "flex",
  gap: "8px",
  overflowX: "auto",
  paddingBottom: "4px",
  marginBottom: "20px"
};

const chipStyle = {
  padding: "7px 16px",
  borderRadius: "var(--radius-full)",
  border: "1.5px solid var(--border)",
  fontSize: "0.84rem",
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "all 0.18s ease",
  fontFamily: "var(--font-sans)"
};

/* Grid */
const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "16px",
  marginBottom: "24px"
};

/* Scan Card */
const cardStyle = {
  background: "var(--surface)",
  border: "1.5px solid var(--border)",
  borderRadius: "var(--radius-2xl)",
  padding: "20px",
  transition: "transform 0.2s var(--ease-out), box-shadow 0.2s ease, border-color 0.2s ease",
  display: "flex",
  flexDirection: "column",
  gap: 0
};

const cardHeaderStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  marginBottom: "16px"
};

const cardIconBubbleStyle = {
  width: "48px",
  height: "48px",
  borderRadius: "var(--radius-md)",
  background: "#F1F5F9",
  display: "grid",
  placeItems: "center",
  flexShrink: 0
};

const cardWasteTypeStyle = {
  fontSize: "1rem",
  fontWeight: 700,
  color: "var(--text-primary)",
  marginBottom: "5px",
  lineHeight: 1.2
};

const cardCategoryBadgeStyle = {
  display: "inline-flex",
  padding: "3px 10px",
  borderRadius: "var(--radius-full)",
  border: "1px solid",
  fontSize: "0.74rem",
  fontWeight: 700,
  letterSpacing: "0.04em"
};

const recyclablePillStyle = {
  marginLeft: "auto",
  flexShrink: 0,
  padding: "4px 10px",
  borderRadius: "var(--radius-full)",
  border: "1px solid",
  fontSize: "0.72rem",
  fontWeight: 700,
  whiteSpace: "nowrap"
};

const metricsRowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
  marginBottom: "14px"
};

const metricBoxStyle = {
  padding: "12px",
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
  marginBottom: "4px"
};

const metricValueStyle = {
  fontSize: "1.05rem",
  fontWeight: 800,
  color: "var(--text-primary)",
  marginBottom: "6px"
};

const progressTrackStyle = {
  height: "5px",
  borderRadius: "var(--radius-full)",
  background: "#E2E8F0",
  overflow: "hidden"
};

const progressFillStyle = {
  height: "100%",
  borderRadius: "inherit",
  animation: "progressFill 0.7s var(--ease-out) both"
};

const detailSectionStyle = {
  paddingTop: "12px",
  marginTop: "12px",
  borderTop: "1px solid var(--border-subtle)"
};

const detailLabelStyle = {
  fontSize: "0.72rem",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color: "var(--text-secondary)",
  fontWeight: 700,
  marginBottom: "5px"
};

const detailTextStyle = {
  fontSize: "0.9rem",
  color: "#334155",
  lineHeight: 1.65
};

const recListStyle = {
  margin: "6px 0 0",
  paddingLeft: "16px",
  color: "#334155"
};

const recItemStyle = {
  fontSize: "0.88rem",
  lineHeight: 1.6,
  marginBottom: "4px"
};

const timestampStyle = {
  marginTop: "12px",
  paddingTop: "10px",
  borderTop: "1px solid var(--border-subtle)",
  fontSize: "0.78rem",
  color: "var(--text-tertiary)",
  fontWeight: 500
};

/* Pagination */
const paginationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  marginTop: "8px",
  flexWrap: "wrap"
};

const pagBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "10px 18px",
  borderRadius: "var(--radius-md)",
  border: "1.5px solid var(--border)",
  fontSize: "0.875rem",
  fontWeight: 700,
  color: "var(--text-primary)",
  transition: "all 0.18s ease",
  fontFamily: "var(--font-sans)"
};

const pageInfoStyle = {
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "var(--text-secondary)"
};

/* Empty / Error */
const emptyStyle = {
  minHeight: "260px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  gap: "12px",
  background: "var(--surface)",
  border: "1.5px dashed var(--border)",
  borderRadius: "var(--radius-2xl)",
  padding: "40px 24px"
};

export default History;
