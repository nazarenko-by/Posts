import { useState } from "react";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e",
  border: "#2a2c4a",
  accent: "#7dcfff", purple: "#bb9af7", green: "#9ece6a",
  orange: "#ff9e64", yellow: "#e0af68", teal: "#1abc9c",
  muted: "#565f89", text: "#c0caf5",
  red: "#ff5f57",
};

const Kw  = ({ c }) => <span style={{ color: C.purple }}>{c}</span>;
const Fn  = ({ c }) => <span style={{ color: C.accent }}>{c}</span>;
const Str = ({ c }) => <span style={{ color: C.green }}>{c}</span>;
const Cm  = ({ c }) => <span style={{ color: C.muted, fontStyle: "italic" }}>{c}</span>;
const Tx  = ({ c }) => <span style={{ color: C.text }}>{c}</span>;
const Ty  = ({ c }) => <span style={{ color: C.yellow }}>{c}</span>;

function CodeLine({ ln, children, highlight, dim }) {
  return (
    <div style={{
      display: "flex", gap: 12, lineHeight: "1.85",
      opacity: dim ? 0.35 : 1,
      background: highlight ? C.teal + "12" : "transparent",
      borderLeft: `2px solid ${highlight ? C.teal : "transparent"}`,
      paddingLeft: 4, borderRadius: 2,
    }}>
      <span style={{ color: "#2a2c4a", minWidth: 20, textAlign: "right", fontSize: 10, userSelect: "none", flexShrink: 0 }}>{ln}</span>
      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono','Fira Code',monospace", whiteSpace: "pre" }}>{children}</span>
    </div>
  );
}

// ── stories definition ────────────────────────────────────────────────────────
const STORIES = {
  Button: {
    tag: "stable",
    tagColor: C.green,
    stories: [
      {
        name: "Primary",
        args: { variant: "primary", size: "md", disabled: false, children: "Click me" },
      },
      {
        name: "Secondary",
        args: { variant: "secondary", size: "md", disabled: false, children: "Cancel" },
      },
      {
        name: "Danger",
        args: { variant: "danger", size: "md", disabled: false, children: "Delete" },
      },
      {
        name: "Disabled",
        args: { variant: "primary", size: "md", disabled: true, children: "Loading..." },
      },
      {
        name: "Small Ghost",
        args: { variant: "ghost", size: "sm", disabled: false, children: "Learn more" },
      },
    ],
  },
  Input: {
    tag: "stable",
    tagColor: C.green,
    stories: [
      {
        name: "Default",
        args: { placeholder: "Enter text...", disabled: false, error: false },
      },
      {
        name: "With Error",
        args: { placeholder: "Enter email...", disabled: false, error: true },
      },
      {
        name: "Disabled",
        args: { placeholder: "Cannot edit", disabled: true, error: false },
      },
    ],
  },
  Badge: {
    tag: "alpha",
    tagColor: C.orange,
    stories: [
      {
        name: "Default",
        args: { label: "New", color: "blue" },
      },
      {
        name: "Success",
        args: { label: "Stable", color: "green" },
      },
      {
        name: "Warning",
        args: { label: "Alpha", color: "orange" },
      },
    ],
  },
};

// ── preview components ────────────────────────────────────────────────────────
const variantStyles = {
  primary:   { background: "#3b82f6", color: "#fff",     border: "none" },
  secondary: { background: C.surface2, color: C.text,   border: `1px solid ${C.border}` },
  danger:    { background: C.red,     color: "#fff",     border: "none" },
  ghost:     { background: "transparent", color: C.text, border: "none" },
  outline:   { background: "transparent", color: C.accent, border: `1.5px solid ${C.accent}` },
};
const sizeStyles = {
  sm: { padding: "4px 12px",  fontSize: 11, borderRadius: 6 },
  md: { padding: "8px 18px",  fontSize: 13, borderRadius: 8 },
  lg: { padding: "12px 26px", fontSize: 15, borderRadius: 10 },
};

