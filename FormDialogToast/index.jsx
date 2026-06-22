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

// ── Zod-like validation ───────────────────────────────────────────────────────
function validate(values) {
  const errors = {};
  if (!values.name || values.name.trim().length < 2)
    errors.name = "Мінімум 2 символи";
  if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = "Невірний email";
  if (values.bio && values.bio.length > 120)
    errors.bio = "Максимум 120 символів";
  return errors;
}

// ── Toast system ──────────────────────────────────────────────────────────────
function Toast({ toasts, onRemove }) {
  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20,
      display: "flex", flexDirection: "column", gap: 8,
      zIndex: 200, pointerEvents: "none",
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === "success" ? C.green + "18" : C.red + "18",
          border: `1px solid ${t.type === "success" ? C.green + "55" : C.red + "55"}`,
          borderRadius: 10, padding: "10px 16px",
          display: "flex", alignItems: "flex-start", gap: 10,
          maxWidth: 280, pointerEvents: "all",
          animation: "slideIn 0.2s ease",
        }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>
            {t.type === "success" ? "✓" : "✕"}
          </span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.type === "success" ? C.green : C.red }}>
              {t.title}
            </div>
            {t.description && (
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{t.description}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (type, title, description) => {
    const id = Date.now();
    setToasts(p => [...p, { id, type, title, description }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };
  return {
    toasts,
    success: (title, description) => add("success", title, description),
    error:   (title, description) => add("error",   title, description),
  };
}

// ── Dialog ────────────────────────────────────────────────────────────────────
function Dialog({ open, onClose, onConfirm, values }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 14, padding: "24px", width: 320, maxWidth: "90vw",
        }}
      >
        {/* header */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>
            Зберегти зміни?
          </div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
            Профіль буде оновлено з новими даними.
          </div>
        </div>

        {/* preview values */}
        <div style={{
          background: C.surface2, borderRadius: 8,
          padding: "10px 12px", marginBottom: 16,
          fontSize: 11, color: C.muted, lineHeight: 1.8,
        }}>
          <div><span style={{ color: C.accent }}>name: </span><span style={{ color: C.text }}>{values.name}</span></div>
          <div><span style={{ color: C.accent }}>email: </span><span style={{ color: C.text }}>{values.email}</span></div>
          {values.bio && <div><span style={{ color: C.accent }}>bio: </span><span style={{ color: C.text }}>{values.bio}</span></div>}
        </div>

        {/* footer */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{
            background: "transparent", border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "7px 16px", color: C.muted,
            fontSize: 12, cursor: "pointer", fontFamily: "inherit",
          }}>
            Скасувати
          </button>
          <button onClick={onConfirm} style={{
            background: C.accent, border: "none",
            borderRadius: 8, padding: "7px 16px", color: C.bg,
            fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}>
            Зберегти
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Form Input ────────────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, color: error ? C.red : C.muted }}>{label}</label>
      {children}
      {error && <div style={{ fontSize: 10, color: C.red }}>{error}</div>}
    </div>
  );
}

