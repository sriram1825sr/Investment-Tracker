// CountryDropdown.jsx
// Searchable country dropdown — replaces the country text input
// Triggers auto risk fetch on selection

import { useState, useRef, useEffect } from "react";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Angola","Argentina","Armenia","Australia",
  "Austria","Azerbaijan","Bahrain","Bangladesh","Belarus","Belgium","Bolivia",
  "Bosnia","Botswana","Brazil","Bulgaria","Cambodia","Cameroon","Canada","Chad",
  "Chile","China","Colombia","Congo","Costa Rica","Croatia","Cuba",
  "Czech Republic","Denmark","Dominican Republic","DR Congo","Ecuador","Egypt",
  "El Salvador","Ethiopia","Finland","France","Germany","Ghana","Greece",
  "Guatemala","Haiti","Honduras","Hungary","India","Indonesia","Iran","Iraq",
  "Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya",
  "Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Libya","Lithuania",
  "Luxembourg","Malaysia","Mexico","Moldova","Mongolia","Morocco","Mozambique",
  "Myanmar","Namibia","Nepal","Netherlands","New Zealand","Nicaragua","Nigeria",
  "North Korea","North Macedonia","Norway","Oman","Pakistan","Palestine","Panama",
  "Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia",
  "Saudi Arabia","Senegal","Serbia","Sierra Leone","Somalia","South Africa",
  "South Korea","South Sudan","Spain","Sri Lanka","Sudan","Sweden","Switzerland",
  "Syria","Taiwan","Tajikistan","Tanzania","Thailand","Trinidad and Tobago",
  "Tunisia","Turkey","Turkmenistan","Uganda","Ukraine","United Arab Emirates",
  "United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam",
  "Yemen","Zambia","Zimbabwe"
].sort();

export default function CountryDropdown({ value, onChange, style }) {
  const [search,   setSearch]   = useState("");
  const [open,     setOpen]     = useState(false);
  const [filtered, setFiltered] = useState(COUNTRIES);
  const wrapperRef = useRef(null);

  // Filter countries based on search
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(COUNTRIES.filter(c => c.toLowerCase().includes(q)));
  }, [search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (country) => {
    onChange(country);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative", gridColumn: "1 / -1" }}>

      {/* Display button */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          ...style,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          userSelect: "none",
          color: value ? "white" : "#78909c",
        }}
      >
        <span>{value || "Select Country"}</span>
        <span style={{ fontSize: "11px", color: "#546e7a" }}>{open ? "▲" : "▼"}</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0, right: 0,
          background: "#0d2235",
          border: "1px solid rgba(0,229,255,0.2)",
          borderRadius: "8px",
          zIndex: 1000,
          boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}>

          {/* Search input */}
          <div style={{ padding: "8px" }}>
            <input
              autoFocus
              placeholder="🔍 Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "6px",
                border: "1px solid rgba(0,229,255,0.2)",
                background: "rgba(255,255,255,0.07)",
                color: "white",
                outline: "none",
                fontSize: "13px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Country list */}
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "12px", color: "#546e7a", fontSize: "13px", textAlign: "center" }}>
                No countries found
              </div>
            ) : (
              filtered.map(country => (
                <div
                  key={country}
                  onClick={() => handleSelect(country)}
                  style={{
                    padding: "9px 14px",
                    fontSize: "13px",
                    color: value === country ? "#00e5ff" : "#cfd8dc",
                    background: value === country ? "rgba(0,229,255,0.08)" : "transparent",
                    cursor: "pointer",
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                  onMouseLeave={e => e.currentTarget.style.background = value === country ? "rgba(0,229,255,0.08)" : "transparent"}
                >
                  {country}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
