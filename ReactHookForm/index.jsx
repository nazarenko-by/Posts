import { useState, useRef, useEffect } from "react";

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

// ── Render counter flash ───────────────────────────────────────────────────────
function useRenderCount() {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}

function RenderFlash({ count, color }) {
  const [flash, setFlash] = useState(false);
  const prevCount = useRef(count);
  useEffect(() => {
    if (count !== prevCount.current) {
      prevCount.current = count;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 200);
      return () => clearTimeout(t);
    }
  }, [count]);
  return (
    <div style={{
      width: 8, height: 8, borderRadius: "50%",
      background: flash ? color : color + "33",
      transition: "background 0.1s",
      flexShrink: 0,
    }} />
  );
}

// ── useState-based form (re-renders on every keystroke) ───────────────────────
function UseStateForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const renderCount = useRenderCount();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RenderFlash count={renderCount} color={C.red} />
        <span style={{ fontSize: 11, color: C.red, fontWeight: 600 }}>
          re-renders: {renderCount}
        </span>
        <span style={{ fontSize: 9, color: C.muted }}>— useState на кожне поле</span>
      </div>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Ім'я (через useState)"
        style={{
          background: C.surface2, border: `1px solid ${C.border}`,
          borderRadius: 8, padding: "8px 12px",
          color: C.text, fontSize: 12, fontFamily: "inherit", outline: "none",
        }}
      />
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email (через useState)"
        style={{
          background: C.surface2, border: `1px solid ${C.border}`,
          borderRadius: 8, padding: "8px 12px",
          color: C.text, fontSize: 12, fontFamily: "inherit", outline: "none",
        }}
      />
      <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.6 }}>
        {"// кожен символ → setState → re-render всього компонента"}
      </div>
    </div>
  );
}

// ── RHF-style form (no re-render on keystroke, uncontrolled refs) ────────────
function RHFStyleForm() {
  const renderCount = useRenderCount();
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(null);

  // simulate register() — connects directly to DOM, no state update on change
  const register = (fieldName, rules = {}) => ({
    ref: fieldName === "name" ? nameRef : emailRef,
    name: fieldName,
    // no onChange triggers re-render — RHF reads via ref on submit/validate
  });

  const handleSubmit = () => {
    const values = {
      name: nameRef.current?.value || "",
      email: emailRef.current?.value || "",
    };
    const errs = {};
    if (!values.name || values.name.length < 2) errs.name = "Мінімум 2 символи";
    if (!/^\S+@\S+\.\S+$/.test(values.email)) errs.email = "Невірний email";
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSubmitted(values);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RenderFlash count={renderCount} color={C.green} />
        <span style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>
          re-renders: {renderCount}
        </span>
        <span style={{ fontSize: 9, color: C.muted }}>— register() через ref</span>
      </div>
      <input
        ref={nameRef}
        defaultValue=""
        placeholder="Ім'я (через register)"
        style={{
          background: C.surface2,
          border: `1px solid ${errors.name ? C.red + "88" : C.border}`,
          borderRadius: 8, padding: "8px 12px",
          color: C.text, fontSize: 12, fontFamily: "inherit", outline: "none",
        }}
      />
      {errors.name && <span style={{ fontSize: 10, color: C.red }}>{errors.name}</span>}
      <input
        ref={emailRef}
        defaultValue=""
        placeholder="Email (через register)"
        style={{
          background: C.surface2,
          border: `1px solid ${errors.email ? C.red + "88" : C.border}`,
          borderRadius: 8, padding: "8px 12px",
          color: C.text, fontSize: 12, fontFamily: "inherit", outline: "none",
        }}
      />
      {errors.email && <span style={{ fontSize: 10, color: C.red }}>{errors.email}</span>}

      <button onClick={handleSubmit} style={{
        background: C.accent, border: "none", borderRadius: 8,
        padding: "8px 16px", color: C.bg, fontSize: 12,
        fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
      }}>
        handleSubmit()
      </button>

      {submitted && (
        <div style={{ background: C.green + "15", borderRadius: 6, padding: "8px 10px", fontSize: 10, color: C.green }}>
          {"✓ submitted: " + JSON.stringify(submitted)}
        </div>
      )}

      <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.6 }}>
        {"// друкуй скільки хочеш — лічильник вище не зростає"}
      </div>
    </div>
  );
}

// ── Comparison tab ─────────────────────────────────────────────────────────────
function CompareTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 10, color: C.muted }}>
        {"// друкуй в обох полях — дивись на лічильники re-renders"}
      </div>

      <div style={{
        background: C.surface2, borderRadius: 10,
        border: `1px solid ${C.red}33`, padding: "12px",
      }}>
        <UseStateForm />
      </div>

      <div style={{
        background: C.surface2, borderRadius: 10,
        border: `1px solid ${C.green}33`, padding: "12px",
      }}>
        <RHFStyleForm />
      </div>
    </div>
  );
}

