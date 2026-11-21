"use client";

import { useState } from "react";
import katex from "katex";

export function MathText({ text }: { text: string }) {
  const chunks = text.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);
  return <>{chunks.map((chunk, index) => {
    if (!chunk.startsWith("$")) return <span key={index}>{chunk}</span>;
    const display = chunk.startsWith("$$");
    const body = chunk.slice(display ? 2 : 1, display ? -2 : -1);
    return <span className={display ? "math-display" : "math-inline"} key={index}
      dangerouslySetInnerHTML={{ __html: katex.renderToString(body, { displayMode: display, throwOnError: false, trust: false }) }} />;
  })}</>;
}

const radians = Math.PI / 180;
function orbit(inclination: number, azimuth: number, scale: number) {
  const tilt = inclination * radians;
  const roll = azimuth * radians;
  return Array.from({ length: 121 }, (_, index) => {
    const phi = index * Math.PI / 60;
    const x = Math.cos(phi) * scale;
    const y = Math.sin(phi) * scale * Math.cos(tilt);
    return (index ? "L" : "M") + (235 + x * Math.cos(roll) - y * Math.sin(roll)).toFixed(2)
      + " " + (141 + x * Math.sin(roll) + y * Math.cos(roll)).toFixed(2);
  }).join(" ");
}

export function OrbitArt() {
  return (
    <svg className="orbit-art" aria-hidden="true" viewBox="0 0 480 292" fill="none">
      <defs>
        <radialGradient id="orbitGlow">
          <stop stopColor="var(--accent)" stopOpacity=".15" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <pattern id="orbitGrid" width="21" height="21" patternUnits="userSpaceOnUse">
          <path d="M 21 0 L 0 0 0 21" stroke="var(--accent)" strokeWidth=".55" opacity=".16" />
        </pattern>
        <mask id="orbitFade"><ellipse cx="235" cy="141" rx="225" ry="143" fill="url(#orbitMask)" /></mask>
        <radialGradient id="orbitMask"><stop stopColor="white" /><stop offset="1" stopColor="white" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="235" cy="141" rx="211" ry="142" fill="url(#orbitGlow)" />
      <rect width="480" height="292" fill="url(#orbitGrid)" mask="url(#orbitFade)" />
      <g stroke="var(--accent)">
        <path d="M48 141H428M235 13V267" strokeDasharray="2 6" opacity=".31" />
        <circle cx="235" cy="141" r="105" opacity=".38" />
        <circle cx="235" cy="141" r="117" strokeDasharray="1 6" opacity=".32" />
        {[28, 48, 67, 84].map((angle) => <path key={angle} d={orbit(angle, -18, 105)} opacity=".22" />)}
        {[28, 48, 67, 84].map((angle) => <path key={angle} d={orbit(angle, 72, 105)} opacity=".18" />)}
        <path d={orbit(68, -28, 167)} opacity=".85" strokeWidth="1.2" />
        <path d={orbit(74, 23, 151)} opacity=".45" strokeWidth="1.1" />
        <path d={orbit(70, 102, 128)} opacity=".65" />
        <path d="M235 141L307 86" opacity=".9" strokeWidth="1.4" />
        <circle cx="307" cy="86" r="4.7" fill="var(--accent)" opacity=".95" />
        <circle cx="307" cy="86" r="8.5" opacity=".42" />
        <circle cx="108" cy="205" r="3.5" fill="var(--accent)" opacity=".8" />
        <circle cx="373" cy="185" r="2.5" fill="var(--accent)" opacity=".7" />
        <circle cx="235" cy="141" r="3" fill="var(--accent)" opacity=".9" />
      </g>
      <g fill="var(--accent)" fontFamily="var(--font-geist-mono), monospace" fontSize="12" opacity=".68">
        <text x="246" y="27">z</text><text x="410" y="132">x</text><text x="319" y="82">|ψ⟩</text>
        <text x="144" y="224">θ</text>
      </g>
    </svg>
  );
}

