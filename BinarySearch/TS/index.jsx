import { useState, useRef } from "react";

const C = {
  bg: "#0a0d14", surface: "#1a1b2e", surface2: "#16213e",
  border: "#2a2c4a",
  accent: "#7dcfff", purple: "#bb9af7", green: "#9ece6a",
  orange: "#ff9e64", yellow: "#e0af68", teal: "#1abc9c",
  muted: "#565f89", text: "#c0caf5",
  red: "#ff5f57",
};

const Kw = ({ c }) => <span style={{ color: C.purple }}>{c}</span>;
const Fn = ({ c }) => <span style={{ color: C.accent }}>{c}</span>;
const Str = ({ c }) => <span style={{ color: C.green }}>{c}</span>;
const Cm = ({ c }) => <span style={{ color: C.muted, fontStyle: "italic" }}>{c}</span>;
const Tx = ({ c }) => <span style={{ color: C.text }}>{c}</span>;
const Ty = ({ c }) => <span style={{ color: C.yellow }}>{c}</span>;
const Gn = ({ c }) => <span style={{ color: C.teal, fontWeight: 700 }}>{c}</span>;
const Num = ({ c }) => <span style={{ color: C.orange }}>{c}</span>;

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

// ── Binary Search implementation ──────────────────────────────────
function binarySearch(arr, target, compare) {
  const steps = [];
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const result = compare(arr[mid], target);
    steps.push({ lo, hi, mid, result, arr: [...arr] });
    if (result === 0) return { index: mid, steps };
    if (result < 0) lo = mid + 1;
    else hi = mid - 1;
  }
  return { index: -1, steps };
}

// ═══════════════════════════════════════════════════════════════════
// TAB 1 — Visualizer
// ═══════════════════════════════════════════════════════════════════
const PRESETS = [
  { label: "Числа", arr: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19], type: "number", compare: (a, b) => a - b },
  { label: "Рядки", arr: ["apple", "banana", "cherry", "date", "elderberry", "fig", "grape"], type: "string", compare: (a, b) => a.localeCompare(b) },
  { label: "Об'єкти", arr: [{ id: 1 }, { id: 3 }, { id: 7 }, { id: 12 }, { id: 18 }, { id: 24 }, { id: 31 }], type: "object", compare: (a, b) => a.id - b.id },
];

