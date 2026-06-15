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

// ── CVA engine (lightweight replica) ─────────────────────────────────────────
function cva(base, config) {
  return function(props = {}) {
    const classes = [base];
    if (config?.variants) {
      for (const [key, map] of Object.entries(config.variants)) {
        const val = props[key] ?? config.defaultVariants?.[key];
        if (val && map[val]) classes.push(map[val]);
      }
    }
    if (config?.compoundVariants) {
      for (const { className, ...conditions } of config.compoundVariants) {
        const match = Object.entries(conditions).every(
          ([k, v]) => (props[k] ?? config.defaultVariants?.[k]) === v
        );
        if (match) classes.push(className);
      }
    }
    return classes.filter(Boolean).join(" ");
  };
}

// ── buttonVariants — як у shadcn ──────────────────────────────────────────────
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        primary:   "bg-blue-500 text-white hover:bg-blue-600",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        danger:    "bg-red-500 text-white hover:bg-red-600",
        ghost:     "text-gray-700 hover:bg-gray-100",
        outline:   "border border-blue-500 text-blue-500 hover:bg-blue-50",
      },
      size: {
        sm: "px-3 py-1 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
    compoundVariants: [
      { variant: "danger", size: "lg", className: "font-bold tracking-wide" },
    ],
  }
);

// ── real CSS values for preview (Tailwind not available) ──────────────────────
const variantStyles = {
  primary:   { background: "#3b82f6", color: "#fff", border: "none" },
  secondary: { background: "#f3f4f6", color: "#111827", border: "none" },
  danger:    { background: C.red,     color: "#fff",   border: "none" },
  ghost:     { background: "transparent", color: C.text, border: "none" },
  outline:   { background: "transparent", color: C.accent, border: `1px solid ${C.accent}` },
};

const sizeStyles = {
  sm: { padding: "4px 12px",  fontSize: 11 },
  md: { padding: "8px 18px",  fontSize: 13 },
  lg: { padding: "12px 26px", fontSize: 15 },
};

// ── OptionPicker ──────────────────────────────────────────────────────────────
function OptionPicker({ label, options, value, onChange, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 10, color: C.muted }}>{label}</div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {options.map(o => (
          <button key={o} onClick={() => onChange(o)} style={{
            padding: "4px 12px", fontSize: 11, borderRadius: 6, cursor: "pointer",
            fontFamily: "inherit",
            background: value === o ? color + "22" : "transparent",
            border: `1px solid ${value === o ? color : C.border}`,
            color: value === o ? color : C.muted,
            transition: "all 0.12s",
          }}>{o}</button>
        ))}
      </div>
    </div>
  );
}

// ── Builder tab ───────────────────────────────────────────────────────────────
function BuilderTab() {
  const [variant, setVariant] = useState("primary");
  const [size, setSize]       = useState("md");
  const [disabled, setDisabled] = useState(false);

  const classString = buttonVariants({ variant, size });
  const btnStyle = {
    ...variantStyles[variant],
    ...sizeStyles[size],
    borderRadius: 6,
    fontFamily: "inherit",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "all 0.15s",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* pickers */}
      <OptionPicker
        label={"variant:"}
        options={["primary", "secondary", "danger", "ghost", "outline"]}
        value={variant} onChange={setVariant} color={C.accent}
      />
      <OptionPicker
        label={"size:"}
        options={["sm", "md", "lg"]}
        value={size} onChange={setSize} color={C.purple}
      />

      {/* disabled toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 10, color: C.muted }}>{"disabled:"}</div>
        <button onClick={() => setDisabled(p => !p)} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "transparent", border: `1px solid ${disabled ? C.red : C.border}`,
          borderRadius: 8, padding: "4px 10px", cursor: "pointer",
          color: disabled ? C.red : C.muted, fontSize: 11,
          fontFamily: "inherit", transition: "all 0.15s",
        }}>
          <div style={{
            width: 26, height: 13, borderRadius: 99,
            background: disabled ? C.red + "44" : C.surface2,
            border: `1px solid ${disabled ? C.red : C.border}`,
            position: "relative",
          }}>
            <div style={{
              position: "absolute", top: 1,
              left: disabled ? 13 : 1,
              width: 9, height: 9, borderRadius: "50%",
              background: disabled ? C.red : C.muted,
              transition: "left 0.15s",
            }} />
          </div>
          {disabled ? "true" : "false"}
        </button>
      </div>

      {/* preview */}
      <div style={{
        background: C.surface2, borderRadius: 10,
        border: `1px solid ${C.border}`,
        padding: "24px 20px",
        display: "flex", justifyContent: "center", alignItems: "center",
        minHeight: 80,
      }}>
        <button style={btnStyle} disabled={disabled}>Button</button>
      </div>

      {/* generated call */}
      <div style={{ background: C.surface2, borderRadius: 8, padding: "10px 12px" }}>
        <div style={{ fontSize: 10, color: C.muted, marginBottom: 6 }}>
          {"// згенерований виклик:"}
        </div>
        <div style={{ fontSize: 11, color: C.green, lineHeight: 1.7 }}>
          <Fn c="buttonVariants" />
          <Tx c="({" />
          {variant !== "primary" && <><Tx c=" variant: " /><Str c={`"${variant}"`} /></>}
          {variant !== "primary" && size !== "md" && <Tx c="," />}
          {size !== "md" && <><Tx c=" size: " /><Str c={`"${size}"`} /></>}
          <Tx c=" })" />
        </div>
        <div style={{ fontSize: 10, color: C.muted, marginTop: 8, marginBottom: 4 }}>
          {"// результат className:"}
        </div>
        <div style={{ fontSize: 10, color: C.yellow, wordBreak: "break-all", lineHeight: 1.7 }}>
          {`"${classString}"`}
        </div>
      </div>
    </div>
  );
}

