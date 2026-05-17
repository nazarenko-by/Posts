import { useState } from "react";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e",
  border: "#2a2c4a",
  accent: "#7dcfff", purple: "#bb9af7", green: "#9ece6a",
  orange: "#ff9e64", yellow: "#e0af68", teal: "#1abc9c",
  muted: "#565f89", text: "#c0caf5",
  red: "#ff5f57",
};

// ── mini Zod runtime ──────────────────────────────────────────────
function zodString(opts = {}) {
  return {
    _type: "string", ...opts,
    email: () => zodString({ ...opts, isEmail: true }),
    min: (n) => zodString({ ...opts, min: n }),
    max: (n) => zodString({ ...opts, max: n }),
    optional: () => zodOptional(zodString(opts)),
    validate(v) {
      const errs = [];
      if (v === undefined || v === null || v === "") {
        errs.push("Required");
        return errs;
      }
      if (typeof v !== "string") errs.push("Expected string");
      if (opts.isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) errs.push("Invalid email");
      if (opts.min !== undefined && v.length < opts.min) errs.push(`Min ${opts.min} chars`);
      if (opts.max !== undefined && v.length > opts.max) errs.push(`Max ${opts.max} chars`);
      return errs;
    },
  };
}
function zodNumber(opts = {}) {
  return {
    _type: "number", ...opts,
    min: (n) => zodNumber({ ...opts, min: n }),
    max: (n) => zodNumber({ ...opts, max: n }),
    optional: () => zodOptional(zodNumber(opts)),
    validate(v) {
      const errs = [];
      if (v === undefined || v === null || v === "") { errs.push("Required"); return errs; }
      const n = Number(v);
      if (isNaN(n)) errs.push("Expected number");
      if (opts.min !== undefined && n < opts.min) errs.push(`Min value: ${opts.min}`);
      if (opts.max !== undefined && n > opts.max) errs.push(`Max value: ${opts.max}`);
      return errs;
    },
  };
}
function zodOptional(inner) {
  return {
    _type: "optional",
    validate(v) {
      if (v === undefined || v === null || v === "") return [];
      return inner.validate(v);
    },
  };
}
function zodObject(shape) {
  return {
    _type: "object", shape,
    safeParse(data) {
      const issues = [];
      const result = {};
      for (const [key, schema] of Object.entries(shape)) {
        const errs = schema.validate(data[key]);
        if (errs.length) issues.push({ field: key, messages: errs });
        else result[key] = data[key];
      }
      if (issues.length) return { success: false, error: { issues } };
      return { success: true, data: result };
    },
  };
}
const z = {
  string: () => zodString(),
  number: () => zodNumber(),
  object: (shape) => zodObject(shape),
};

// ── schema definition ─────────────────────────────────────────────
const UserSchema = z.object({
  name:  z.string().min(2).max(32),
  email: z.string().email(),
  age:   z.number().min(0).max(120),
  site:  z.string().optional(),
});

// ── token helpers ─────────────────────────────────────────────────
const Kw  = ({ c }) => <span style={{ color: C.purple }}>{c}</span>;
const Fn  = ({ c }) => <span style={{ color: C.accent }}>{c}</span>;
const Str = ({ c }) => <span style={{ color: C.green }}>{c}</span>;
const Cm  = ({ c }) => <span style={{ color: C.muted, fontStyle: "italic" }}>{c}</span>;
const Tx  = ({ c }) => <span style={{ color: C.text }}>{c}</span>;
const Ty  = ({ c }) => <span style={{ color: C.yellow }}>{c}</span>;
const Zd  = ({ c }) => <span style={{ color: C.teal }}>{c}</span>;

function CodeLine({ ln, children, highlight }) {
  return (
    <div style={{
      display: "flex", gap: 12, lineHeight: "1.8",
      background: highlight ? C.teal + "12" : "transparent",
      borderLeft: `2px solid ${highlight ? C.teal : "transparent"}`,
      paddingLeft: 4, borderRadius: 2,
    }}>
      <span style={{ color: "#2a2c4a", minWidth: 20, textAlign: "right", fontSize: 10, userSelect: "none", flexShrink: 0 }}>{ln}</span>
      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono','Fira Code',monospace", whiteSpace: "pre" }}>{children}</span>
    </div>
  );
}

