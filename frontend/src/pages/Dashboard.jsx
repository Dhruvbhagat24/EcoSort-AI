import { useEffect, useState } from "react";
import { FiAlertTriangle, FiAward, FiCheckCircle, FiGift, FiHeart, FiPackage, FiRefreshCw, FiStar, FiTrendingUp } from "react-icons/fi";
import { getRecentScans, getWasteStats } from "../services/api";

/* ─────────────────────────────────────────
   Normalizers (unchanged)
───────────────────────────────────────── */
function normalizeScan(item) {
  return {
    ...item,
    wasteType:      item?.wasteType || item?.category || "Unknown",
    category:       item?.category  || "Unknown",
    confidence:     normalizePercent(item?.confidence),
    ecoScore:       Number(item?.ecoScore ?? 0),
    recyclable:     Boolean(item?.recyclable),
    disposalMethod: item?.disposalMethod || "Not available"
  };
}

function normalizePercent(value) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return "0%";
  return numeric <= 1 ? `${Math.round(numeric * 100)}%` : `${Math.round(numeric)}%`;
}

function progressText(part, total) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
function Dashboard() {
  const [stats, setStats]           = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  /* Data fetch (unchanged) */
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          getWasteStats(),
          getRecentScans()
        ]);
        setStats(statsRes.data);
        setRecentScans(Array.isArray(recentRes.data) ? recentRes.data.map(normalizeScan) : []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.response?.data?.message || "Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const totalUploads = stats?.totalUploads || 0;

  const recyclable    = stats?.recyclable    || 0;
  const nonRecyclable = stats?.nonRecyclable || Math.max(0, totalUploads - recyclable);
  const averageEcoScore = Number(stats?.averageEcoScore || 0);
  const activeDays = new Set(
    recentScans
      .map(scan => scan?.createdAt ? new Date(scan.createdAt).toDateString() : null)
      .filter(Boolean)
  ).size;

  const ecoRank = totalUploads >= 25 || averageEcoScore >= 90 ? "Eco Champion"
    : totalUploads >= 15 || averageEcoScore >= 75 ? "Eco Explorer"
    : totalUploads >= 5  || averageEcoScore >= 60 ? "Green Starter"
    : "Fresh Recycler";

  const nextRank = ecoRank === "Eco Champion"
    ? "Top tier reached"
    : ecoRank === "Eco Explorer"
      ? "Eco Champion"
      : ecoRank === "Green Starter"
        ? "Eco Explorer"
        : "Green Starter";

  const rankProgress = Math.max(
    Math.min(
      ((Math.min(totalUploads, 25) / 25) * 60) + ((Math.min(averageEcoScore, 100) / 100) * 40),
      100
    ),
    0
  );

  const rewards = [
    {
      icon: <FiAward size={18} />,
      title: "Upload Hero",
      subtitle: "Scans completed so far",
      value: `${totalUploads}`,
      progress: Math.min((totalUploads / 20) * 100, 100),
      tone: "var(--accent)"
    },
    {
      icon: <FiStar size={18} />,
      title: "Score Booster",
      subtitle: "Average eco score milestone",
      value: `${averageEcoScore}/100`,
      progress: Math.min(averageEcoScore, 100),
      tone: "#8B5CF6"
    },
    {
      icon: <FiGift size={18} />,
      title: "Recycling Helper",
      subtitle: "Recyclable items identified",
      value: `${recyclable}`,
      progress: totalUploads > 0 ? (recyclable / totalUploads) * 100 : 0,
      tone: "var(--success)"
    },
    {
      icon: <FiHeart size={18} />,
      title: "Planet Saver",
      subtitle: "Non-recyclable items handled",
      value: `${nonRecyclable}`,
      progress: totalUploads > 0 ? (nonRecyclable / totalUploads) * 100 : 0,
      tone: "#EF4444"
    }
  ];

  const proudMoments = [
    {
      icon: <FiCheckCircle size={16} />,
      title: "Current rank",
      value: ecoRank,
      note: `Next milestone: ${nextRank}`
    },
    {
      icon: <FiTrendingUp size={16} />,
      title: "7-day activity",
      value: `${activeDays} day${activeDays === 1 ? "" : "s"}`,
      note: "Your recent scanning streak is building momentum"
    },
    {
      icon: <FiRefreshCw size={16} />,
      title: "Recyclable detections",
      value: recyclable,
      note: "Helpful items you can sort responsibly"
    }
  ];

  const milestoneCards = [
    {
      icon: "🏅",
      title: "First scans",
      value: `${totalUploads}/10`,
      helper: "Unlocks after consistent use",
      progress: Math.min((totalUploads / 10) * 100, 100)
    },
    {
      icon: "🌿",
      title: "Sustainable average",
      value: `${averageEcoScore}/100`,
      helper: "Higher eco scores mean better sorting",
      progress: Math.min(averageEcoScore, 100)
    },
    {
      icon: "♻️",
      title: "Recycling wins",
      value: `${recyclable}`,
      helper: "Count of recyclable items identified",
      progress: totalUploads > 0 ? (recyclable / totalUploads) * 100 : 0
    }
  ];

  /* ── Loading state ── */
  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={shellStyle}>
          <div style={loadingCardStyle}>
            <div style={{ fontSize: "32px", marginBottom: 12 }}>📊</div>
            <div style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
              Loading dashboard data…
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={shellStyle}>

        {/* ── Hero ── */}
        <section style={heroStyle}>
          <div style={heroBadgeStyle}>
            <span>📊</span>
            <span>EcoSort AI Dashboard</span>
          </div>
          <h1 style={heroTitleStyle}>Waste insights at a glance.</h1>
          <p style={heroSubStyle}>
            Track uploads, category distribution, and average eco performance from the latest waste analyses.
          </p>
        </section>

        {/* ── Error ── */}
        {error && (
          <div style={errorBannerStyle}>
            <FiAlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* ── KPI Cards ── */}
        <section style={kpiGridStyle}>
          <StatCard
            icon={<FiPackage size={20} />}
            iconBg="#EFF6FF"
            iconColor="#3B82F6"
            label="Total Uploads"
            value={totalUploads}
            helper="All analyses stored in history"
          />
          <StatCard
            icon={<FiAward size={20} />}
            iconBg="var(--success-light)"
            iconColor="var(--success)"
            label="Average Eco Score"
            value={`${stats?.averageEcoScore || 0}/100`}
            helper="Higher means more sustainable"
          />
          <StatCard
            icon={<FiRefreshCw size={20} />}
            iconBg="var(--accent-light)"
            iconColor="var(--accent)"
            label="Plastic Count"
            value={stats?.plastic || 0}
            helper={`${progressText(stats?.plastic || 0, totalUploads)} of uploads`}
          />
          <StatCard
            icon={<FiTrendingUp size={20} />}
            iconBg="rgba(139,92,246,0.10)"
            iconColor="#8B5CF6"
            label="Organic Count"
            value={stats?.organic || 0}
            helper={`${progressText(stats?.organic || 0, totalUploads)} of uploads`}
          />
        </section>

        {/* ── Rewards row ── */}
        <section style={contentGridStyle}>
          <div style={panelStyle}>
            <PanelHeader title="Eco Rank" badge="Your proudest level so far" />

            <div style={rankHeroStyle}>
              <div style={rankHeroTopStyle}>
                <div style={rankIconStyle}><FiAward size={28} /></div>
                <div>
                  <div style={rankLabelStyle}>Current rank</div>
                  <div style={rankTitleStyle}>{ecoRank}</div>
                  <div style={rankSubStyle}>Next level: {nextRank}</div>
                </div>
              </div>

              <div style={rankMeterWrapStyle}>
                <div style={rankMeterRowStyle}>
                  <span style={rankMeterLabelStyle}>Rank progress</span>
                  <span style={rankMeterValueStyle}>{Math.round(rankProgress)}%</span>
                </div>
                <div style={trackStyle}>
                  <div style={{ ...fillStyle, width: `${rankProgress}%`, background: "linear-gradient(90deg, var(--accent), #8B5CF6)" }} />
                </div>
              </div>

              <div style={rankStatsGridStyle}>
                <div style={rankStatPillStyle}>
                  <span style={rankStatValueStyle}>{totalUploads}</span>
                  <span style={rankStatLabelStyle}>uploads</span>
                </div>
                <div style={rankStatPillStyle}>
                  <span style={rankStatValueStyle}>{averageEcoScore}/100</span>
                  <span style={rankStatLabelStyle}>eco score</span>
                </div>
                <div style={rankStatPillStyle}>
                  <span style={rankStatValueStyle}>{activeDays}</span>
                  <span style={rankStatLabelStyle}>active days</span>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gap: "14px", marginTop: "14px" }}>
              {rewards.map(reward => (
                <div key={reward.title} style={rewardCardStyle}>
                  <div style={{ ...rewardIconStyle, color: reward.tone, background: `${reward.tone}14` }}>
                    {reward.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={rewardTitleStyle}>{reward.title}</div>
                    <div style={rewardSubtitleStyle}>{reward.subtitle}</div>
                    <div style={rewardMetaRowStyle}>
                      <span style={rewardValueStyle}>{reward.value}</span>
                      <span style={rewardMetaStyle}>{Math.round(reward.progress)}% toward next badge</span>
                    </div>
                    <div style={trackStyle}>
                      <div style={{ ...fillStyle, width: `${Math.max(0, Math.min(100, reward.progress))}%`, background: reward.tone }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={panelStyle}>
            <PanelHeader title="Proud Moments" badge="What you have achieved" />

            <div style={{ display: "grid", gap: "12px" }}>
              {proudMoments.map(moment => (
                <div key={moment.title} style={momentRowStyle}>
                  <div style={momentIconStyle}>{moment.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={momentTitleStyle}>{moment.title}</div>
                    <div style={momentNoteStyle}>{moment.note}</div>
                  </div>
                  <div style={momentValueStyle}>{moment.value}</div>
                </div>
              ))}
            </div>

            <div style={momentSummaryStyle}>
              <div style={momentSummaryHeadingStyle}>Milestone board</div>
              <div style={momentSummaryValueStyle}>Every scan pushes your badge collection forward. Keep the momentum going to unlock the next tier.</div>
              <div style={momentSummaryBadgeStyle}>EcoSort AI keeps your progress visible</div>
            </div>

            <div style={{ display: "grid", gap: "10px", marginTop: "14px" }}>
              {milestoneCards.map(card => (
                <div key={card.title} style={milestoneCardStyle}>
                  <div style={milestoneTopRowStyle}>
                    <div style={milestoneEmojiStyle}>{card.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={momentTitleStyle}>{card.title}</div>
                      <div style={momentNoteStyle}>{card.helper}</div>
                    </div>
                    <div style={momentValueStyle}>{card.value}</div>
                  </div>
                  <div style={{ ...trackStyle, marginTop: "10px" }}>
                    <div style={{ ...fillStyle, width: `${Math.max(0, Math.min(100, card.progress))}%`, background: "linear-gradient(90deg, var(--success), #22C55E)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */

function StatCard({ icon, iconBg, iconColor, label, value, helper }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...kpiCardStyle,
        transform:  hovered ? "translateY(-3px)" : "none",
        boxShadow:  hovered ? "var(--shadow-lg)" : "var(--shadow-md)"
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ ...kpiIconStyle, background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div style={kpiLabelStyle}>{label}</div>
      <div style={kpiValueStyle}>{value}</div>
      <div style={kpiHelperStyle}>{helper}</div>
    </div>
  );
}

function PanelHeader({ title, badge }) {
  return (
    <div style={panelHeaderStyle}>
      <h2 style={panelTitleStyle}>{title}</h2>
      <span style={panelBadgeStyle}>{badge}</span>
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

/* Hero */
const heroStyle       = { marginBottom: "28px" };
const heroBadgeStyle  = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "5px 14px",
  borderRadius: "var(--radius-full)",
  background: "var(--success-light)",
  border: "1px solid var(--success-border)",
  color: "var(--success)",
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

/* Error */
const errorBannerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "20px",
  padding: "12px 14px",
  borderRadius: "var(--radius-md)",
  background: "var(--danger-light)",
  color: "#B91C1C",
  border: "1px solid var(--danger-border)",
  fontSize: "0.9rem",
  fontWeight: 600
};

/* KPI grid */
const kpiGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "16px",
  marginBottom: "24px"
};

const kpiCardStyle = {
  background: "var(--surface)",
  border: "1.5px solid var(--border)",
  borderRadius: "var(--radius-xl)",
  padding: "20px",
  transition: "transform 0.2s var(--ease-out), box-shadow 0.2s ease"
};

const kpiIconStyle = {
  width: "44px",
  height: "44px",
  borderRadius: "var(--radius-md)",
  display: "grid",
  placeItems: "center",
  marginBottom: "14px"
};

const kpiLabelStyle = {
  fontSize: "0.74rem",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color: "var(--text-secondary)",
  fontWeight: 700,
  marginBottom: "4px"
};

const kpiValueStyle = {
  fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
  fontWeight: 800,
  color: "var(--text-primary)",
  letterSpacing: "-0.04em",
  marginBottom: "4px"
};

const kpiHelperStyle = {
  fontSize: "0.8rem",
  color: "var(--text-secondary)"
};

/* Content grid */
const contentGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "20px",
  alignItems: "start",
  marginBottom: "20px"
};

/* Panel */
const panelStyle = {
  background: "var(--surface)",
  border: "1.5px solid var(--border)",
  borderRadius: "var(--radius-2xl)",
  boxShadow: "var(--shadow-md)",
  padding: "24px",
  backdropFilter: "blur(8px)"
};

const panelHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  marginBottom: "20px"
};

const panelTitleStyle = {
  fontSize: "1rem",
  fontWeight: 700,
  color: "var(--text-primary)"
};

const panelBadgeStyle = {
  padding: "4px 10px",
  borderRadius: "var(--radius-full)",
  background: "var(--accent-light)",
  color: "var(--accent)",
  fontSize: "0.74rem",
  fontWeight: 700
};

/* Progress bars */
const trackStyle = {
  height: "8px",
  borderRadius: "var(--radius-full)",
  background: "#E2E8F0",
  overflow: "hidden"
};

const fillStyle = {
  height: "100%",
  borderRadius: "inherit",
  transition: "width 0.5s var(--ease-out)"
};

const rewardCardStyle = {
  display: "flex",
  gap: "14px",
  padding: "14px",
  borderRadius: "var(--radius-xl)",
  border: "1px solid var(--border-subtle)",
  background: "#F8FAFC"
};

const rewardIconStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "var(--radius-md)",
  display: "grid",
  placeItems: "center",
  flexShrink: 0
};

const rewardTitleStyle = {
  fontSize: "0.94rem",
  fontWeight: 700,
  color: "var(--text-primary)"
};

const rewardSubtitleStyle = {
  marginTop: "2px",
  fontSize: "0.8rem",
  color: "var(--text-secondary)"
};

const rewardMetaRowStyle = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  gap: "12px",
  margin: "10px 0 8px"
};

const rewardValueStyle = {
  fontSize: "1.1rem",
  fontWeight: 800,
  color: "var(--text-primary)"
};

const rewardMetaStyle = {
  fontSize: "0.78rem",
  color: "var(--text-tertiary)",
  textAlign: "right"
};

const rankHeroStyle = {
  padding: "18px",
  borderRadius: "var(--radius-2xl)",
  background: "linear-gradient(135deg, rgba(14,165,233,0.12), rgba(16,185,129,0.14))",
  border: "1px solid var(--border-subtle)"
};

const rankHeroTopStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  marginBottom: "16px"
};

const rankIconStyle = {
  width: "56px",
  height: "56px",
  borderRadius: "var(--radius-xl)",
  display: "grid",
  placeItems: "center",
  background: "rgba(255,255,255,0.7)",
  color: "var(--accent)",
  flexShrink: 0,
  boxShadow: "0 10px 24px rgba(16,185,129,0.18)"
};

const rankLabelStyle = {
  fontSize: "0.75rem",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--text-secondary)",
  marginBottom: "3px"
};

const rankTitleStyle = {
  fontSize: "1.45rem",
  fontWeight: 800,
  color: "var(--text-primary)",
  letterSpacing: "-0.03em"
};

const rankSubStyle = {
  fontSize: "0.88rem",
  color: "var(--text-secondary)",
  marginTop: "2px"
};

const rankMeterWrapStyle = {
  marginBottom: "14px"
};

const rankMeterRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "8px"
};

const rankMeterLabelStyle = {
  fontSize: "0.82rem",
  fontWeight: 700,
  color: "var(--text-secondary)"
};

const rankMeterValueStyle = {
  fontSize: "0.82rem",
  fontWeight: 800,
  color: "var(--text-primary)"
};

const rankStatsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "10px"
};

const rankStatPillStyle = {
  padding: "12px 10px",
  borderRadius: "var(--radius-lg)",
  background: "rgba(255,255,255,0.72)",
  border: "1px solid rgba(255,255,255,0.5)",
  textAlign: "center"
};

const rankStatValueStyle = {
  display: "block",
  fontSize: "0.94rem",
  fontWeight: 800,
  color: "var(--text-primary)"
};

const rankStatLabelStyle = {
  display: "block",
  marginTop: "3px",
  fontSize: "0.73rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--text-secondary)"
};

const milestoneCardStyle = {
  padding: "12px 14px",
  borderRadius: "var(--radius-lg)",
  border: "1px solid var(--border-subtle)",
  background: "#F8FAFC"
};

const milestoneTopRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px"
};

const milestoneEmojiStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "var(--radius-md)",
  display: "grid",
  placeItems: "center",
  background: "#EEF2FF",
  flexShrink: 0,
  fontSize: "1rem"
};

const momentRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px 14px",
  borderRadius: "var(--radius-lg)",
  border: "1px solid var(--border-subtle)",
  background: "#F8FAFC"
};

const momentIconStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "var(--radius-md)",
  display: "grid",
  placeItems: "center",
  background: "#EEF2FF",
  color: "var(--accent)",
  flexShrink: 0
};

const momentTitleStyle = {
  fontSize: "0.88rem",
  fontWeight: 700,
  color: "var(--text-primary)"
};

const momentNoteStyle = {
  fontSize: "0.8rem",
  color: "var(--text-secondary)",
  marginTop: "2px"
};

const momentValueStyle = {
  fontSize: "1.05rem",
  fontWeight: 800,
  color: "var(--text-primary)",
  whiteSpace: "nowrap"
};

const momentSummaryStyle = {
  marginTop: "14px",
  padding: "16px",
  borderRadius: "var(--radius-xl)",
  background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(14,165,233,0.12))",
  border: "1px solid var(--border-subtle)"
};

const momentSummaryHeadingStyle = {
  fontSize: "0.75rem",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--text-secondary)",
  marginBottom: "6px"
};

const momentSummaryValueStyle = {
  fontSize: "0.96rem",
  fontWeight: 700,
  color: "var(--text-primary)",
  lineHeight: 1.6
};

const momentSummaryBadgeStyle = {
  display: "inline-flex",
  marginTop: "10px",
  padding: "4px 10px",
  borderRadius: "var(--radius-full)",
  background: "rgba(255,255,255,0.7)",
  color: "var(--success)",
  fontSize: "0.76rem",
  fontWeight: 700
};

const loadingCardStyle = {
  minHeight: "300px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "var(--radius-2xl)",
  background: "var(--surface)",
  border: "1.5px solid var(--border)",
  boxShadow: "var(--shadow-md)"
};

export default Dashboard;