// ── Code tab ──────────────────────────────────────────────────────────────────
function CodeTab() {
  return (
    <div style={{ background: C.surface2, borderRadius: 8, padding: "12px 8px" }}>
      <CodeLine ln="1"><Kw c="import" /><Tx c=" " /><Ty c="{ cva, type VariantProps }" /><Tx c=" " /><Kw c="from" /><Str c=" 'class-variance-authority'" /></CodeLine>
      <CodeLine ln="2"><Kw c="import" /><Tx c=" " /><Ty c="{ cn }" /><Tx c=" " /><Kw c="from" /><Str c=" '@/lib/utils'" /></CodeLine>
      <CodeLine ln="3"><Tx c="" /></CodeLine>
      <CodeLine ln="4" highlight><Kw c="const" /><Tx c=" buttonVariants = " /><Fn c="cva" /><Tx c="(" /><Str c="'rounded-md font-medium'" /><Tx c=", {" /></CodeLine>
      <CodeLine ln="5"><Tx c="  variants: {" /></CodeLine>
      <CodeLine ln="6"><Tx c="    variant: {" /></CodeLine>
      <CodeLine ln="7"><Tx c="      primary:   " /><Str c="'bg-blue-500 text-white'" /><Tx c="," /></CodeLine>
      <CodeLine ln="8"><Tx c="      secondary: " /><Str c="'bg-gray-100 text-gray-900'" /><Tx c="," /></CodeLine>
      <CodeLine ln="9"><Tx c="      danger:    " /><Str c="'bg-red-500 text-white'" /><Tx c="," /></CodeLine>
      <CodeLine ln="10"><Tx c="    }," /></CodeLine>
      <CodeLine ln="11"><Tx c="    size: { sm: " /><Str c="'px-3 py-1'" /><Tx c=", md: " /><Str c="'px-4 py-2'" /><Tx c=" }," /></CodeLine>
      <CodeLine ln="12"><Tx c="  }," /></CodeLine>
      <CodeLine ln="13" highlight><Tx c="  defaultVariants: { variant: " /><Str c="'primary'" /><Tx c=", size: " /><Str c="'md'" /><Tx c=" }," /></CodeLine>
      <CodeLine ln="14"><Tx c="})" /></CodeLine>
      <CodeLine ln="15"><Tx c="" /></CodeLine>
      <CodeLine ln="16"><Kw c="type" /><Tx c=" " /><Ty c="ButtonProps" /><Tx c=" =" /></CodeLine>
      <CodeLine ln="17"><Tx c="  " /><Ty c="React.ButtonHTMLAttributes" /><Tx c={"<HTMLButtonElement>"} /></CodeLine>
      <CodeLine ln="18" highlight><Tx c="  & " /><Ty c="VariantProps" /><Tx c={"<typeof buttonVariants>"} /><Tx c=" " /><Cm c="// типи безкоштовно" /></CodeLine>
      <CodeLine ln="19"><Tx c="" /></CodeLine>
      <CodeLine ln="20"><Kw c="function" /><Fn c=" Button" /><Tx c="({ variant, className, ...props }: " /><Ty c="ButtonProps" /><Tx c=") {" /></CodeLine>
      <CodeLine ln="21"><Kw c="  return" /><Tx c=" <button " /><Fn c="className" /><Tx c={"={cn(buttonVariants({ variant }), className)} />"} /></CodeLine>
      <CodeLine ln="22"><Tx c="}" /></CodeLine>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("builder");

  const tabs = [
    { id: "builder", label: "Builder",  color: C.teal },
    { id: "code",    label: "Код",      color: C.purple },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "'JetBrains Mono','Fira Code',monospace",
      boxSizing: "border-box",
    }}>
      <div style={{ width: "100%", maxWidth: 600 }}>

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
            <span style={{ color: C.muted, fontSize: 11 }}>button.tsx</span>
            <span style={{ background: C.teal + "22", color: C.teal, fontSize: 9, padding: "1px 7px", borderRadius: 99 }}>
              Modern UI #3
            </span>
          </div>
          <span style={{ color: C.muted, fontSize: 10 }}>@nby.frontend</span>
        </div>

        {/* tabs */}
        <div style={{
          background: C.surface2, border: `1px solid ${C.border}`,
          borderBottom: "none", display: "flex",
        }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "9px 4px",
              background: tab === t.id ? C.surface : "transparent",
              border: "none",
              borderBottom: `2px solid ${tab === t.id ? t.color : "transparent"}`,
              color: tab === t.id ? t.color : C.muted,
              fontSize: 11, cursor: "pointer", fontFamily: "inherit",
            }}>{t.label}</button>
          ))}
        </div>

        {/* content */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderTop: "none", borderRadius: "0 0 14px 14px",
          padding: "20px 16px", minHeight: 340,
        }}>
          {tab === "builder" && <BuilderTab />}
          {tab === "code"    && <CodeTab />}
        </div>

        {/* hint */}
        <div style={{
          marginTop: 10, background: C.teal + "12",
          border: `1px solid ${C.teal}33`, borderRadius: 8,
          padding: "8px 14px", fontSize: 11, color: C.teal, textAlign: "center",
        }}>
          {"💡 CVA = варіанти + типи + дефолти в одному об'єкті"}
        </div>

      </div>
    </div>
  );
}