// ── Field Array demo ───────────────────────────────────────────────────────────
function FieldArrayTab() {
  const [skills, setSkills] = useState([{ id: 1, value: "React" }]);
  let nextId = useRef(2);

  const append = () => {
    setSkills(p => [...p, { id: nextId.current++, value: "" }]);
  };
  const remove = (id) => {
    setSkills(p => p.filter(s => s.id !== id));
  };
  const update = (id, val) => {
    setSkills(p => p.map(s => s.id === id ? { ...s, value: val } : s));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>
        {"// useFieldArray — динамічний список без болю зі стейтом"}
      </div>

      {skills.map((skill, i) => (
        <div key={skill.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: C.muted, minWidth: 60 }}>{`skills.${i}`}</span>
          <input
            value={skill.value}
            onChange={e => update(skill.id, e.target.value)}
            placeholder="наприклад, TypeScript"
            style={{
              flex: 1, background: C.surface2, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: "7px 12px",
              color: C.text, fontSize: 12, fontFamily: "inherit", outline: "none",
            }}
          />
          <button onClick={() => remove(skill.id)} disabled={skills.length === 1} style={{
            background: "transparent", border: `1px solid ${C.red}55`,
            borderRadius: 6, padding: "5px 10px", color: C.red,
            fontSize: 11, cursor: skills.length === 1 ? "not-allowed" : "pointer",
            opacity: skills.length === 1 ? 0.4 : 1,
            fontFamily: "inherit",
          }}>
            ✕
          </button>
        </div>
      ))}

      <button onClick={append} style={{
        background: C.teal + "18", border: `1px solid ${C.teal}44`,
        borderRadius: 8, padding: "8px 16px", color: C.teal,
        fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
        alignSelf: "flex-start",
      }}>
        + append({"{ value: '' }"})
      </button>

      <div style={{ background: C.surface2, borderRadius: 8, padding: "10px 12px", marginTop: 4 }}>
        <div style={{ fontSize: 10, color: C.muted, marginBottom: 6 }}>{"// поточний стан масиву:"}</div>
        <div style={{ fontSize: 10, color: C.green, wordBreak: "break-all" }}>
          {JSON.stringify(skills.map(s => s.value))}
        </div>
      </div>
    </div>
  );
}