// ── Field input ───────────────────────────────────────────────────
function Field({ label, hint, value, onChange, type = "text", error, valid }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: C.muted }}>{label}</span>
        {hint && <span style={{ fontSize: 10, color: C.muted, fontStyle: "italic" }}>{hint}</span>}
      </div>
      <div style={{ position: "relative" }}>
        <input
          type={type} value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: "100%", background: C.surface2,
            border: `1px solid ${error ? C.red : valid ? C.green : C.border}`,
            borderRadius: 8, padding: "8px 32px 8px 10px",
            color: C.text, fontSize: 12, fontFamily: "inherit",
            outline: "none", boxSizing: "border-box",
            transition: "border-color 0.15s",
          }}
        />
        {(error || valid) && (
          <span style={{
            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            fontSize: 13, color: error ? C.red : C.green,
          }}>
            {error ? "✗" : "✓"}
          </span>
        )}
      </div>
      {error && (
        <span style={{ fontSize: 10, color: C.red }}>{error}</span>
      )}
    </div>
  );
}

// ── tabs ──────────────────────────────────────────────────────────
function TabSchema() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ color: C.muted, fontSize: 10 }}>// описуєш схему один раз → отримуєш тип + валідацію</div>
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
        <CodeLine ln="1"><Kw c="import" /><Tx c=" { " /><Ty c="z" /><Tx c=" } " /><Kw c="from" /> <Str c="'zod'" />;</CodeLine>
        <CodeLine ln="2"><Tx c="" /></CodeLine>
        <CodeLine ln="3"><Kw c="const" /><Tx c=" UserSchema = " /><Ty c="z" />.<Fn c="object" /><Tx c="({" /></CodeLine>
        <CodeLine ln="4" highlight><Tx c="  name:  " /><Ty c="z" />.<Zd c="string" /><Tx c="()." /><Zd c="min" /><Tx c="(2)." /><Zd c="max" /><Tx c="(32)," /></CodeLine>
        <CodeLine ln="5" highlight><Tx c="  email: " /><Ty c="z" />.<Zd c="string" /><Tx c="()." /><Zd c="email" /><Tx c="()," /></CodeLine>
        <CodeLine ln="6" highlight><Tx c="  age:   " /><Ty c="z" />.<Zd c="number" /><Tx c="()." /><Zd c="min" /><Tx c="(0)." /><Zd c="max" /><Tx c="(120)," /></CodeLine>
        <CodeLine ln="7" highlight><Tx c="  site:  " /><Ty c="z" />.<Zd c="string" /><Tx c="()." /><Zd c="optional" /><Tx c="()," /></CodeLine>
        <CodeLine ln="8"><Tx c="});" /></CodeLine>
        <CodeLine ln="9"><Tx c="" /></CodeLine>
        <CodeLine ln="10"><Cm c="// тип автоматично з схеми — не пишеш двічі" /></CodeLine>
        <CodeLine ln="11"><Kw c="type" /><Ty c=" User" /><Tx c=" = " /><Ty c="z" />.<Fn c="infer" /><Tx c="<" /><Kw c="typeof" /><Tx c=" UserSchema>;" /></CodeLine>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { label: "z.string()", desc: "рядок", color: C.teal },
          { label: ".email()", desc: "формат email", color: C.teal },
          { label: ".min(n)", desc: "мінімум", color: C.teal },
          { label: ".optional()", desc: "необов'язково", color: C.purple },
        ].map((m, i) => (
          <div key={i} style={{
            flex: 1, background: C.surface2, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "8px 10px", textAlign: "center",
          }}>
            <div style={{ color: m.color, fontSize: 10, fontFamily: "'JetBrains Mono','Fira Code',monospace", marginBottom: 3 }}>{m.label}</div>
            <div style={{ color: C.muted, fontSize: 9 }}>{m.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabLive() {
  const [fields, setFields] = useState({ name: "", email: "", age: "", site: "" });
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState("safeParse");

  const set = (k) => (v) => setFields(p => ({ ...p, [k]: v }));

  const fieldErrors = {};
  const fieldValid = {};
  if (result && !result.success) {
    result.error.issues.forEach(issue => {
      fieldErrors[issue.field] = issue.messages[0];
    });
  }
  if (result?.success) {
    Object.keys(fields).forEach(k => { fieldValid[k] = true; });
  }

  const run = () => {
    const data = {
      name: fields.name,
      email: fields.email,
      age: fields.age === "" ? "" : Number(fields.age),
      site: fields.site || undefined,
    };
    const r = UserSchema.safeParse(data);
    setResult(r);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {["safeParse", "parse"].map(m => (
          <button key={m} onClick={() => { setMode(m); setResult(null); }} style={{
            flex: 1, padding: "6px 0",
            background: mode === m ? C.teal + "22" : "transparent",
            border: `1px solid ${mode === m ? C.teal : C.border}`,
            borderRadius: 7, color: mode === m ? C.teal : C.muted,
            fontSize: 11, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
          }}>
            {m === "safeParse" ? "safeParse — без throw" : "parse — з throw"}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Field label="name" hint="min 2, max 32" value={fields.name} onChange={set("name")}
          error={fieldErrors.name} valid={fieldValid.name} />
        <Field label="email" hint="valid email" value={fields.email} onChange={set("email")}
          error={fieldErrors.email} valid={fieldValid.email} />
        <Field label="age" hint="0–120" type="number" value={fields.age} onChange={set("age")}
          error={fieldErrors.age} valid={fieldValid.age} />
        <Field label="site" hint="optional" value={fields.site} onChange={set("site")}
          error={fieldErrors.site} valid={fieldValid.site} />
      </div>

      <button onClick={run} style={{
        background: C.teal, border: "none", borderRadius: 8,
        padding: "9px 0", color: C.bg,
        fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
      }}>
        ▶ {mode === "safeParse" ? "UserSchema.safeParse(data)" : "UserSchema.parse(data)"}
      </button>

      {result && (
        <div style={{
          background: result.success ? C.green + "12" : C.red + "12",
          border: `1px solid ${result.success ? C.green : C.red}44`,
          borderRadius: 8, padding: "12px 14px",
          fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: 11,
          transition: "all 0.2s",
        }}>
          {result.success ? (
            <>
              <div style={{ color: C.green, marginBottom: 8 }}>✓ success: true</div>
              <div style={{ color: C.muted, marginBottom: 4 }}>data:</div>
              {Object.entries(result.data).map(([k, v]) => (
                <div key={k} style={{ paddingLeft: 12 }}>
                  <span style={{ color: C.muted }}>{k}: </span>
                  <span style={{ color: typeof v === "number" ? C.orange : C.green }}>
                    {typeof v === "string" ? `"${v}"` : String(v)}
                  </span>
                </div>
              ))}
            </>
          ) : (
            <>
              <div style={{ color: C.red, marginBottom: 8 }}>✗ success: false</div>
              <div style={{ color: C.muted, marginBottom: 4 }}>error.issues:</div>
              {result.error.issues.map((issue, i) => (
                <div key={i} style={{ paddingLeft: 12, marginBottom: 2 }}>
                  <span style={{ color: C.yellow }}>{issue.field}</span>
                  <span style={{ color: C.muted }}>: </span>
                  <span style={{ color: C.red }}>{issue.messages[0]}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function TabCompare() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div style={{ color: C.red, fontSize: 10, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.red, display: "inline-block" }} />
          без Zod — тип і валідація окремо
        </div>
        <div style={{ background: C.bg, border: `1px solid ${C.red}44`, borderRadius: 8, padding: "12px 14px" }}>
          <CodeLine ln="1"><Cm c="// тип — тільки compile time" /></CodeLine>
          <CodeLine ln="2"><Kw c="interface" /><Ty c=" User" /><Tx c=" { id: " /><Ty c="number" /><Tx c="; email: " /><Ty c="string" /><Tx c=" }" /></CodeLine>
          <CodeLine ln="3"><Tx c="" /></CodeLine>
          <CodeLine ln="4"><Cm c="// валідація — вручну, не синхронізована" /></CodeLine>
          <CodeLine ln="5"><Kw c="if" /><Tx c=" (" /><Kw c="typeof" /><Tx c=" data.id !== " /><Str c="'number'" /><Tx c=")" /></CodeLine>
          <CodeLine ln="6"><Tx c="  " /><Kw c="throw new" /><Ty c=" Error" /><Tx c="(" /><Str c="'bad id'" /><Tx c=");" /></CodeLine>
          <CodeLine ln="7"><Kw c="if" /><Tx c=" (" /><Kw c="typeof" /><Tx c=" data.email !== " /><Str c="'string'" /><Tx c=")" /></CodeLine>
          <CodeLine ln="8"><Tx c="  " /><Kw c="throw new" /><Ty c=" Error" /><Tx c="(" /><Str c="'bad email'" /><Tx c=");" /></CodeLine>
        </div>
      </div>

      <div style={{ textAlign: "center", color: C.muted, fontSize: 18 }}>↓</div>

      <div>
        <div style={{ color: C.green, fontSize: 10, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, display: "inline-block" }} />
          з Zod — одна схема для всього
        </div>
        <div style={{ background: C.bg, border: `1px solid ${C.green}44`, borderRadius: 8, padding: "12px 14px" }}>
          <CodeLine ln="1"><Kw c="const" /><Tx c=" UserSchema = " /><Ty c="z" />.<Fn c="object" /><Tx c="({" /></CodeLine>
          <CodeLine ln="2"><Tx c="  id:    " /><Ty c="z" />.<Zd c="number" /><Tx c="()," /></CodeLine>
          <CodeLine ln="3"><Tx c="  email: " /><Ty c="z" />.<Zd c="string" /><Tx c="()." /><Zd c="email" /><Tx c="()," /></CodeLine>
          <CodeLine ln="4"><Tx c="});" /></CodeLine>
          <CodeLine ln="5"><Tx c="" /></CodeLine>
          <CodeLine ln="6"><Cm c="// тип — автоматично з схеми" /></CodeLine>
          <CodeLine ln="7"><Kw c="type" /><Ty c=" User" /><Tx c=" = " /><Ty c="z" />.<Fn c="infer" /><Tx c="<" /><Kw c="typeof" /><Tx c=" UserSchema>;" /></CodeLine>
          <CodeLine ln="8"><Cm c="// валідація — одним рядком" /></CodeLine>
          <CodeLine ln="9"><Kw c="const" /><Tx c=" user = UserSchema." /><Fn c="parse" /><Tx c="(data);" /></CodeLine>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[
          { label: "без Zod", items: ["тип окремо", "валідація окремо", "легко розсинхронізувати", "багато boilerplate"], color: C.red },
          { label: "з Zod", items: ["схема = тип = валідація", "chainable API", "детальні помилки", "z.infer<typeof>"], color: C.green },
        ].map((col, i) => (
          <div key={i} style={{ background: col.color + "10", border: `1px solid ${col.color}33`, borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ color: col.color, fontSize: 10, marginBottom: 8, fontWeight: 700 }}>{col.label}</div>
            {col.items.map((item, j) => (
              <div key={j} style={{ color: C.muted, fontSize: 10, lineHeight: 1.8, display: "flex", gap: 5 }}>
                <span style={{ color: col.color }}>{i === 0 ? "✗" : "✓"}</span> {item}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// App
// ═══════════════════════════════════════════════════════════════════
const tabs = [
  { id: "schema",  label: "Схема",    color: C.teal },
  { id: "live",    label: "Live",     color: C.green },
  { id: "compare", label: "Порівняння", color: C.accent },
];

export default function ZodDemo() {
  const [active, setActive] = useState("live");

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 16px", fontFamily: "'JetBrains Mono','Fira Code',monospace",
      boxSizing: "border-box",
    }}>
      <div style={{ width: "100%", maxWidth: 600 }}>

        {/* titlebar */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderBottom: "none", borderRadius: "14px 14px 0 0",
          padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[C.red, "#ffbd2e", "#28c840"].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <span style={{ color: C.muted, fontSize: 11 }}>schema.ts — Zod</span>
          <span style={{ color: C.muted, fontSize: 10 }}>@nby.frontend</span>
        </div>

        {/* tabs */}
        <div style={{
          background: C.surface2, border: `1px solid ${C.border}`,
          borderTop: `1px solid ${C.border}`, borderBottom: "none", display: "flex",
        }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)} style={{
              flex: 1, padding: "9px 4px",
              background: active === t.id ? C.surface : "transparent",
              border: "none",
              borderBottom: `2px solid ${active === t.id ? t.color : "transparent"}`,
              color: active === t.id ? t.color : C.muted,
              fontSize: 11, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* content */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderTop: "none", borderRadius: "0 0 14px 14px", padding: "16px",
        }}>
          {active === "schema"  && <TabSchema />}
          {active === "live"    && <TabLive />}
          {active === "compare" && <TabCompare />}
        </div>

        {/* hint */}
        <div style={{
          marginTop: 10, background: C.teal + "12",
          border: `1px solid ${C.teal}33`, borderRadius: 8,
          padding: "8px 14px", fontSize: 11, color: C.teal, textAlign: "center",
        }}>
          💡 safeParse замість parse — якщо не хочеш try/catch
        </div>

      </div>
    </div>
  );
}