function PreviewButton({ variant = "primary", size = "md", disabled, children }) {
  return (
    <button disabled={disabled} style={{
      ...(variantStyles[variant] || variantStyles.primary),
      ...(sizeStyles[size] || sizeStyles.md),
      fontFamily: "inherit", fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1, transition: "all 0.15s",
    }}>{children}</button>
  );
}

function PreviewInput({ placeholder, disabled, error }) {
  const [val, setVal] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
      <input
        value={val} onChange={e => setVal(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        style={{
          background: C.surface2,
          border: `1px solid ${error ? C.red + "88" : C.border}`,
          borderRadius: 8, padding: "8px 12px",
          color: disabled ? C.muted : C.text, fontSize: 12,
          fontFamily: "inherit", outline: "none", width: "100%",
          boxSizing: "border-box", opacity: disabled ? 0.5 : 1,
        }}
      />
      {error && <span style={{ fontSize: 10, color: C.red }}>Невірний формат email</span>}
    </div>
  );
}

const badgeColorMap = {
  blue:   { bg: C.accent + "22",  color: C.accent,  border: C.accent + "44" },
  green:  { bg: C.green + "22",   color: C.green,   border: C.green + "44" },
  orange: { bg: C.orange + "22",  color: C.orange,  border: C.orange + "44" },
};

function PreviewBadge({ label, color }) {
  const s = badgeColorMap[color] || badgeColorMap.blue;
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>{label}</span>
  );
}

function renderPreview(component, args) {
  if (component === "Button")
    return <PreviewButton {...args} />;
  if (component === "Input")
    return <PreviewInput {...args} />;
  if (component === "Badge")
    return <PreviewBadge {...args} />;
  return null;
}

// ── Tag badge ─────────────────────────────────────────────────────────────────
function TagBadge({ tag, color }) {
  return (
    <span style={{
      fontSize: 8, padding: "1px 5px", borderRadius: 99, fontWeight: 700,
      background: color + "22", color, border: `1px solid ${color}44`,
    }}>{tag}</span>
  );
}

