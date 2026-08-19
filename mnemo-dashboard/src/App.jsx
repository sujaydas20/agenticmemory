import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Zap,
  Database,
  GitMerge,
  Search,
  Activity,
  Clock,
  ChevronRight,
  Circle,
} from "lucide-react";

const COLORS = {
  bg: "#0A0C12",
  panel: "#12151E",
  panelAlt: "#161A25",
  border: "#232838",
  borderSoft: "#1B1F2C",
  text: "#E7E9EE",
  textMuted: "#828A9E",
  textFaint: "#565D70",
  stm: "#F5A623",
  stmSoft: "#3A2E14",
  stmDim: "#8A6A2C",
  ltm: "#2DD4BF",
  ltmSoft: "#123330",
  ltmDim: "#1E7A6E",
};

const retentionData = [
  { t: "0h", stm: 1.0, ltm: 0.97 },
  { t: "2h", stm: 0.81, ltm: 0.97 },
  { t: "4h", stm: 0.63, ltm: 0.96 },
  { t: "6h", stm: 0.47, ltm: 0.96 },
  { t: "8h", stm: 0.34, ltm: 0.96 },
  { t: "10h", stm: 0.23, ltm: 0.95 },
  { t: "12h", stm: 0.15, ltm: 0.95 },
  { t: "16h", stm: 0.08, ltm: 0.95 },
  { t: "20h", stm: 0.04, ltm: 0.94 },
  { t: "24h", stm: 0.02, ltm: 0.94 },
];

const stmBuffer = [
  { text: "user asked to compare pgvector vs pinecone", ttl: 42, score: 0.31 },
  { text: "clarified repo uses python 3.11 + poetry", ttl: 118, score: 0.44 },
  { text: "current file: ingestion/chunker.py open", ttl: 205, score: 0.22 },
  { text: "user prefers concise diffs, no commentary", ttl: 340, score: 0.68 },
  { text: "last test run: 3 failing in test_embed.py", ttl: 512, score: 0.51 },
];

const ltmIndex = [
  { text: "project uses hybrid retrieval: BM25 + dense", tag: "architecture", score: 0.91, seen: 14 },
  { text: "user's team ships on Fridays, avoid risky merges then", tag: "preference", score: 0.86, seen: 9 },
  { text: "auth service migrated to OAuth2 in March", tag: "fact", score: 0.79, seen: 6 },
  { text: "user is allergic to unnecessary abstraction layers", tag: "preference", score: 0.94, seen: 21 },
];

const activityLog = [
  { time: "14:33:21", event: "trace promoted to long-term store", kind: "consolidate" },
  { time: "14:32:44", event: "new trace written to ring buffer", kind: "write" },
  { time: "14:31:09", event: "importance score recomputed (batch)", kind: "score" },
  { time: "14:29:55", event: "12 stale traces evicted from STM", kind: "evict" },
  { time: "14:28:02", event: "semantic query matched 4 LTM entries", kind: "retrieve" },
];

const kindColor = {
  consolidate: COLORS.ltm,
  write: COLORS.stm,
  score: "#8B7CF6",
  evict: COLORS.textFaint,
  retrieve: COLORS.ltm,
};

