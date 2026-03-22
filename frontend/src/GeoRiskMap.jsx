// GeoRiskMap.jsx
// Geo-Political Risk Map — driven by investor data from Flask/MongoDB backend.
// Default country risk scores pre-loaded so map always shows meaningful data.
// INSTALL: npm install react-simple-maps d3-scale
// OFFLINE:  curl -o public/world-110m.json https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json
//           then change GEO_URL to "/world-110m.json"

import { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";

const GEO_URL = "/world-110m.json";

// ── Country name → ISO numeric (world-atlas geo.id) ───────────────────────────
const COUNTRY_TO_NUMERIC = {
  "Afghanistan":"4","Albania":"8","Algeria":"12","Angola":"24","Argentina":"32",
  "Armenia":"51","Australia":"36","Austria":"40","Azerbaijan":"31","Bahrain":"48",
  "Bangladesh":"50","Belarus":"112","Belgium":"56","Bolivia":"68","Bosnia":"70",
  "Botswana":"72","Brazil":"76","Bulgaria":"100","Cambodia":"116","Cameroon":"120",
  "Canada":"124","Chad":"148","Chile":"152","China":"156","Colombia":"170",
  "Congo":"178","Croatia":"191","Cuba":"192","Czech Republic":"203","Denmark":"208",
  "Ecuador":"218","Egypt":"818","Ethiopia":"231","Finland":"246","France":"250",
  "Germany":"276","Ghana":"288","Greece":"300","Guatemala":"320","Honduras":"340",
  "Hungary":"348","India":"356","Indonesia":"360","Iran":"364","Iraq":"368",
  "Ireland":"372","Israel":"376","Italy":"380","Jamaica":"388","Japan":"392",
  "Jordan":"400","Kazakhstan":"398","Kenya":"404","Kuwait":"414","Kyrgyzstan":"417",
  "Laos":"418","Latvia":"428","Lebanon":"422","Libya":"434","Lithuania":"440",
  "Luxembourg":"442","Malaysia":"458","Mexico":"484","Moldova":"498","Mongolia":"496",
  "Morocco":"504","Mozambique":"508","Myanmar":"104","Namibia":"516","Nepal":"524",
  "Netherlands":"528","New Zealand":"554","Nicaragua":"558","Nigeria":"566",
  "Norway":"578","Oman":"512","Pakistan":"586","Panama":"591","Paraguay":"600",
  "Peru":"604","Philippines":"608","Poland":"616","Portugal":"620","Qatar":"634",
  "Romania":"642","Russia":"643","Saudi Arabia":"682","Senegal":"686","Serbia":"688",
  "Sierra Leone":"694","Somalia":"706","South Africa":"710","South Korea":"410",
  "South Sudan":"728","Spain":"724","Sri Lanka":"144","Sudan":"729","Sweden":"752",
  "Switzerland":"756","Syria":"760","Taiwan":"158","Tajikistan":"762","Tanzania":"834",
  "Thailand":"764","Tunisia":"788","Turkey":"792","Turkmenistan":"795","Uganda":"800",
  "Ukraine":"804","United Arab Emirates":"784","UAE":"784","United Kingdom":"826",
  "UK":"826","United States":"840","USA":"840","US":"840","Uruguay":"858",
  "Uzbekistan":"860","Venezuela":"862","Vietnam":"704","Yemen":"887","Zambia":"894",
  "Zimbabwe":"716","North Korea":"408","Kosovo":"383","Palestine":"275",
  "DR Congo":"180","Democratic Republic of Congo":"180","Ivory Coast":"384",
  "Cote d'Ivoire":"384","North Macedonia":"807","Trinidad and Tobago":"780",
  "El Salvador":"222","Guatemala":"320","Haiti":"332","Cuba":"192",
  "Dominican Republic":"214","Costa Rica":"188","Panama":"591",
};

// ── Default geo-political risk scores (baseline — real-world approximations) ─
// Scale 0–100. Source: approximated from World Bank, Fragile States Index.
// These show when no investor from that country exists yet.
const DEFAULT_COUNTRY_RISK = {
  // Very Low Risk (0–20) — stable, developed nations
  "4":"8",    // Australia → numeric lookup won't match, kept for reference
  "36":"8",   "40":"10",  "56":"10",  "124":"9",  "208":"8",
  "246":"8",  "250":"18", "276":"12", "372":"12", "376":"45",
  "380":"20", "392":"15", "442":"9",  "528":"10", "554":"10",
  "578":"8",  "616":"25", "620":"22", "756":"8",  "752":"9",
  "826":"14", "840":"18", "36":"8",   "724":"20", "203":"18",
  "348":"28", "428":"25", "440":"22", "191":"20",

  // Low-Medium Risk (20–40) — emerging stable
  "32":"35",  "76":"42",  "152":"30", "170":"55", "356":"38",
  "360":"40", "410":"22", "458":"32", "484":"52", "604":"48",
  "608":"45", "642":"35", "688":"38", "764":"35", "858":"28",
  "792":"48", "818":"58", "504":"42", "634":"30", "682":"35",
  "784":"28", "400":"42", "414":"32", "512":"38",

  // Medium Risk (40–60) — developing, some instability
  "50":"55",  "116":"52", "120":"58", "288":"45", "404":"52",
  "418":"48", "496":"42", "524":"55", "566":"62", "586":"68",
  "710":"48", "834":"52", "704":"45", "800":"58", "694":"72",

  // High Risk (60–80) — significant instability
  "4":"75",   "24":"68",  "104":"72", "148":"78", "180":"82",
  "231":"65", "364":"72", "368":"75", "422":"78", "434":"75",
  "706":"85", "728":"88", "729":"78", "760":"90", "887":"88",
  "862":"70", "384":"58", "132":"52",

  // Critical Risk (80–100) — conflict zones / failed states
  "408":"88", "275":"82",
};

// ── Color scale ───────────────────────────────────────────────────────────────
const riskColorScale = scaleLinear()
  .domain([0, 35, 70, 100])
  .range(["#00e676", "#ffeb3b", "#ff6d00", "#b71c1c"]);

// ── Build per-country aggregated data from investors ─────────────────────────
function buildCountryMap(investors) {
  const map = {};
  investors.forEach((inv) => {
    const raw = (inv.country || "").trim();
    const num = COUNTRY_TO_NUMERIC[raw];
    if (!num) return;
    if (!map[num]) {
      map[num] = { risk: 0, trust: 0, count: 0, names: [], amounts: 0, projects: [], countryName: raw, isReal: true };
    }
    map[num].risk    += Number(inv.risk_score)  || 0;
    map[num].trust   += Number(inv.trust_score) || 0;
    map[num].amounts += Number(inv.amount)      || 0;
    map[num].count   += 1;
    map[num].names.push(inv.name);
    if (inv.project_name) map[num].projects.push(inv.project_name);
  });
  Object.values(map).forEach((c) => {
    c.avgRisk  = +(c.risk  / c.count).toFixed(1);
    c.avgTrust = +(c.trust / c.count).toFixed(1);
  });
  return map;
}

function riskLabel(score) {
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}
function riskAccent(score) {
  if (score >= 70) return "#ff4d4d";
  if (score >= 40) return "#ffb74d";
  return "#00e676";
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
function Tooltip({ data, x, y }) {
  if (!data) return null;
  const accent = riskAccent(data.avgRisk);
  const lvl    = riskLabel(data.avgRisk);

  return (
    <div style={{
      position: "fixed", left: x + 14, top: y - 10,
      background: "rgba(6,18,32,0.97)",
      border: `1px solid ${accent}`,
      borderRadius: "10px", padding: "13px 16px",
      pointerEvents: "none", zIndex: 9999,
      minWidth: "220px",
      boxShadow: `0 0 24px ${accent}44`,
      fontFamily: "'Courier New', monospace",
    }}>
      <div style={{ fontSize: "15px", fontWeight: "bold", color: "#e0f7fa", marginBottom: "10px" }}>
        🌐 {data.countryName}
        {!data.isReal && (
          <span style={{ fontSize: "10px", color: "#546e7a", marginLeft: "8px" }}>(baseline)</span>
        )}
      </div>

      <TRow label="Avg Risk Score"  value={data.avgRisk}  accent={accent}  badge={lvl} />
      {data.isReal && <>
        <TRow label="Avg Trust Score" value={data.avgTrust} accent="#00e5ff" />
        <TRow label="Investors"       value={data.count}    accent="#b2ebf2" />
        {data.amounts > 0 &&
          <TRow label="Total Investment" value={`$${data.amounts.toLocaleString()}`} accent="#80cbc4" />
        }
        {data.names.length > 0 && (
          <div style={{ fontSize: "11px", color: "#607d8b", marginTop: "8px", lineHeight: "1.5" }}>
            <span style={{ color: "#455a64" }}>Investors: </span>
            {data.names.slice(0, 3).join(", ")}
            {data.names.length > 3 ? ` +${data.names.length - 3} more` : ""}
          </div>
        )}
        {data.projects.length > 0 && (
          <div style={{ fontSize: "11px", color: "#607d8b", marginTop: "4px" }}>
            <span style={{ color: "#455a64" }}>Projects: </span>
            {data.projects.slice(0, 2).join(", ")}
          </div>
        )}
      </>}
      {!data.isReal && (
        <div style={{ fontSize: "11px", color: "#546e7a", marginTop: "6px" }}>
          No investors registered yet.<br/>Showing baseline geopolitical risk.
        </div>
      )}
    </div>
  );
}

function TRow({ label, value, accent, badge }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" }}>
      <span style={{ color: "#78909c" }}>{label}</span>
      <span style={{ color: accent, fontWeight: "bold" }}>
        {value}
        {badge && (
          <span style={{
            marginLeft: "7px", padding: "1px 6px", borderRadius: "4px",
            fontSize: "10px", background: accent + "28",
            border: `1px solid ${accent}66`, color: accent,
          }}>{badge}</span>
        )}
      </span>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "22px", fontWeight: "bold", color, fontFamily: "'Courier New', monospace" }}>{value}</div>
      <div style={{ fontSize: "10px", color: "#546e7a", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
    </div>
  );
}

function Legend() {
  const stops = [
    { color: "#00e676", label: "Low  (0–35)"      },
    { color: "#ffeb3b", label: "Medium  (35–70)"  },
    { color: "#ff6d00", label: "High  (70–85)"    },
    { color: "#b71c1c", label: "Critical  (85–100)"},
    { color: "#1e3a5f", label: "No Data"          },
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", marginTop: "12px" }}>
      {stops.map((s) => (
        <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: 13, height: 13, borderRadius: "3px", background: s.color, border: "1px solid rgba(255,255,255,0.15)" }} />
          <span style={{ fontSize: "11px", color: "#78909c", fontFamily: "'Courier New', monospace" }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function GeoRiskMap({ investors = [] }) {
  const [tooltip, setTooltip] = useState(null);
  const [zoom, setZoom]       = useState(1);
  const [showBaseline, setShowBaseline] = useState(true);

  // Build real investor map
  const investorMap = useMemo(() => buildCountryMap(investors), [investors]);

  // Merge with defaults: real data overrides baseline
  const countryMap = useMemo(() => {
    if (!showBaseline) return investorMap;
    const merged = {};
    // Add baseline entries
    Object.entries(DEFAULT_COUNTRY_RISK).forEach(([num, risk]) => {
      merged[num] = {
        avgRisk: Number(risk), avgTrust: 0, count: 0,
        names: [], projects: [], amounts: 0,
        countryName: Object.entries(COUNTRY_TO_NUMERIC).find(([,v]) => v === num)?.[0] || "",
        isReal: false,
      };
    });
    // Override with real investor data
    Object.entries(investorMap).forEach(([num, data]) => {
      merged[num] = { ...data };
    });
    return merged;
  }, [investorMap, showBaseline]);

  const regionCount    = Object.keys(investorMap).length;
  const avgRiskGlobal  = regionCount > 0
    ? (Object.values(investorMap).reduce((s, c) => s + c.avgRisk, 0) / regionCount).toFixed(1)
    : "—";
  const totalInvestment = investors.reduce((s, inv) => s + (Number(inv.amount) || 0), 0);

  return (
    <div style={{
      background: "rgba(255,255,255,0.05)", borderRadius: "18px", padding: "22px",
      backdropFilter: "blur(12px)", border: "1px solid rgba(0,229,255,0.15)",
      boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
    }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "15px", fontFamily: "'Courier New', monospace", color: "#00e5ff", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            ◈ Geo-Political Risk Intelligence Map
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#546e7a" }}>
            Countries coloured by investor risk · hover for full application metrics
          </p>
        </div>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <Stat label="Active Regions"    value={regionCount}  color="#00e5ff" />
          <Stat label="Avg Global Risk"   value={avgRiskGlobal}
            color={avgRiskGlobal === "—" ? "#546e7a" : riskAccent(Number(avgRiskGlobal))} />
          <Stat label="Total Investors"   value={investors.length} color="#80cbc4" />
          {totalInvestment > 0 &&
            <Stat label="Total Investment" value={`$${(totalInvestment/1000).toFixed(0)}K`} color="#ffd700" />
          }
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "10px", alignItems: "center", flexWrap: "wrap" }}>
        {[["−", () => setZoom(z => Math.max(1, +(z-0.5).toFixed(1)))],
          ["Reset", () => setZoom(1)],
          ["+", () => setZoom(z => Math.min(8, +(z+0.5).toFixed(1)))]
        ].map(([label, fn]) => (
          <button key={label} onClick={fn} style={{
            padding: "4px 13px", borderRadius: "6px",
            border: "1px solid rgba(0,229,255,0.3)",
            background: "rgba(0,229,255,0.07)", color: "#00e5ff",
            cursor: "pointer", fontSize: "13px",
            fontFamily: "'Courier New', monospace",
          }}>{label}</button>
        ))}

        {/* Toggle baseline */}
        <button onClick={() => setShowBaseline(b => !b)} style={{
          padding: "4px 13px", borderRadius: "6px",
          border: `1px solid ${showBaseline ? "#ffd700" : "rgba(255,255,255,0.15)"}`,
          background: showBaseline ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.05)",
          color: showBaseline ? "#ffd700" : "#546e7a",
          cursor: "pointer", fontSize: "12px",
          fontFamily: "'Courier New', monospace",
        }}>
          {showBaseline ? "⬛ Hide Baseline" : "🌍 Show Baseline"}
        </button>

        <span style={{ fontSize: "11px", color: "#455a64", marginLeft: "4px" }}>
          Scroll to zoom · Drag to pan
        </span>
      </div>

      {/* Map */}
      <div style={{
        borderRadius: "12px", overflow: "hidden",
        border: "1px solid rgba(0,229,255,0.1)",
        background: "rgba(5,14,26,0.75)",
      }}>
        <ComposableMap
          projectionConfig={{ scale: 147, center: [0, 10] }}
          style={{ width: "100%", height: "420px" }}
        >
          <ZoomableGroup zoom={zoom} minZoom={1} maxZoom={8}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const numId = String(geo.id);
                  const cData = countryMap[numId];
                  const fill  = cData ? riskColorScale(cData.avgRisk) : "#1a2f45";
                  const isRealInvestor = investorMap[numId];

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={(e) => cData && setTooltip({ data: cData, x: e.clientX, y: e.clientY })}
                      onMouseMove={(e)  => tooltip  && setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null)}
                      onMouseLeave={()  => setTooltip(null)}
                      style={{
                        default: {
                          fill,
                          stroke: "#0a1929",
                          strokeWidth: isRealInvestor ? 0.8 : 0.4,
                          outline: "none",
                          transition: "fill 0.25s ease",
                          // Real investor countries get a subtle glow border
                          filter: isRealInvestor ? "drop-shadow(0 0 3px rgba(0,229,255,0.4))" : "none",
                        },
                        hover: {
                          fill: cData ? "#ffffff" : "#1a2f45",
                          stroke: cData ? "#00e5ff" : "#1a2f45",
                          strokeWidth: 0.9,
                          outline: "none",
                          cursor: cData ? "pointer" : "default",
                          filter: cData ? "brightness(1.25)" : "none",
                        },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      <Legend />

      {/* Info strip */}
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "10px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "11px", color: "#546e7a", fontFamily: "'Courier New', monospace" }}>
          🔵 Glowing border = active investor application registered
        </span>
        <span style={{ fontSize: "11px", color: "#546e7a", fontFamily: "'Courier New', monospace" }}>
          🌍 Baseline = approximate real-world geopolitical risk index
        </span>
      </div>

      {tooltip && <Tooltip data={tooltip.data} x={tooltip.x} y={tooltip.y} />}
    </div>
  );
}