export function Lab({ variant }: { variant: "metric" | "rotation" | "phase" }) {
  const [angle, setAngle] = useState(45);
  const [coupling, setCoupling] = useState(0.8);
  const [basis, setBasis] = useState<"X" | "Z">("Z");
  const isMetric = variant === "metric";
  const phase = variant === "phase";
  const theta = angle * radians;
  const length = Math.sqrt(1 + coupling * Math.sin(2 * theta));
  const pSecond = phase ? (basis === "X" ? Math.sin(theta / 2) ** 2 : 0.5) : Math.sin(theta / 2) ** 2;
  const labels = basis === "X" && phase ? ["+", "−"] : ["0", "1"];
  const points = Array.from({ length: 121 }, (_, index) => {
    const direction = index * Math.PI / 60;
    const radius = Math.sqrt(1 + coupling * Math.sin(2 * direction));
    return (index ? "L" : "M") + (130 + radius * 62 * Math.cos(direction)).toFixed(2)
      + " " + (112 - radius * 62 * Math.sin(direction)).toFixed(2);
  }).join(" ");
  return (
    <section className="lab" aria-label="Interactive experiment">
      <div className="eyebrow">Interactive experiment</div>
      <h3>{isMetric ? "Try equal coordinate steps" : phase ? "Change the phase and the basis" : "Rotate a qubit"}</h3>
      <p>{isMetric ? "The outline shows metric length as a radial distance for each Euclidean-unit direction. Set the coupling to 1 and compare 45° with 135°."
        : phase ? "Prepare |+⟩, then rotate around Z. Compare the predicted outcome probabilities in the X and Z bases."
        : "Prepare |0⟩, apply an RY rotation, and read the exact probabilities in the Z basis."}</p>
      <div className="lab-grid">
        {isMetric ? (
          <svg viewBox="0 0 260 224" role="img" aria-label={"Radial plot of metric lengths. Selected length " + length.toFixed(3)}>
            <circle cx="130" cy="112" r="62" className="lab-axis" fill="none" strokeDasharray="3 4" />
            <path d="M20 112H240M130 10V214" className="lab-axis" />
            <path d={points} className="lab-shape" />
            <path d={"M130 112L" + (130 + 62 * length * Math.cos(theta)) + " " + (112 - 62 * length * Math.sin(theta))} className="lab-active" />
            <circle cx="130" cy="112" r="3" className="lab-point" />
            <circle cx={130 + 62 * length * Math.cos(theta)} cy={112 - 62 * length * Math.sin(theta)} r="4" className="lab-point" />
            <g className="lab-label"><text x="222" y="106">θ₁</text><text x="137" y="21">θ₂</text></g>
          </svg>
        ) : (
          <div className="prob-plot">
            {[1 - pSecond, pSecond].map((p, index) => <div key={index}>
              <div className="prob-label"><span>{labels[index]}</span><strong>{(p * 100).toFixed(1)}%</strong></div>
              <div className="progress-track"><div style={{ width: (p * 100) + "%" }} /></div>
            </div>)}
          </div>
        )}
        <div className="lab-controls">
          <label>{isMetric ? "Step direction" : "Rotation angle"} <output>{angle}°</output>
            <input type="range" min="0" max="360" step="1" value={angle} onChange={event => setAngle(Number(event.target.value))} />
          </label>
          {isMetric && <label>Metric coupling <output>{coupling.toFixed(2)}</output>
            <input type="range" min="0" max="1" step=".01" value={coupling} onChange={event => setCoupling(Number(event.target.value))} />
          </label>}
          {phase && <div className="segments" aria-label="Measurement basis">{(["Z", "X"] as const).map(value =>
            <button key={value} aria-pressed={basis === value} onClick={() => setBasis(value)}>{value} basis</button>)}</div>}
          {isMetric && <div className="lab-stat"><span>Metric length</span><output>{length.toFixed(3)}</output></div>}
        </div>
      </div>
    </section>
  );
}