function formatTTL(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MnemoDashboard() {
  const [buffer, setBuffer] = useState(stmBuffer);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setBuffer((prev) =>
        prev.map((item) => ({ ...item, ttl: Math.max(0, item.ttl - 1) }))
      );
      setPulse((p) => (p + 1) % 3);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: "'Inter', sans-serif",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .mnemo-mono { font-family: 'IBM Plex Mono', monospace; }
        .mnemo-display { font-family: 'Space Grotesk', sans-serif; }

        .flow-dot {
          animation: flowMove 2.4s linear infinite;
        }
        .flow-dot.d2 { animation-delay: 0.8s; }
        .flow-dot.d3 { animation-delay: 1.6s; }
        @keyframes flowMove {
          0% { offset-distance: 0%; opacity: 0; }
          8% { opacity: 1; }
          92% { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .flow-dot { animation: none; opacity: 0; }
        }
        .mnemo-row:hover { background: ${COLORS.panelAlt}; }
        .mnemo-scrollbar::-webkit-scrollbar { width: 6px; }
        .mnemo-scrollbar::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div
        className="flex items-center justify-between px-8 py-5"
        style={{ borderBottom: `1px solid ${COLORS.borderSoft}` }}
      >
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center rounded"
              style={{
                width: 28,
                height: 28,
                background: `linear-gradient(135deg, ${COLORS.stm}, ${COLORS.ltm})`,
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS.bg }} />
            </div>
            <span className="mnemo-display" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>
              mnemo
            </span>
            <span
              className="mnemo-mono"
              style={{ fontSize: 10, color: COLORS.textFaint, border: `1px solid ${COLORS.border}`, padding: "1px 6px", borderRadius: 4 }}
            >
              v0.4.2
            </span>
          </div>
          <div className="flex items-center gap-6" style={{ fontSize: 13.5, color: COLORS.textMuted }}>
            <span style={{ color: COLORS.text, fontWeight: 500 }}>Overview</span>
            <span>Traces</span>
            <span>Consolidation</span>
            <span>Retrieval</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5" style={{ fontSize: 12.5, color: COLORS.textMuted }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#4ADE80",
                display: "inline-block",
                boxShadow: "0 0 0 3px rgba(74,222,128,0.15)",
              }}
            />
            runtime live
          </div>
          <div
            className="mnemo-mono flex items-center gap-1.5"
            style={{ fontSize: 12, color: COLORS.textFaint, border: `1px solid ${COLORS.border}`, padding: "5px 10px", borderRadius: 6 }}
          >
            <Search size={12} /> search traces
          </div>
        </div>
      </div>

      <div className="px-8 py-7" style={{ maxWidth: 1360, margin: "0 auto" }}>
        {/* Title */}
        <div className="mb-7">
          <h1 className="mnemo-display" style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em" }}>
            Memory runtime
          </h1>
          <p style={{ fontSize: 13.5, color: COLORS.textMuted, marginTop: 3 }}>
            What the agent remembers right now, and what it's kept for good.
          </p>
        </div>

        {/* STM / LTM hero comparison */}
        <div className="grid grid-cols-2 gap-5 mb-6">
          {/* STM card */}
          <div
            className="rounded-xl p-6"
            style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderTop: `2px solid ${COLORS.stm}` }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Zap size={15} style={{ color: COLORS.stm }} />
                <span className="mnemo-display" style={{ fontSize: 14, fontWeight: 600 }}>Short-term</span>
              </div>
              <span className="mnemo-mono" style={{ fontSize: 10.5, color: COLORS.stmDim, background: COLORS.stmSoft, padding: "2px 7px", borderRadius: 4 }}>
                RING BUFFER
              </span>
            </div>
            <div className="flex items-end gap-3 mb-1">
              <span className="mnemo-mono" style={{ fontSize: 34, fontWeight: 500, color: COLORS.stm, lineHeight: 1 }}>
                {buffer.length}
              </span>
              <span style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 4 }}>active traces</span>
            </div>
            <p style={{ fontSize: 12.5, color: COLORS.textFaint, marginBottom: 5 }}>
              capacity 32 · avg TTL 6m 40s · decays without reinforcement
            </p>
            <div style={{ height: 5, background: COLORS.borderSoft, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: "16%", height: "100%", background: COLORS.stm, borderRadius: 3 }} />
            </div>
          </div>

          {/* LTM card */}
          <div
            className="rounded-xl p-6"
            style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderTop: `2px solid ${COLORS.ltm}` }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Database size={15} style={{ color: COLORS.ltm }} />
                <span className="mnemo-display" style={{ fontSize: 14, fontWeight: 600 }}>Long-term</span>
              </div>
              <span className="mnemo-mono" style={{ fontSize: 10.5, color: COLORS.ltmDim, background: COLORS.ltmSoft, padding: "2px 7px", borderRadius: 4 }}>
                VECTOR STORE
              </span>
            </div>
            <div className="flex items-end gap-3 mb-1">
              <span className="mnemo-mono" style={{ fontSize: 34, fontWeight: 500, color: COLORS.ltm, lineHeight: 1 }}>
                925
              </span>
              <span style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 4 }}>consolidated</span>
            </div>
            <p style={{ fontSize: 12.5, color: COLORS.textFaint, marginBottom: 5 }}>
              94.1% retention at 24h · 96.2% retrieval hit rate
            </p>
            <div style={{ height: 5, background: COLORS.borderSoft, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: "74%", height: "100%", background: COLORS.ltm, borderRadius: 3 }} />
            </div>
          </div>
        </div>

        {/* Signature: consolidation pipeline */}
        <div
          className="rounded-xl p-6 mb-6"
          style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}` }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <GitMerge size={14} style={{ color: COLORS.textMuted }} />
              <span className="mnemo-display" style={{ fontSize: 14, fontWeight: 600 }}>Consolidation pipeline</span>
            </div>
            <span className="mnemo-mono" style={{ fontSize: 11.5, color: COLORS.textFaint }}>
              gate: importance ≥ 0.7 OR access_count ≥ 3
            </span>
          </div>

          <svg viewBox="0 0 900 140" style={{ width: "100%", height: "auto", overflow: "visible" }}>
            <defs>
              <path id="path1" d="M 150 70 L 400 70" />
              <path id="path2" d="M 500 70 L 750 70" />
            </defs>

            {/* stage 1: STM buffer */}
            <circle cx="90" cy="70" r="42" fill="none" stroke={COLORS.stm} strokeWidth="1.5" opacity="0.5" />
            <circle cx="90" cy="70" r="42" fill="none" stroke={COLORS.stm} strokeWidth="1.5" strokeDasharray="4 6" opacity="0.9">
              <animateTransform attributeName="transform" type="rotate" from="0 90 70" to="360 90 70" dur="14s" repeatCount="indefinite" />
            </circle>
            <text x="90" y="66" textAnchor="middle" fill={COLORS.text} fontSize="18" fontFamily="'IBM Plex Mono', monospace" fontWeight="500">32</text>
            <text x="90" y="82" textAnchor="middle" fill={COLORS.textFaint} fontSize="9">buffer</text>
            <text x="90" y="128" textAnchor="middle" fill={COLORS.stmDim} fontSize="10.5" fontFamily="'Space Grotesk', sans-serif" fontWeight="600">SHORT-TERM</text>

            {/* connecting line 1 */}
            <line x1="150" y1="70" x2="400" y2="70" stroke={COLORS.border} strokeWidth="1.5" />
            <circle r="3.5" fill={COLORS.stm} className="flow-dot" style={{ offsetPath: "path('M 150 70 L 400 70')" }} />
            <circle r="3.5" fill={COLORS.stm} className="flow-dot d2" style={{ offsetPath: "path('M 150 70 L 400 70')" }} />

            {/* stage 2: gate */}
            <rect x="400" y="40" width="100" height="60" rx="10" fill={COLORS.panelAlt} stroke={COLORS.border} strokeWidth="1.5" />
            <text x="450" y="66" textAnchor="middle" fill={COLORS.text} fontSize="11" fontFamily="'Space Grotesk', sans-serif" fontWeight="600">gate</text>
            <text x="450" y="80" textAnchor="middle" fill={COLORS.textFaint} fontSize="9">score ≥ threshold</text>

            {/* connecting line 2 */}
            <line x1="500" y1="70" x2="750" y2="70" stroke={COLORS.border} strokeWidth="1.5" />
            <circle r="3.5" fill={COLORS.ltm} className="flow-dot d3" style={{ offsetPath: "path('M 500 70 L 750 70')" }} />

            {/* stage 3: LTM store */}
            <rect x="750" y="30" width="90" height="80" rx="4" fill="none" stroke={COLORS.ltm} strokeWidth="1.5" opacity="0.9" />
            <line x1="750" y1="48" x2="840" y2="48" stroke={COLORS.ltm} strokeWidth="1" opacity="0.4" />
            <line x1="750" y1="66" x2="840" y2="66" stroke={COLORS.ltm} strokeWidth="1" opacity="0.4" />
            <line x1="750" y1="84" x2="840" y2="84" stroke={COLORS.ltm} strokeWidth="1" opacity="0.4" />
            <text x="795" y="128" textAnchor="middle" fill={COLORS.ltmDim} fontSize="10.5" fontFamily="'Space Grotesk', sans-serif" fontWeight="600">LONG-TERM</text>
          </svg>

          <div className="flex items-center justify-between mt-3" style={{ fontSize: 11.5, color: COLORS.textFaint }}>
            <span>unreinforced traces expire from the buffer after TTL</span>
            <span>18 promoted today · 7 evicted</span>
          </div>
        </div>

        {/* Retention chart */}
        <div
          className="rounded-xl p-6 mb-6"
          style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}` }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="mnemo-display" style={{ fontSize: 14, fontWeight: 600 }}>Retention over 24h</span>
            <div className="flex items-center gap-4" style={{ fontSize: 11.5 }}>
              <span className="flex items-center gap-1.5" style={{ color: COLORS.textMuted }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.stm, display: "inline-block" }} /> short-term
              </span>
              <span className="flex items-center gap-1.5" style={{ color: COLORS.textMuted }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.ltm, display: "inline-block" }} /> long-term
              </span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: COLORS.textFaint, marginBottom: 10 }}>
            probability a trace is still recallable, by hours since it was written
          </p>
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <AreaChart data={retentionData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="stmFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.stm} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={COLORS.stm} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ltmFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.ltm} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={COLORS.ltm} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={COLORS.borderSoft} vertical={false} />
                <XAxis dataKey="t" tick={{ fill: COLORS.textFaint, fontSize: 11 }} axisLine={{ stroke: COLORS.border }} tickLine={false} />
                <YAxis tick={{ fill: COLORS.textFaint, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                <Tooltip
                  contentStyle={{ background: COLORS.panelAlt, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: COLORS.textMuted }}
                  formatter={(v) => `${Math.round(v * 100)}%`}
                />
                <Area type="monotone" dataKey="ltm" stroke={COLORS.ltm} fill="url(#ltmFill)" strokeWidth={2} />
                <Area type="monotone" dataKey="stm" stroke={COLORS.stm} fill="url(#stmFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Two-column streams */}
        <div className="grid grid-cols-2 gap-5 mb-6">
          {/* STM buffer list */}
          <div className="rounded-xl overflow-hidden" style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}` }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${COLORS.borderSoft}` }}>
              <span className="mnemo-display" style={{ fontSize: 13.5, fontWeight: 600 }}>Live buffer</span>
              <span className="mnemo-mono" style={{ fontSize: 10.5, color: COLORS.stmDim }}>counting down</span>
            </div>
            <div className="mnemo-scrollbar" style={{ maxHeight: 260, overflowY: "auto" }}>
              {buffer.map((item, i) => (
                <div key={i} className="mnemo-row flex items-center justify-between px-5 py-3" style={{ borderBottom: i < buffer.length - 1 ? `1px solid ${COLORS.borderSoft}` : "none" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12.5, color: COLORS.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.text}</p>
                    <p className="mnemo-mono" style={{ fontSize: 10.5, color: COLORS.textFaint, marginTop: 2 }}>score {item.score.toFixed(2)}</p>
                  </div>
                  <span className="mnemo-mono flex items-center gap-1" style={{ fontSize: 11.5, color: item.ttl < 60 ? "#F87171" : COLORS.stmDim, marginLeft: 10 }}>
                    <Clock size={10} /> {formatTTL(item.ttl)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* LTM index list */}
          <div className="rounded-xl overflow-hidden" style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}` }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${COLORS.borderSoft}` }}>
              <span className="mnemo-display" style={{ fontSize: 13.5, fontWeight: 600 }}>Indexed memory</span>
              <span className="mnemo-mono" style={{ fontSize: 10.5, color: COLORS.ltmDim }}>925 entries</span>
            </div>
            <div className="mnemo-scrollbar" style={{ maxHeight: 260, overflowY: "auto" }}>
              {ltmIndex.map((item, i) => (
                <div key={i} className="mnemo-row flex items-center justify-between px-5 py-3" style={{ borderBottom: i < ltmIndex.length - 1 ? `1px solid ${COLORS.borderSoft}` : "none" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12.5, color: COLORS.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="mnemo-mono" style={{ fontSize: 10, color: COLORS.ltmDim, background: COLORS.ltmSoft, padding: "1px 6px", borderRadius: 4 }}>{item.tag}</span>
                      <span className="mnemo-mono" style={{ fontSize: 10.5, color: COLORS.textFaint }}>seen {item.seen}×</span>
                    </div>
                  </div>
                  <span className="mnemo-mono" style={{ fontSize: 11.5, color: COLORS.textMuted, marginLeft: 10 }}>{item.score.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity log */}
        <div className="rounded-xl overflow-hidden" style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}` }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${COLORS.borderSoft}` }}>
            <div className="flex items-center gap-2">
              <Activity size={13} style={{ color: COLORS.textMuted }} />
              <span className="mnemo-display" style={{ fontSize: 13.5, fontWeight: 600 }}>System activity</span>
            </div>
            <span className="flex items-center gap-1" style={{ fontSize: 11.5, color: COLORS.textFaint }}>
              view all <ChevronRight size={12} />
            </span>
          </div>
          {activityLog.map((row, i) => (
            <div key={i} className="mnemo-row flex items-center gap-4 px-5 py-3" style={{ borderBottom: i < activityLog.length - 1 ? `1px solid ${COLORS.borderSoft}` : "none" }}>
              <span className="mnemo-mono" style={{ fontSize: 11.5, color: COLORS.textFaint, width: 70 }}>{row.time}</span>
              <Circle size={6} fill={kindColor[row.kind]} color={kindColor[row.kind]} />
              <span style={{ fontSize: 12.5, color: COLORS.text, flex: 1 }}>{row.event}</span>
              <span className="mnemo-mono" style={{ fontSize: 10.5, color: kindColor[row.kind], textTransform: "uppercase" }}>{row.kind}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