// ── Controls panel ────────────────────────────────────────────────────────────
function ControlsPanel({ args, onChange, component }) {
  const controls = {
    Button: [
      { key: "variant",  type: "select", options: ["primary","secondary","danger","ghost","outline"] },
      { key: "size",     type: "select", options: ["sm","md","lg"] },
      { key: "children", type: "text" },
      { key: "disabled", type: "boolean" },
    ],
    Input: [
      { key: "placeholder", type: "text" },
      { key: "disabled",    type: "boolean" },
      { key: "error",       type: "boolean" },
    ],
    Badge: [
      { key: "label", type: "text" },
      { key: "color", type: "select", options: ["blue","green","orange"] },
    ],
  }[component] || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, fontWeight: 600, letterSpacing: 0.5 }}>
        CONTROLS
      </div>
      {controls.map(ctrl => (
        <div key={ctrl.key} style={{
          display: "flex", alignItems: "center", gap: 8,
          borderBottom: `1px solid ${C.border}`, paddingBottom: 8,
        }}>
          <span style={{ fontSize: 11, color: C.muted, minWidth: 72, flexShrink: 0 }}>{ctrl.key}</span>
          {ctrl.type === "select" && (
            <select
              value={args[ctrl.key] ?? ""}
              onChange={e => onChange({ ...args, [ctrl.key]: e.target.value })}
              style={{
                background: C.surface2, border: `1px solid ${C.border}`,
                borderRadius: 6, padding: "3px 8px", color: C.orange,
                fontSize: 11, fontFamily: "inherit", outline: "none", flex: 1,
              }}
            >
              {ctrl.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
          {ctrl.type === "text" && (
            <input
              value={args[ctrl.key] ?? ""}
              onChange={e => onChange({ ...args, [ctrl.key]: e.target.value })}
              style={{
                background: C.surface2, border: `1px solid ${C.border}`,
                borderRadius: 6, padding: "3px 8px", color: C.green,
                fontSize: 11, fontFamily: "inherit", outline: "none", flex: 1,
              }}
            />
          )}
          {ctrl.type === "boolean" && (
            <button
              onClick={() => onChange({ ...args, [ctrl.key]: !args[ctrl.key] })}
              style={{
                background: args[ctrl.key] ? C.teal + "22" : C.surface2,
                border: `1px solid ${args[ctrl.key] ? C.teal : C.border}`,
                borderRadius: 6, padding: "3px 12px",
                color: args[ctrl.key] ? C.teal : C.muted,
                fontSize: 11, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {String(args[ctrl.key])}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Story code snippet ────────────────────────────────────────────────────────
function StoryCode({ component, storyName, args }) {
  const argsStr = Object.entries(args)
    .filter(([k, v]) => v !== false && v !== "" && v !== undefined)
    .map(([k, v]) => typeof v === "boolean"
      ? `  ${k}`
      : typeof v === "string"
        ? `  ${k}="${v}"`
        : `  ${k}={${v}}`
    ).join("\n");

  return (
    <div style={{ background: C.surface2, borderRadius: 8, padding: "12px 8px" }}>
      <CodeLine ln="1"><Kw c="export const" /><Tx c={" " + storyName + ": "} /><Ty c="Story" /><Tx c=" = {" /></CodeLine>
      <CodeLine ln="2" highlight><Tx c="  args: {" /></CodeLine>
      {Object.entries(args)
        .filter(([, v]) => v !== false && v !== "")
        .map(([k, v], i) => (
          <CodeLine key={k} ln={String(3 + i)} highlight>
            <Tx c={"    " + k + ": "} />
            {typeof v === "string"
              ? <Str c={`"${v}"`} />
              : <Tx c={String(v)} />
            }
            <Tx c="," />
          </CodeLine>
        ))
      }
      <CodeLine ln={String(3 + Object.keys(args).length)}><Tx c="  }," /></CodeLine>
      <CodeLine ln={String(4 + Object.keys(args).length)}><Tx c="}" /></CodeLine>
    </div>
  );
}

// ── Main simulator ────────────────────────────────────────────────────────────
function StorybookSim() {
  const [activeComponent, setActiveComponent] = useState("Button");
  const [activeStoryIdx, setActiveStoryIdx]   = useState(0);
  const [panel, setPanel]                     = useState("controls");
  const [sidebarOpen, setSidebarOpen]         = useState(true);

  const compData  = STORIES[activeComponent];
  const story     = compData.stories[activeStoryIdx];
  const [args, setArgs] = useState(story.args);

  const selectStory = (comp, idx) => {
    setActiveComponent(comp);
    setActiveStoryIdx(idx);
    setArgs(STORIES[comp].stories[idx].args);
  };

  return (
    <div style={{
      display: "flex", height: 420,
      border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden",
    }}>

      {/* ── sidebar ── */}
      {sidebarOpen && (
        <div style={{
          width: 160, flexShrink: 0,
          background: C.surface2, borderRight: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* sidebar header */}
          <div style={{
            padding: "8px 10px", borderBottom: `1px solid ${C.border}`,
            fontSize: 10, color: C.muted, fontWeight: 600, letterSpacing: 0.5,
          }}>
            COMPONENTS
          </div>

          {/* component tree */}
          <div style={{ flex: 1, overflow: "auto" }}>
            {Object.entries(STORIES).map(([comp, data]) => (
              <div key={comp}>
                {/* component row */}
                <div style={{
                  padding: "6px 10px",
                  display: "flex", alignItems: "center", gap: 6,
                  background: activeComponent === comp ? C.accent + "12" : "transparent",
                  cursor: "pointer",
                }} onClick={() => selectStory(comp, 0)}>
                  <span style={{ fontSize: 10, color: C.muted }}>▾</span>
                  <span style={{ fontSize: 11, color: activeComponent === comp ? C.accent : C.text, fontWeight: 600 }}>
                    {comp}
                  </span>
                  <TagBadge tag={data.tag} color={data.tagColor} />
                </div>

                {/* stories */}
                {data.stories.map((s, i) => (
                  <div
                    key={s.name}
                    onClick={() => selectStory(comp, i)}
                    style={{
                      padding: "4px 10px 4px 24px",
                      fontSize: 10,
                      color: activeComponent === comp && activeStoryIdx === i ? C.accent : C.muted,
                      background: activeComponent === comp && activeStoryIdx === i ? C.accent + "12" : "transparent",
                      cursor: "pointer",
                      borderLeft: `2px solid ${activeComponent === comp && activeStoryIdx === i ? C.accent : "transparent"}`,
                    }}
                  >
                    {s.name}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── main area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* toolbar */}
        <div style={{
          padding: "6px 12px", borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", gap: 8,
          background: C.surface,
        }}>
          <button onClick={() => setSidebarOpen(p => !p)} style={{
            background: "transparent", border: `1px solid ${C.border}`,
            borderRadius: 4, padding: "2px 6px",
            color: C.muted, fontSize: 10, cursor: "pointer", fontFamily: "inherit",
          }}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
          <span style={{ fontSize: 11, color: C.muted }}>{activeComponent}</span>
          <span style={{ fontSize: 10, color: C.border }}>/</span>
          <span style={{ fontSize: 11, color: C.accent }}>{story.name}</span>
          <TagBadge tag={compData.tag} color={compData.tagColor} />
        </div>

        {/* canvas */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          background: "#ffffff08",
          backgroundImage: "radial-gradient(circle, #2a2c4a 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          position: "relative",
        }}>
          <div style={{
            background: C.surface, borderRadius: 10,
            padding: "32px 40px",
            border: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            minWidth: 120,
          }}>
            {renderPreview(activeComponent, args)}
          </div>
        </div>

        {/* bottom panel */}
        <div style={{
          height: 160, borderTop: `1px solid ${C.border}`,
          display: "flex", flexDirection: "column",
          background: C.surface,
        }}>
          {/* panel tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
            {["controls", "code"].map(p => (
              <button key={p} onClick={() => setPanel(p)} style={{
                padding: "5px 14px", fontSize: 10, fontWeight: 600,
                background: "transparent", border: "none",
                borderBottom: `2px solid ${panel === p ? C.accent : "transparent"}`,
                color: panel === p ? C.accent : C.muted,
                cursor: "pointer", fontFamily: "inherit",
                textTransform: "uppercase", letterSpacing: 0.5,
              }}>{p}</button>
            ))}
          </div>

          {/* panel content */}
          <div style={{ flex: 1, overflow: "auto", padding: "8px 12px" }}>
            {panel === "controls" && (
              <ControlsPanel
                args={args}
                onChange={setArgs}
                component={activeComponent}
              />
            )}
            {panel === "code" && (
              <StoryCode
                component={activeComponent}
                storyName={story.name.replace(" ", "")}
                args={args}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "'JetBrains Mono','Fira Code',monospace",
      boxSizing: "border-box",
    }}>
      <div style={{ width: "100%", maxWidth: 680 }}>

        {/* titlebar */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderBottom: "none", borderRadius: "14px 14px 0 0",
          padding: "10px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[C.red, "#ffbd2e", "#28c840"].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: C.muted, fontSize: 11 }}>Button.stories.tsx</span>
            <span style={{ background: C.orange + "22", color: C.orange, fontSize: 9, padding: "1px 7px", borderRadius: 99 }}>
              Storybook 9
            </span>
          </div>
          <span style={{ color: C.muted, fontSize: 10 }}>@nby.frontend</span>
        </div>

        {/* storybook sim */}
        <div style={{
          border: `1px solid ${C.border}`,
          borderTop: "none", borderRadius: "0 0 14px 14px",
          overflow: "hidden",
        }}>
          <StorybookSim />
        </div>

        {/* hint */}
        <div style={{
          marginTop: 10, background: C.teal + "12",
          border: `1px solid ${C.teal}33`, borderRadius: 8,
          padding: "8px 14px", fontSize: 11, color: C.teal, textAlign: "center",
        }}>
          {"💡 змінюй Controls — бачиш компонент і код Story одночасно"}
        </div>

      </div>
    </div>
  );
}