function TabVisualizer() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [targetInput, setTargetInput] = useState("7");
  const [searchResult, setSearchResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  const preset = PRESETS[presetIdx];

  const getTarget = () => {
    if (preset.type === "number") return Number(targetInput);
    if (preset.type === "string") return targetInput;
    return { id: Number(targetInput) };
  };

  const getLabel = (item) => {
    if (preset.type === "object") return `{id:${item.id}}`;
    return String(item);
  };

  const runSearch = () => {
    const target = getTarget();
    const result = binarySearch(preset.arr, target, preset.compare);
    setSearchResult(result);
    setCurrentStep(0);
    setIsPlaying(false);
    clearInterval(intervalRef.current);
  };

  const play = () => {
    if (!searchResult) return;
    setIsPlaying(true);
    setCurrentStep(0);
    let step = 0;
    intervalRef.current = setInterval(() => {
      step++;
      if (step >= searchResult.steps.length) {
        clearInterval(intervalRef.current);
        setIsPlaying(false);
        setCurrentStep(searchResult.steps.length - 1);
      } else {
        setCurrentStep(step);
      }
    }, 900);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    setIsPlaying(false);
  };

  const step = searchResult?.steps[currentStep];
  const totalSteps = searchResult?.steps.length || 0;
  const found = searchResult?.index !== -1;

  const getCellColor = (i) => {
    if (!step) return C.surface2;
    if (i === step.mid) return found && currentStep === totalSteps - 1 ? C.green + "33" : C.accent + "33";
    if (i < step.lo || i > step.hi) return C.surface2;
    return C.purple + "15";
  };

  const getCellBorder = (i) => {
    if (!step) return C.border;
    if (i === step.mid) return found && currentStep === totalSteps - 1 ? C.green : C.accent;
    if (i < step.lo || i > step.hi) return C.border;
    return C.purple + "44";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* type selector */}
      <div style={{ display: "flex", gap: 6 }}>
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => { setPresetIdx(i); setSearchResult(null); setTargetInput(i === 0 ? "7" : i === 1 ? "date" : "12"); }} style={{
            flex: 1, padding: "7px 4px",
            background: presetIdx === i ? C.teal + "22" : C.surface2,
            border: `1px solid ${presetIdx === i ? C.teal : C.border}`,
            borderRadius: 8, color: presetIdx === i ? C.teal : C.muted,
            fontSize: 11, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
          }}>{p.label}</button>
        ))}
      </div>

      {/* array display */}
      <div>
        <div style={{ color: C.muted, fontSize: 10, marginBottom: 8 }}>
          // відсортований масив — {preset.arr.length} елементів
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {preset.arr.map((item, i) => (
            <div key={i} style={{
              background: getCellColor(i),
              border: `1px solid ${getCellBorder(i)}`,
              borderRadius: 7, padding: "6px 8px", minWidth: 36, textAlign: "center",
              transition: "all 0.3s", position: "relative",
            }}>
              <div style={{ color: C.text, fontSize: 10, fontFamily: "'JetBrains Mono','Fira Code',monospace" }}>{getLabel(item)}</div>
              <div style={{ color: C.muted, fontSize: 8 }}>[{i}]</div>
              {step && i === step.mid && (
                <div style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", color: C.accent, fontSize: 10 }}>mid</div>
              )}
              {step && i === step.lo && i !== step.mid && (
                <div style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", color: C.purple, fontSize: 9 }}>lo</div>
              )}
              {step && i === step.hi && i !== step.mid && (
                <div style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", color: C.purple, fontSize: 9 }}>hi</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* search controls */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: C.muted, fontSize: 10, marginBottom: 4 }}>
            target ({preset.type === "object" ? "id" : preset.type})
          </div>
          <input value={targetInput} onChange={e => { setTargetInput(e.target.value); setSearchResult(null); }}
            style={{ width: "100%", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
        </div>
        <button onClick={runSearch} style={{
          marginTop: 18, padding: "8px 16px", background: C.teal, border: "none",
          borderRadius: 8, color: C.bg, fontSize: 12, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit",
        }}>Пошук</button>
      </div>

      {/* step info */}
      {searchResult && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* progress */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ flex: 1, background: C.surface2, borderRadius: 99, height: 4 }}>
              <div style={{ height: "100%", borderRadius: 99, background: C.teal, width: `${((currentStep + 1) / totalSteps) * 100}%`, transition: "width 0.3s" }} />
            </div>
            <span style={{ color: C.muted, fontSize: 10 }}>крок {currentStep + 1}/{totalSteps}</span>
          </div>

          {/* step detail */}
          {step && (
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: 11 }}>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <span><span style={{ color: C.muted }}>lo: </span><span style={{ color: C.purple }}>{step.lo}</span></span>
                <span><span style={{ color: C.muted }}>hi: </span><span style={{ color: C.purple }}>{step.hi}</span></span>
                <span><span style={{ color: C.muted }}>mid: </span><span style={{ color: C.accent }}>{step.mid}</span></span>
                <span><span style={{ color: C.muted }}>arr[mid]: </span><span style={{ color: C.yellow }}>{getLabel(preset.arr[step.mid])}</span></span>
                <span><span style={{ color: C.muted }}>result: </span><span style={{ color: step.result === 0 ? C.green : step.result < 0 ? C.orange : C.red }}>{step.result < 0 ? "< 0 → шукаємо праворуч" : step.result > 0 ? "> 0 → шукаємо ліворуч" : "= 0 → знайдено!"}</span></span>
              </div>
            </div>
          )}

          {/* result */}
          <div style={{
            background: found ? C.green + "12" : C.red + "12",
            border: `1px solid ${found ? C.green : C.red}44`,
            borderRadius: 8, padding: "10px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ color: found ? C.green : C.red, fontSize: 12 }}>
              {found ? `✓ знайдено на індексі [${searchResult.index}]` : "✗ не знайдено → повертає -1"}
            </span>
            <span style={{ color: C.muted, fontSize: 10 }}>{totalSteps} кроків замість {preset.arr.length}</span>
          </div>

          {/* step controls */}
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setCurrentStep(s => Math.max(0, s - 1))} disabled={currentStep === 0 || isPlaying} style={{
              flex: 1, padding: "7px 0", background: C.surface2, border: `1px solid ${C.border}`,
              borderRadius: 7, color: C.muted, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
            }}>← Назад</button>
            <button onClick={isPlaying ? stop : play} style={{
              flex: 2, padding: "7px 0",
              background: isPlaying ? C.orange + "22" : C.teal + "22",
              border: `1px solid ${isPlaying ? C.orange : C.teal}`,
              borderRadius: 7, color: isPlaying ? C.orange : C.teal,
              fontSize: 12, cursor: "pointer", fontFamily: "inherit",
            }}>{isPlaying ? "⏸ Стоп" : "▶ Анімація"}</button>
            <button onClick={() => setCurrentStep(s => Math.min(totalSteps - 1, s + 1))} disabled={currentStep === totalSteps - 1 || isPlaying} style={{
              flex: 1, padding: "7px 0", background: C.surface2, border: `1px solid ${C.border}`,
              borderRadius: 7, color: C.muted, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
            }}>Вперед →</button>
          </div>
        </div>
      )}

      {!searchResult && (
        <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "16px", textAlign: "center", color: C.muted, fontSize: 11 }}>
          Введи target і натисни "Пошук"
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2 — Code
// ═══════════════════════════════════════════════════════════════════
function TabCode() {
  const [mode, setMode] = useState("generic");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {[["without", "без Generic ❌", C.red], ["generic", "з Generic ✅", C.teal]].map(([id, label, color]) => (
          <button key={id} onClick={() => setMode(id)} style={{
            flex: 1, padding: "7px 0",
            background: mode === id ? color + "22" : C.surface2,
            border: `1px solid ${mode === id ? color : C.border}`,
            borderRadius: 8, color: mode === id ? color : C.muted,
            fontSize: 11, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
          }}>{label}</button>
        ))}
      </div>

      {mode === "without" ? (
        <div style={{ background: C.bg, border: `1px solid ${C.red}44`, borderRadius: 8, padding: "12px 14px" }}>
          <CodeLine ln="1"><Cm c="// окрема функція для кожного типу" /></CodeLine>
          <CodeLine ln="2"><Kw c="function" /> <Fn c="searchNumber" />(<Tx c="arr: " /><Ty c="number" /><Tx c="[], t: " /><Ty c="number" />): <Ty c="number" /> {"{"}</CodeLine>
          <CodeLine ln="3"><Tx c="  " /><Kw c="let" /><Tx c=" lo = 0, hi = arr.length - 1;" /></CodeLine>
          <CodeLine ln="4"><Tx c="  " /><Kw c="while" /><Tx c=" (lo <= hi) { ... }" /></CodeLine>
          <CodeLine ln="5"><Tx c="}" /></CodeLine>
          <CodeLine ln="6"><Tx c="" /></CodeLine>
          <CodeLine ln="7"><Cm c="// і ще одна для рядків..." /></CodeLine>
          <CodeLine ln="8"><Kw c="function" /> <Fn c="searchString" />(<Tx c="arr: " /><Ty c="string" /><Tx c="[], t: " /><Ty c="string" />): <Ty c="number" /> {"{"}</CodeLine>
          <CodeLine ln="9"><Tx c="  " /><Cm c="// та сама логіка 😤" /></CodeLine>
          <CodeLine ln="10"><Tx c="}" /></CodeLine>
          <CodeLine ln="11"><Tx c="" /></CodeLine>
          <CodeLine ln="12"><Cm c="// і ще одна для User[], Product[]..." /></CodeLine>
        </div>
      ) : (
        <div style={{ background: C.bg, border: `1px solid ${C.teal}44`, borderRadius: 8, padding: "12px 14px" }}>
          <CodeLine ln="1"><Cm c="// один раз для будь-якого типу" /></CodeLine>
          <CodeLine ln="2"><Kw c="type" /> <Ty c="CompareFn" /><Gn c="<T>" /> = (<Tx c="a: " /><Gn c="T" /><Tx c=", b: " /><Gn c="T" />) {"=>"} <Ty c="number" />;</CodeLine>
          <CodeLine ln="3"><Tx c="" /></CodeLine>
          <CodeLine ln="4" highlight><Kw c="function" /> <Fn c="binarySearch" /><Gn c="<T>" />(</CodeLine>
          <CodeLine ln="5" highlight><Tx c="  arr: " /><Gn c="T" /><Tx c="[]," /></CodeLine>
          <CodeLine ln="6" highlight><Tx c="  target: " /><Gn c="T" /><Tx c="," /></CodeLine>
          <CodeLine ln="7" highlight><Tx c="  compare: " /><Ty c="CompareFn" /><Gn c="<T>" /></CodeLine>
          <CodeLine ln="8"><Tx c="): " /><Ty c="number" /> {"{"}</CodeLine>
          <CodeLine ln="9"><Tx c="  " /><Kw c="let" /><Tx c=" lo = 0, hi = arr.length - 1;" /></CodeLine>
          <CodeLine ln="10"><Tx c="  " /><Kw c="while" /><Tx c=" (lo <= hi) {" /></CodeLine>
          <CodeLine ln="11"><Tx c="    " /><Kw c="const" /><Tx c=" mid = " /><Ty c="Math" />.<Fn c="floor" /><Tx c="((lo + hi) / 2);" /></CodeLine>
          <CodeLine ln="12"><Tx c="    " /><Kw c="const" /><Tx c=" res = " /><Fn c="compare" /><Tx c="(arr[mid], target);" /></CodeLine>
          <CodeLine ln="13"><Tx c="    " /><Kw c="if" /><Tx c=" (res === 0) " /><Kw c="return" /><Tx c=" mid;" /></CodeLine>
          <CodeLine ln="14"><Tx c="    res < 0 ? lo = mid + 1 : hi = mid - 1;" /></CodeLine>
          <CodeLine ln="15"><Tx c="  }" /></CodeLine>
          <CodeLine ln="16"><Tx c="  " /><Kw c="return" /><Tx c=" -1;" /></CodeLine>
          <CodeLine ln="17"><Tx c="}" /></CodeLine>
        </div>
      )}

      {/* usage examples */}
      {mode === "generic" && (
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
          <CodeLine ln="1"><Cm c="// числа" /></CodeLine>
          <CodeLine ln="2"><Fn c="binarySearch" /><Tx c="([1,3,5,7], " /><Num c="7" /><Tx c=", (a,b) => a - b);" /></CodeLine>
          <CodeLine ln="3"><Tx c="" /></CodeLine>
          <CodeLine ln="4"><Cm c="// рядки" /></CodeLine>
          <CodeLine ln="5"><Fn c="binarySearch" /><Tx c="([" /><Str c="'a'" /><Tx c="," /><Str c="'b'" /><Tx c="," /><Str c="'c'" /><Tx c="], " /><Str c="'b'" /><Tx c="," /></CodeLine>
          <CodeLine ln="6"><Tx c="  (a,b) => a." /><Fn c="localeCompare" /><Tx c="(b));" /></CodeLine>
          <CodeLine ln="7"><Tx c="" /></CodeLine>
          <CodeLine ln="8"><Cm c="// об'єкти — порівнюємо по полю id" /></CodeLine>
          <CodeLine ln="9"><Fn c="binarySearch" /><Tx c="(users, { id: " /><Num c="42" /><Tx c=" }," /></CodeLine>
          <CodeLine ln="10"><Tx c="  (a,b) => a.id - b.id);" /></CodeLine>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3 — TS Type spotlight
// ═══════════════════════════════════════════════════════════════════
function TabType() {
  const [example, setExample] = useState("comparefn");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: C.teal + "12", border: `1px solid ${C.teal}33`, borderRadius: 8, padding: "10px 14px" }}>
        <div style={{ color: C.teal, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>🔍 Новий TS тип цього посту</div>
        <div style={{ color: C.muted, fontSize: 11 }}>Generic функції та CompareFn{"<T>"} — паттерн який використовує сам JavaScript в Array.sort()</div>
      </div>

      {/* selector */}
      <div style={{ display: "flex", gap: 6 }}>
        {[
          ["comparefn", "CompareFn<T>", C.teal],
          ["generic",   "Generic <T>", C.accent],
          ["infer",     "Type Inference", C.purple],
        ].map(([id, label, color]) => (
          <button key={id} onClick={() => setExample(id)} style={{
            flex: 1, padding: "6px 4px",
            background: example === id ? color + "22" : C.surface2,
            border: `1px solid ${example === id ? color : C.border}`,
            borderRadius: 7, color: example === id ? color : C.muted,
            fontSize: 10, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
          }}>{label}</button>
        ))}
      </div>

      {example === "comparefn" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: C.bg, border: `1px solid ${C.teal}44`, borderRadius: 8, padding: "12px 14px" }}>
            <CodeLine ln="1"><Kw c="type" /> <Ty c="CompareFn" /><Gn c="<T>" /> = (<Tx c="a: " /><Gn c="T" /><Tx c=", b: " /><Gn c="T" />) {"=>"} <Ty c="number" />;</CodeLine>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { result: "< 0", desc: "a стоїть перед b", color: C.green, example: "a - b коли a < b" },
              { result: "= 0", desc: "a і b рівні", color: C.yellow, example: "a === b" },
              { result: "> 0", desc: "a стоїть після b", color: C.red, example: "a - b коли a > b" },
            ].map((r, i) => (
              <div key={i} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ color: r.color, fontSize: 12, fontFamily: "'JetBrains Mono','Fira Code',monospace", minWidth: 40, fontWeight: 700 }}>{r.result}</span>
                <span style={{ color: C.text, fontSize: 11, flex: 1 }}>{r.desc}</span>
                <span style={{ color: C.muted, fontSize: 10 }}>{r.example}</span>
              </div>
            ))}
          </div>
          <div style={{ background: C.teal + "10", border: `1px solid ${C.teal}33`, borderRadius: 8, padding: "10px 14px", fontSize: 11, color: C.muted }}>
            Саме цей контракт використовує <span style={{ color: C.teal }}>Array.sort(compareFn)</span> — ти вже знав цей паттерн, просто не знав його назви в TypeScript.
          </div>
        </div>
      )}

      {example === "generic" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: C.bg, border: `1px solid ${C.accent}44`, borderRadius: 8, padding: "12px 14px" }}>
            <CodeLine ln="1"><Cm c="// T — параметр типу, як параметр функції" /></CodeLine>
            <CodeLine ln="2"><Kw c="function" /> <Fn c="identity" /><Gn c="<T>" />(<Tx c="value: " /><Gn c="T" />): <Gn c="T" /> {"{"}</CodeLine>
            <CodeLine ln="3"><Tx c="  " /><Kw c="return" /><Tx c=" value;" /></CodeLine>
            <CodeLine ln="4"><Tx c="}" /></CodeLine>
            <CodeLine ln="5"><Tx c="" /></CodeLine>
            <CodeLine ln="6"><Cm c="// TS виводить T автоматично" /></CodeLine>
            <CodeLine ln="7"><Fn c="identity" /><Tx c="(42)    " /><Cm c="// T = number" /></CodeLine>
            <CodeLine ln="8"><Fn c="identity" /><Tx c="('hello') " /><Cm c="// T = string" /></CodeLine>
            <CodeLine ln="9"><Fn c="identity" /><Tx c="([1,2,3]) " /><Cm c="// T = number[]" /></CodeLine>
          </div>
          <div style={{ background: C.accent + "10", border: `1px solid ${C.accent}33`, borderRadius: 8, padding: "10px 14px", fontSize: 11, color: C.muted }}>
            <span style={{ color: C.accent }}>{"<T>"}</span> — це як змінна але для типу. TS підставляє реальний тип при кожному виклику автоматично.
          </div>
        </div>
      )}

      {example === "infer" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: C.bg, border: `1px solid ${C.purple}44`, borderRadius: 8, padding: "12px 14px" }}>
            <CodeLine ln="1"><Cm c="// явна вказівка типу" /></CodeLine>
            <CodeLine ln="2"><Fn c="binarySearch" /><Gn c="<number>" /><Tx c="([1,3,5], 3, (a,b) => a-b);" /></CodeLine>
            <CodeLine ln="3"><Tx c="" /></CodeLine>
            <CodeLine ln="4"><Cm c="// або TS виводить T сам — зручніше" /></CodeLine>
            <CodeLine ln="5"><Fn c="binarySearch" /><Tx c="([1,3,5], 3, (a,b) => a-b);" /></CodeLine>
            <CodeLine ln="6"><Cm c="//           ↑ arr: number[] → T = number" /></CodeLine>
            <CodeLine ln="7"><Tx c="" /></CodeLine>
            <CodeLine ln="8"><Cm c="// помилка якщо типи не збігаються" /></CodeLine>
            <CodeLine ln="9"><Fn c="binarySearch" /><Tx c="([1,3,5], " /><Str c="'hello'" /><Tx c=", (a,b) => a-b);" /></CodeLine>
            <CodeLine ln="10"><Cm c="// ❌ Argument of type 'string' is not assignable to 'number'" /></CodeLine>
          </div>
          <div style={{ background: C.purple + "10", border: `1px solid ${C.purple}33`, borderRadius: 8, padding: "10px 14px", fontSize: 11, color: C.muted }}>
            Type inference — TS сам розуміє що <span style={{ color: C.purple }}>T = number</span> з першого аргументу. Якщо передати рядок туди де очікується число — помилка одразу.
          </div>
        </div>
      )}

      {/* complexity */}
      <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
        <div style={{ color: C.muted, fontSize: 10, marginBottom: 8 }}>// складність Binary Search</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { label: "Time", value: "O(log n)", color: C.green },
            { label: "Space", value: "O(1)", color: C.teal },
            { label: "Вимога", value: "Sorted", color: C.yellow },
          ].map((m, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ color: C.muted, fontSize: 9, marginBottom: 4 }}>{m.label}</div>
              <div style={{ color: m.color, fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono','Fira Code',monospace" }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// App
// ═══════════════════════════════════════════════════════════════════
const tabs = [
  { id: "viz",  label: "Візуалізація", color: C.accent },
  { id: "code", label: "Код",          color: C.teal   },
  { id: "type", label: "TS Тип",       color: C.purple },
];

export default function BinarySearchDemo() {
  const [active, setActive] = useState("viz");

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 16px", fontFamily: "'JetBrains Mono','Fira Code',monospace",
      boxSizing: "border-box",
    }}>
      <div style={{ width: "100%", maxWidth: 640 }}>

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
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: C.muted, fontSize: 11 }}>binarySearch.ts</span>
            <span style={{ background: C.teal + "22", color: C.teal, fontSize: 9, padding: "1px 7px", borderRadius: 99 }}>Алго + TS #1</span>
          </div>
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
          {active === "viz"  && <TabVisualizer />}
          {active === "code" && <TabCode />}
          {active === "type" && <TabType />}
        </div>

        {/* hint */}
        <div style={{
          marginTop: 10, background: C.teal + "12",
          border: `1px solid ${C.teal}33`, borderRadius: 8,
          padding: "8px 14px", fontSize: 11, color: C.teal, textAlign: "center",
        }}>
          💡 O(log n) — мільйон елементів = 20 кроків замість 1,000,000
        </div>

      </div>
    </div>
  );
}