// ── Code tab ──────────────────────────────────────────────────────────────────
function CodeTab() {
  const [section, setSection] = useState("register");
  const sections = [
    { id: "register", label: "register" },
    { id: "zod",      label: "Zod" },
    { id: "fieldarr", label: "FieldArray" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{
            flex: 1, padding: "5px 4px", fontSize: 10,
            background: section === s.id ? C.surface2 : "transparent",
            border: `1px solid ${section === s.id ? C.accent + "55" : C.border}`,
            borderRadius: 6, color: section === s.id ? C.accent : C.muted,
            cursor: "pointer", fontFamily: "inherit",
          }}>{s.label}</button>
        ))}
      </div>

      <div style={{ background: C.surface2, borderRadius: 8, padding: "12px 8px" }}>
        {section === "register" && <>
          <CodeLine ln="1"><Kw c="import" /><Tx c=" " /><Ty c="{ useForm }" /><Tx c=" " /><Kw c="from" /><Str c=" 'react-hook-form'" /></CodeLine>
          <CodeLine ln="2"><Tx c="" /></CodeLine>
          <CodeLine ln="3" highlight><Kw c="const" /><Tx c=" { register, handleSubmit, formState: { errors } }" /></CodeLine>
          <CodeLine ln="4" highlight><Tx c="  = " /><Fn c="useForm" /><Tx c="()" /></CodeLine>
          <CodeLine ln="5"><Tx c="" /></CodeLine>
          <CodeLine ln="6"><Cm c="// register() підключається до DOM через ref" /></CodeLine>
          <CodeLine ln="7"><Tx c="<input {..." /><Fn c="register" /><Tx c="(" /><Str c="'name'" /><Tx c=", { required: " /><Kw c="true" /><Tx c=" })} />" /></CodeLine>
          <CodeLine ln="8"><Tx c="{errors.name " /><Tx c="&& " /><Tx c="<span>" /><Str c="Обов'язкове поле" /><Tx c="</span>}" /></CodeLine>
          <CodeLine ln="9"><Tx c="" /></CodeLine>
          <CodeLine ln="10" highlight><Cm c="// React НЕ ре-рендерить компонент на onChange" /></CodeLine>
        </>}

        {section === "zod" && <>
          <CodeLine ln="1"><Kw c="import" /><Tx c=" " /><Ty c="{ zodResolver }" /><Tx c=" " /><Kw c="from" /><Str c=" '@hookform/resolvers/zod'" /></CodeLine>
          <CodeLine ln="2"><Kw c="import" /><Tx c=" " /><Ty c="{ z }" /><Tx c=" " /><Kw c="from" /><Str c=" 'zod'" /></CodeLine>
          <CodeLine ln="3"><Tx c="" /></CodeLine>
          <CodeLine ln="4" highlight><Kw c="const" /><Tx c=" schema = " /><Fn c="z.object" /><Tx c="({" /></CodeLine>
          <CodeLine ln="5"><Tx c="  name:  " /><Fn c="z.string" /><Tx c="()." /><Fn c="min" /><Tx c="(2)," /></CodeLine>
          <CodeLine ln="6"><Tx c="  email: " /><Fn c="z.string" /><Tx c="()." /><Fn c="email" /><Tx c="()," /></CodeLine>
          <CodeLine ln="7" highlight><Tx c="})" /></CodeLine>
          <CodeLine ln="8"><Tx c="" /></CodeLine>
          <CodeLine ln="9"><Kw c="const" /><Tx c=" { register, handleSubmit } = " /><Fn c="useForm" /><Tx c="({" /></CodeLine>
          <CodeLine ln="10" highlight><Tx c="  resolver: " /><Fn c="zodResolver" /><Tx c="(schema)," /></CodeLine>
          <CodeLine ln="11"><Tx c="})" /></CodeLine>
          <CodeLine ln="12"><Tx c="" /></CodeLine>
          <CodeLine ln="13"><Cm c="// типи форми = типи схеми, автоматично ✅" /></CodeLine>
        </>}

        {section === "fieldarr" && <>
          <CodeLine ln="1"><Kw c="import" /><Tx c=" " /><Ty c="{ useFieldArray }" /><Tx c=" " /><Kw c="from" /><Str c=" 'react-hook-form'" /></CodeLine>
          <CodeLine ln="2"><Tx c="" /></CodeLine>
          <CodeLine ln="3" highlight><Kw c="const" /><Tx c=" { fields, append, remove } = " /><Fn c="useFieldArray" /><Tx c="({" /></CodeLine>
          <CodeLine ln="4" highlight><Tx c="  control," /></CodeLine>
          <CodeLine ln="5" highlight><Tx c="  name: " /><Str c="'skills'" /><Tx c="," /></CodeLine>
          <CodeLine ln="6"><Tx c="})" /></CodeLine>
          <CodeLine ln="7"><Tx c="" /></CodeLine>
          <CodeLine ln="8"><Tx c="{fields." /><Fn c="map" /><Tx c="((field, i) => (" /></CodeLine>
          <CodeLine ln="9"><Tx c="  <input key={field.id}" /></CodeLine>
          <CodeLine ln="10"><Tx c="    {..." /><Fn c="register" /><Tx c="(" /><Str c="`skills.${i}.value`" /><Tx c=")} />" /></CodeLine>
          <CodeLine ln="11"><Tx c="))}" /></CodeLine>
          <CodeLine ln="12"><Tx c="" /></CodeLine>
          <CodeLine ln="13"><Tx c="<button " /><Fn c="onClick" /><Tx c={"={() => append({ value: '' })}>"} /></CodeLine>
        </>}
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("compare");

  const tabs = [
    { id: "compare", label: "Re-renders",  color: C.teal },
    { id: "fieldarr", label: "FieldArray", color: C.accent },
    { id: "code",    label: "Код",         color: C.purple },
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
            <span style={{ color: C.muted, fontSize: 11 }}>form.tsx</span>
            <span style={{ background: C.accent + "22", color: C.accent, fontSize: 9, padding: "1px 7px", borderRadius: 99 }}>
              React Hook Form
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
          padding: "20px 16px", minHeight: 360,
        }}>
          {tab === "compare"  && <CompareTab />}
          {tab === "fieldarr" && <FieldArrayTab />}
          {tab === "code"     && <CodeTab />}
        </div>

        {/* hint */}
        <div style={{
          marginTop: 10, background: C.teal + "12",
          border: `1px solid ${C.teal}33`, borderRadius: 8,
          padding: "8px 14px", fontSize: 11, color: C.teal, textAlign: "center",
        }}>
          {"💡 register() через ref — друкуй скільки хочеш, re-render не зростає"}
        </div>

      </div>
    </div>
  );
}