function Input({ value, onChange, placeholder, hasError }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        background: C.surface2,
        border: `1px solid ${hasError ? C.red + "88" : C.border}`,
        borderRadius: 8, padding: "8px 12px",
        color: C.text, fontSize: 12, fontFamily: "inherit",
        outline: "none", transition: "border-color 0.15s",
      }}
    />
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepBadge({ step, current }) {
  const active = current === step;
  const done   = current > step;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 22, height: 22, borderRadius: "50%",
        background: done ? C.green + "33" : active ? C.accent + "22" : C.surface2,
        border: `1.5px solid ${done ? C.green : active ? C.accent : C.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, color: done ? C.green : active ? C.accent : C.muted,
        fontWeight: 700, flexShrink: 0,
        transition: "all 0.2s",
      }}>
        {done ? "✓" : step}
      </div>
    </div>
  );
}

// ── Demo tab ──────────────────────────────────────────────────────────────────
function DemoTab() {
  const [values, setValues]       = useState({ name: "", email: "", bio: "" });
  const [errors, setErrors]       = useState({});
  const [touched, setTouched]     = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [step, setStep]           = useState(1); // 1=form 2=dialog 3=done
  const toast = useToast();

  const set = (field) => (e) => {
    const val = e.target.value;
    setValues(p => ({ ...p, [field]: val }));
    if (touched[field]) {
      const errs = validate({ ...values, [field]: val });
      setErrors(p => ({ ...p, [field]: errs[field] }));
    }
  };

  const blur = (field) => () => {
    setTouched(p => ({ ...p, [field]: true }));
    const errs = validate(values);
    setErrors(p => ({ ...p, [field]: errs[field] }));
  };

  const handleSubmit = () => {
    const allTouched = { name: true, email: true, bio: true };
    setTouched(allTouched);
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Перевір форму", "Є помилки які треба виправити");
      return;
    }
    setDialogOpen(true);
    setStep(2);
  };

  const handleSave = async () => {
    setDialogOpen(false);
    setSaving(true);
    setStep(3);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    toast.success("Профіль оновлено!", "Зміни збережено успішно");
    setTimeout(() => setStep(1), 2000);
  };

  const handleReset = () => {
    setValues({ name: "", email: "", bio: "" });
    setErrors({});
    setTouched({});
    setStep(1);
  };

  const charCount = values.bio.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* step indicator */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        background: C.surface2, borderRadius: 8, padding: "8px 12px",
      }}>
        <StepBadge step={1} current={step} />
        <div style={{ fontSize: 10, color: step === 1 ? C.accent : C.muted, flex: 1 }}>Form</div>
        <div style={{ width: 24, height: 1, background: C.border }} />
        <StepBadge step={2} current={step} />
        <div style={{ fontSize: 10, color: step === 2 ? C.accent : C.muted, flex: 1 }}>Dialog</div>
        <div style={{ width: 24, height: 1, background: C.border }} />
        <StepBadge step={3} current={step} />
        <div style={{ fontSize: 10, color: step === 3 ? C.accent : C.muted, flex: 1 }}>Toast</div>
      </div>

      {/* form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="Ім'я *" error={touched.name && errors.name}>
          <Input
            value={values.name}
            onChange={set("name")}
            onBlur={blur("name")}
            placeholder="Bohdan"
            hasError={!!(touched.name && errors.name)}
          />
        </Field>

        <Field label="Email *" error={touched.email && errors.email}>
          <Input
            value={values.email}
            onChange={set("email")}
            onBlur={blur("email")}
            placeholder="bohdan@example.com"
            hasError={!!(touched.email && errors.email)}
          />
        </Field>

        <Field label={`Bio (${charCount}/120)`} error={touched.bio && errors.bio}>
          <textarea
            value={values.bio}
            onChange={set("bio")}
            onBlur={blur("bio")}
            placeholder="Frontend розробник..."
            rows={2}
            style={{
              background: C.surface2,
              border: `1px solid ${touched.bio && errors.bio ? C.red + "88" : C.border}`,
              borderRadius: 8, padding: "8px 12px",
              color: C.text, fontSize: 12, fontFamily: "inherit",
              outline: "none", resize: "none",
            }}
          />
        </Field>
      </div>

      {/* actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleReset} style={{
          background: "transparent", border: `1px solid ${C.border}`,
          borderRadius: 8, padding: "8px 16px", color: C.muted,
          fontSize: 12, cursor: "pointer", fontFamily: "inherit",
        }}>
          Скинути
        </button>
        <button onClick={handleSubmit} disabled={saving} style={{
          background: saving ? C.border : C.accent,
          border: "none", borderRadius: 8, padding: "8px 20px",
          color: saving ? C.muted : C.bg,
          fontSize: 12, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
          fontFamily: "inherit", flex: 1, transition: "all 0.15s",
        }}>
          {saving ? "⏳ Збереження..." : "Зберегти профіль"}
        </button>
      </div>

      {/* flow hint */}
      <div style={{
        fontSize: 10, color: C.muted, lineHeight: 1.7,
        borderTop: `1px solid ${C.border}`, paddingTop: 10,
      }}>
        <span style={{ color: C.teal }}>Флоу: </span>
        {"Form (валідація) → Dialog (підтвердження) → toast.success()"}
      </div>

      {/* Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setStep(1); }}
        onConfirm={handleSave}
        values={values}
      />

      {/* Toasts */}
      <Toast toasts={toast.toasts} />
    </div>
  );
}

// ── Code tab ──────────────────────────────────────────────────────────────────
function CodeTab() {
  const [section, setSection] = useState("form");
  const sections = [
    { id: "form",   label: "Form" },
    { id: "dialog", label: "Dialog" },
    { id: "toast",  label: "Toast" },
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
        {section === "form" && <>
          <CodeLine ln="1"><Cm c="// Form = shadcn + React Hook Form + Zod" /></CodeLine>
          <CodeLine ln="2"><Kw c="const" /><Tx c=" schema = " /><Fn c="z.object" /><Tx c="({" /></CodeLine>
          <CodeLine ln="3"><Tx c="  name:  " /><Fn c="z.string" /><Tx c="()." /><Fn c="min" /><Tx c="(2, " /><Str c="'Мінімум 2 символи'" /><Tx c=")," /></CodeLine>
          <CodeLine ln="4"><Tx c="  email: " /><Fn c="z.string" /><Tx c="()." /><Fn c="email" /><Tx c="(" /><Str c="'Невірний email'" /><Tx c=")," /></CodeLine>
          <CodeLine ln="5"><Tx c="})" /></CodeLine>
          <CodeLine ln="6"><Tx c="" /></CodeLine>
          <CodeLine ln="7" highlight><Kw c="const" /><Tx c=" form = " /><Fn c="useForm" /><Tx c="({" /></CodeLine>
          <CodeLine ln="8" highlight><Tx c="  resolver: " /><Fn c="zodResolver" /><Tx c="(schema)," /></CodeLine>
          <CodeLine ln="9"><Tx c="  defaultValues: { name: " /><Str c="''" /><Tx c=", email: " /><Str c="''" /><Tx c=" }" /></CodeLine>
          <CodeLine ln="10"><Tx c="})" /></CodeLine>
          <CodeLine ln="11"><Tx c="" /></CodeLine>
          <CodeLine ln="12"><Cm c="// типи і валідація — з однієї схеми ✅" /></CodeLine>
        </>}

        {section === "dialog" && <>
          <CodeLine ln="1"><Cm c="// Dialog відкривається після валідації" /></CodeLine>
          <CodeLine ln="2"><Kw c="const" /><Tx c=" onSubmit = (values) => {" /></CodeLine>
          <CodeLine ln="3" highlight><Tx c="  " /><Fn c="setDialogOpen" /><Tx c="(" /><Kw c="true" /><Tx c=")" /><Cm c="  // → крок 2" /></CodeLine>
          <CodeLine ln="4"><Tx c="}" /></CodeLine>
          <CodeLine ln="5"><Tx c="" /></CodeLine>
          <CodeLine ln="6"><Str c="<Dialog" /><Tx c={" open={open} "} /><Fn c="onOpenChange" /><Tx c={"={setOpen}>"} /></CodeLine>
          <CodeLine ln="7"><Tx c="  " /><Str c="<DialogContent>" /></CodeLine>
          <CodeLine ln="8" highlight><Tx c="    " /><Cm c="// focus trap + Escape — Radix бере на себе" /></CodeLine>
          <CodeLine ln="9"><Tx c="    " /><Str c="<DialogTitle>" /><Tx c="Зберегти?" /><Str c="</DialogTitle>" /></CodeLine>
          <CodeLine ln="10"><Tx c="    " /><Str c="<Button" /><Tx c=" " /><Fn c="onClick" /><Tx c={"={handleSave}>"} /><Tx c="Зберегти" /><Str c="</Button>" /></CodeLine>
          <CodeLine ln="11"><Tx c="  " /><Str c="</DialogContent>" /></CodeLine>
          <CodeLine ln="12"><Str c="</Dialog>" /></CodeLine>
        </>}

        {section === "toast" && <>
          <CodeLine ln="1"><Cm c="// Sonner — toast компонент в shadcn (2026)" /></CodeLine>
          <CodeLine ln="2"><Kw c="import" /><Tx c=" " /><Ty c="{ toast }" /><Tx c=" " /><Kw c="from" /><Str c=" 'sonner'" /></CodeLine>
          <CodeLine ln="3"><Tx c="" /></CodeLine>
          <CodeLine ln="4"><Cm c="// у layout — один раз:" /></CodeLine>
          <CodeLine ln="5"><Str c="<Toaster" /><Tx c={" position="} /><Str c="'bottom-right'" /><Str c=" />" /></CodeLine>
          <CodeLine ln="6"><Tx c="" /></CodeLine>
          <CodeLine ln="7" highlight><Cm c="// після збереження:" /></CodeLine>
          <CodeLine ln="8" highlight><Tx c="toast." /><Fn c="success" /><Tx c="(" /><Str c="'Профіль оновлено!'" /><Tx c=", {" /></CodeLine>
          <CodeLine ln="9" highlight><Tx c="  description: " /><Str c="'Зміни збережено'" /></CodeLine>
          <CodeLine ln="10" highlight><Tx c="})" /></CodeLine>
          <CodeLine ln="11"><Tx c="" /></CodeLine>
          <CodeLine ln="12"><Cm c="// або якщо помилка:" /></CodeLine>
          <CodeLine ln="13"><Tx c="toast." /><Fn c="error" /><Tx c="(" /><Str c="'Щось пішло не так'" /><Tx c=")" /></CodeLine>
        </>}
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("demo");

  const tabs = [
    { id: "demo", label: "Live Demo", color: C.teal },
    { id: "code", label: "Код",       color: C.purple },
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
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        input:focus, textarea:focus {
          border-color: #7dcfff55 !important;
          outline: none;
        }
      `}</style>

      <div style={{ width: "100%", maxWidth: 560 }}>

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
            <span style={{ color: C.muted, fontSize: 11 }}>profile-form.tsx</span>
            <span style={{ background: C.teal + "22", color: C.teal, fontSize: 9, padding: "1px 7px", borderRadius: 99 }}>
              Modern UI #5
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
          {tab === "demo" && <DemoTab />}
          {tab === "code" && <CodeTab />}
        </div>

        {/* hint */}
        <div style={{
          marginTop: 10, background: C.teal + "12",
          border: `1px solid ${C.teal}33`, borderRadius: 8,
          padding: "8px 14px", fontSize: 11, color: C.teal, textAlign: "center",
        }}>
          {"💡 Form → Dialog → Toast — три кроки, три компоненти, один флоу"}
        </div>

      </div>
    </div>
  );
}
