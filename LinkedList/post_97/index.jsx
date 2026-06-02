import { useState } from "react";

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

// ── LinkedList implementation ─────────────────────────────────────
class LinkedListImpl {
  constructor() { this.head = null; this._size = 0; }

  prepend(value) {
    this.head = { value, next: this.head };
    this._size++;
  }

  append(value) {
    const node = { value, next: null };
    if (!this.head) { this.head = node; this._size++; return; }
    let curr = this.head;
    while (curr.next) curr = curr.next;
    curr.next = node;
    this._size++;
  }

  delete(value) {
    if (!this.head) return false;
    if (this.head.value === value) { this.head = this.head.next; this._size--; return true; }
    let curr = this.head;
    while (curr.next) {
      if (curr.next.value === value) { curr.next = curr.next.next; this._size--; return true; }
      curr = curr.next;
    }
    return false;
  }

  toArray() {
    const arr = [];
    let curr = this.head;
    while (curr) { arr.push(curr.value); curr = curr.next; }
    return arr;
  }

  get size() { return this._size; }
}

// ═══════════════════════════════════════════════════════════════════
// TAB 1 — Visualizer
// ═══════════════════════════════════════════════════════════════════
function TabVisualizer() {
  const [list] = useState(() => new LinkedListImpl());
  const [nodes, setNodes] = useState([]);
  const [input, setInput] = useState("");
  const [log, setLog] = useState([]);
  const [highlighted, setHighlighted] = useState(null);
  const [searchVal, setSearchVal] = useState("");
  const [searchPath, setSearchPath] = useState([]);
  const [found, setFound] = useState(null);

  const refresh = () => setNodes(list.toArray());
  const addLog = (msg, color, complexity) =>
    setLog(p => [...p.slice(-5), { msg, color, complexity }]);

  const prepend = () => {
    if (!input.trim()) return;
    list.prepend(input.trim());
    addLog(`prepend("${input.trim()}")`, C.green, "O(1)");
    setHighlighted(0);
    setInput(""); refresh();
    setTimeout(() => setHighlighted(null), 700);
  };

  const append = () => {
    if (!input.trim()) return;
    list.append(input.trim());
    addLog(`append("${input.trim()}")`, C.accent, "O(n)");
    setHighlighted(list.size - 1);
    setInput(""); refresh();
    setTimeout(() => setHighlighted(null), 700);
  };

  const deleteNode = () => {
    if (!input.trim()) return;
    const ok = list.delete(input.trim());
    addLog(`delete("${input.trim()}")`, ok ? C.orange : C.red, ok ? "O(n)" : "не знайдено");
    setInput(""); refresh();
  };

  const search = () => {
    if (!searchVal.trim()) return;
    const arr = list.toArray();
    const path = [];
    let idx = -1;
    for (let i = 0; i < arr.length; i++) {
      path.push(i);
      if (arr[i] === searchVal.trim()) { idx = i; break; }
    }
    setSearchPath(path);
    setFound(idx);
    addLog(`search("${searchVal.trim()}")`, idx >= 0 ? C.green : C.red, `O(n) — ${path.length} кроків`);
    setTimeout(() => { setSearchPath([]); setFound(null); }, 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* stats */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { label: "size", value: nodes.length, color: C.accent },
          { label: "head", value: nodes[0] ?? "null", color: C.green },
          { label: "tail", value: nodes[nodes.length - 1] ?? "null", color: C.purple },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
            <div style={{ color: C.muted, fontSize: 9, marginBottom: 3 }}>{s.label}</div>
            <div style={{ color: s.color, fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono','Fira Code',monospace" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* linked list visual */}
      <div style={{ overflowX: "auto", paddingBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: "max-content", padding: "8px 4px" }}>
          {/* head pointer */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ color: C.green, fontSize: 9 }}>head</span>
            <span style={{ color: C.green, fontSize: 14 }}>↓</span>
          </div>

          {nodes.length === 0 && (
            <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 18px", color: C.muted, fontSize: 11 }}>null</div>
          )}

          {nodes.map((node, i) => {
            const isHighlighted = highlighted === i;
            const isSearched = searchPath.includes(i);
            const isFound = found === i;
            let bg = C.surface2;
            let border = C.border;
            if (isFound) { bg = C.green + "22"; border = C.green; }
            else if (isSearched) { bg = C.accent + "15"; border = C.accent; }
            else if (isHighlighted) { bg = C.teal + "22"; border = C.teal; }

            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {/* node box */}
                <div style={{
                  background: bg, border: `1px solid ${border}`,
                  borderRadius: 8, overflow: "hidden",
                  display: "flex", transition: "all 0.25s",
                }}>
                  {/* value cell */}
                  <div style={{ padding: "8px 12px", borderRight: `1px solid ${border}`, minWidth: 44, textAlign: "center" }}>
                    <div style={{ color: isFound ? C.green : isHighlighted ? C.teal : C.text, fontSize: 12, fontFamily: "'JetBrains Mono','Fira Code',monospace", fontWeight: 700 }}>{node}</div>
                    <div style={{ color: C.muted, fontSize: 8 }}>val</div>
                  </div>
                  {/* next pointer cell */}
                  <div style={{ padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ color: i < nodes.length - 1 ? C.accent : C.orange, fontSize: 10 }}>
                      {i < nodes.length - 1 ? "→" : "∅"}
                    </div>
                    <div style={{ color: C.muted, fontSize: 8 }}>next</div>
                  </div>
                </div>

                {/* arrow between nodes */}
                {i < nodes.length - 1 && (
                  <span style={{ color: C.accent, fontSize: 16, flexShrink: 0 }}>→</span>
                )}
              </div>
            );
          })}

          {nodes.length > 0 && (
            <span style={{ color: C.orange, fontSize: 11, marginLeft: 4 }}>null</span>
          )}
        </div>
      </div>

      {/* controls */}
      <div style={{ display: "flex", gap: 6 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && append()}
          placeholder="значення..."
          style={{ flex: 1, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", outline: "none" }} />
        <button onClick={prepend} style={{ padding: "7px 10px", background: C.green + "22", border: `1px solid ${C.green}44`, borderRadius: 7, color: C.green, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>prepend</button>
        <button onClick={append} style={{ padding: "7px 10px", background: C.accent + "22", border: `1px solid ${C.accent}44`, borderRadius: 7, color: C.accent, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>append</button>
        <button onClick={deleteNode} style={{ padding: "7px 10px", background: C.orange + "22", border: `1px solid ${C.orange}44`, borderRadius: 7, color: C.orange, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>delete</button>
      </div>

      {/* search */}
      <div style={{ display: "flex", gap: 6 }}>
        <input value={searchVal} onChange={e => setSearchVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          placeholder="пошук..."
          style={{ flex: 1, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", outline: "none" }} />
        <button onClick={search} style={{ padding: "7px 14px", background: C.purple + "22", border: `1px solid ${C.purple}44`, borderRadius: 7, color: C.purple, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>search O(n)</button>
      </div>

      {/* log */}
      {log.length > 0 && (
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px" }}>
          <div style={{ color: C.muted, fontSize: 10, marginBottom: 6 }}>// operation log</div>
          {log.map((l, i) => (
            <div key={i} style={{ fontSize: 10, lineHeight: 1.9, display: "flex", gap: 8 }}>
              <span style={{ color: l.color, fontFamily: "'JetBrains Mono','Fira Code',monospace" }}>{l.msg}</span>
              <span style={{ color: C.muted }}>— {l.complexity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2 — Code
// ═══════════════════════════════════════════════════════════════════
function TabCode() {
  const [section, setSection] = useState("node");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {[
          ["node",    "Node<T>",  C.teal  ],
          ["prepend", "prepend",  C.green ],
          ["append",  "append",   C.accent],
          ["delete",  "delete",   C.orange],
        ].map(([id, label, color]) => (
          <button key={id} onClick={() => setSection(id)} style={{
            flex: 1, padding: "6px 4px",
            background: section === id ? color + "22" : C.surface2,
            border: `1px solid ${section === id ? color : C.border}`,
            borderRadius: 7, color: section === id ? color : C.muted,
            fontSize: 10, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
          }}>{label}</button>
        ))}
      </div>

      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
        {section === "node" && (<>
          <CodeLine ln="1"><Cm c="// рекурсивний тип — посилається сам на себе" /></CodeLine>
          <CodeLine ln="2"><Kw c="interface" /><Ty c=" Node" /><Gn c="<T>" /><Tx c=" {" /></CodeLine>
          <CodeLine ln="3"><Tx c="  value: " /><Gn c="T" /><Tx c=";" /></CodeLine>
          <CodeLine ln="4" highlight><Tx c="  next: " /><Ty c="Node" /><Gn c="<T>" /><Tx c=" | " /><Ty c="null" /><Tx c="; " /><Cm c="// ← рекурсія!" /></CodeLine>
          <CodeLine ln="5"><Tx c="}" /></CodeLine>
          <CodeLine ln="6"><Tx c="" /></CodeLine>
          <CodeLine ln="7"><Kw c="interface" /><Ty c=" LinkedList" /><Gn c="<T>" /><Tx c=" {" /></CodeLine>
          <CodeLine ln="8"><Tx c="  head: " /><Ty c="Node" /><Gn c="<T>" /><Tx c=" | " /><Ty c="null" /><Tx c=";" /></CodeLine>
          <CodeLine ln="9"><Tx c="  size: " /><Ty c="number" /><Tx c=";" /></CodeLine>
          <CodeLine ln="10"><Tx c="}" /></CodeLine>
          <CodeLine ln="11"><Tx c="" /></CodeLine>
          <CodeLine ln="12"><Cm c="// використання" /></CodeLine>
          <CodeLine ln="13"><Kw c="const" /><Tx c=" node: " /><Ty c="Node" /><Gn c="<string>" /><Tx c=" = {" /></CodeLine>
          <CodeLine ln="14"><Tx c="  value: " /><Str c="'hello'" /><Tx c="," /></CodeLine>
          <CodeLine ln="15"><Tx c="  next: " /><Ty c="null" /><Tx c="," /></CodeLine>
          <CodeLine ln="16"><Tx c="};" /></CodeLine>
        </>)}

        {section === "prepend" && (<>
          <CodeLine ln="1"><Cm c="// O(1) — просто міняємо head" /></CodeLine>
          <CodeLine ln="2"><Fn c="prepend" /><Tx c="(value: " /><Gn c="T" /><Tx c="): " /><Ty c="void" /><Tx c=" {" /></CodeLine>
          <CodeLine ln="3"><Tx c="  " /><Kw c="const" /><Tx c=" node: " /><Ty c="Node" /><Gn c="<T>" /><Tx c=" = {" /></CodeLine>
          <CodeLine ln="4"><Tx c="    value," /></CodeLine>
          <CodeLine ln="5" highlight><Tx c="    next: " /><Kw c="this" /><Tx c=".head, " /><Cm c="// новий вказує на старий head" /></CodeLine>
          <CodeLine ln="6"><Tx c="  };" /></CodeLine>
          <CodeLine ln="7" highlight><Tx c="  " /><Kw c="this" /><Tx c=".head = node; " /><Cm c="// O(1) — без зміщення!" /></CodeLine>
          <CodeLine ln="8"><Tx c="}" /></CodeLine>
        </>)}

        {section === "append" && (<>
          <CodeLine ln="1"><Cm c="// O(n) — треба дійти до кінця" /></CodeLine>
          <CodeLine ln="2"><Fn c="append" /><Tx c="(value: " /><Gn c="T" /><Tx c="): " /><Ty c="void" /><Tx c=" {" /></CodeLine>
          <CodeLine ln="3"><Tx c="  " /><Kw c="const" /><Tx c=" node: " /><Ty c="Node" /><Gn c="<T>" /><Tx c=" = { value, next: " /><Ty c="null" /><Tx c=" };" /></CodeLine>
          <CodeLine ln="4"><Tx c="  " /><Kw c="if" /><Tx c=" (!" /><Kw c="this" /><Tx c=".head) {" /></CodeLine>
          <CodeLine ln="5"><Tx c="    " /><Kw c="this" /><Tx c=".head = node; " /><Kw c="return" /><Tx c=";" /></CodeLine>
          <CodeLine ln="6"><Tx c="  }" /></CodeLine>
          <CodeLine ln="7" highlight><Tx c="  " /><Kw c="let" /><Tx c=" curr = " /><Kw c="this" /><Tx c=".head;" /></CodeLine>
          <CodeLine ln="8" highlight><Tx c="  " /><Kw c="while" /><Tx c=" (curr.next) curr = curr.next; " /><Cm c="// O(n)" /></CodeLine>
          <CodeLine ln="9"><Tx c="  curr.next = node;" /></CodeLine>
          <CodeLine ln="10"><Tx c="}" /></CodeLine>
        </>)}

        {section === "delete" && (<>
          <CodeLine ln="1"><Cm c="// O(n) — шукаємо вузол" /></CodeLine>
          <CodeLine ln="2"><Fn c="delete" /><Tx c="(value: " /><Gn c="T" /><Tx c="): " /><Ty c="boolean" /><Tx c=" {" /></CodeLine>
          <CodeLine ln="3"><Tx c="  " /><Kw c="if" /><Tx c=" (!" /><Kw c="this" /><Tx c=".head) " /><Kw c="return" /><Ty c=" false" /><Tx c=";" /></CodeLine>
          <CodeLine ln="4" highlight><Tx c="  " /><Kw c="if" /><Tx c=" (" /><Kw c="this" /><Tx c=".head.value === value) {" /></CodeLine>
          <CodeLine ln="5" highlight><Tx c="    " /><Kw c="this" /><Tx c=".head = " /><Kw c="this" /><Tx c=".head.next; " /><Cm c="// O(1)!" /></CodeLine>
          <CodeLine ln="6"><Tx c="    " /><Kw c="return" /><Ty c=" true" /><Tx c=";" /></CodeLine>
          <CodeLine ln="7"><Tx c="  }" /></CodeLine>
          <CodeLine ln="8"><Tx c="  " /><Kw c="let" /><Tx c=" curr = " /><Kw c="this" /><Tx c=".head;" /></CodeLine>
          <CodeLine ln="9"><Tx c="  " /><Kw c="while" /><Tx c=" (curr.next) {" /></CodeLine>
          <CodeLine ln="10" highlight><Tx c="    " /><Kw c="if" /><Tx c=" (curr.next.value === value) {" /></CodeLine>
          <CodeLine ln="11" highlight><Tx c="      curr.next = curr.next.next; " /><Cm c="// перестрибуємо" /></CodeLine>
          <CodeLine ln="12"><Tx c="      " /><Kw c="return" /><Ty c=" true" /><Tx c=";" /></CodeLine>
          <CodeLine ln="13"><Tx c="    }" /></CodeLine>
          <CodeLine ln="14"><Tx c="    curr = curr.next;" /></CodeLine>
          <CodeLine ln="15"><Tx c="  }" /></CodeLine>
          <CodeLine ln="16"><Tx c="  " /><Kw c="return" /><Ty c=" false" /><Tx c=";" /></CodeLine>
          <CodeLine ln="17"><Tx c="}" /></CodeLine>
        </>)}
      </div>

      {/* complexity table */}
      <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
        <div style={{ color: C.muted, fontSize: 10, marginBottom: 8 }}>// порівняння з масивом</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
          {[
            ["Операція", "Array", "Linked List"],
            ["Доступ [i]", "O(1) ✓", "O(n) ✗"],
            ["Пошук", "O(n)", "O(n)"],
            ["Вставка head", "O(n) ✗", "O(1) ✓"],
            ["Вставка tail", "O(1)*", "O(n)"],
            ["Видалення head", "O(n) ✗", "O(1) ✓"],
          ].map((row, ri) => row.map((cell, ci) => (
            <div key={`${ri}-${ci}`} style={{
              padding: "6px 10px", fontSize: 10,
              background: ri === 0 ? C.surface2 : C.bg,
              borderBottom: `1px solid ${C.border}22`,
              color: cell.includes("✓") ? C.green : cell.includes("✗") ? C.red : ci === 0 ? C.muted : C.text,
              fontWeight: ri === 0 ? 700 : 400,
              fontFamily: "'JetBrains Mono','Fira Code',monospace",
            }}>{cell}</div>
          )))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3 — TS Type: Recursive types
// ═══════════════════════════════════════════════════════════════════
function TabType() {
  const [example, setExample] = useState("node");

  const examples = {
    node: {
      label: "Node<T> | null",
      color: C.teal,
      title: "Рекурсивний тип",
      desc: "Тип який містить поле того самого типу. TypeScript розуміє це і коректно виводить типи.",
      code: [
        [{ t: "// Node<T> посилається сам на себе" }],
        [{ t: "interface", c: C.purple }, { t: " Node" }, { t: "<T>", c: C.teal }, { t: " {" }],
        [{ t: "  value: " }, { t: "T", c: C.teal }, { t: ";" }],
        [{ t: "  next: " }, { t: "Node", c: C.yellow }, { t: "<T>", c: C.teal }, { t: " | " }, { t: "null", c: C.orange }, { t: "; // ← рекурсія", c: C.muted }],
        [{ t: "}" }],
        [{ t: "" }],
        [{ t: "// TS перевіряє глибину:" }],
        [{ t: "const", c: C.purple }, { t: " n: " }, { t: "Node", c: C.yellow }, { t: "<string>", c: C.teal }, { t: " = {" }],
        [{ t: "  value: " }, { t: "'a'", c: C.green }, { t: "," }],
        [{ t: "  next: { value: " }, { t: "'b'", c: C.green }, { t: ", next: " }, { t: "null", c: C.orange }, { t: " }" }],
        [{ t: "};" }],
      ],
    },
    json: {
      label: "JSON тип",
      color: C.accent,
      title: "Рекурсивний JSON",
      desc: "Реальний приклад рекурсивного типу — тип для JSON значення.",
      code: [
        [{ t: "// JSON може містити будь-яку вкладеність" }],
        [{ t: "type", c: C.purple }, { t: " JSONValue" }, { t: " =" }],
        [{ t: "  | " }, { t: "string", c: C.yellow }],
        [{ t: "  | " }, { t: "number", c: C.yellow }],
        [{ t: "  | " }, { t: "boolean", c: C.yellow }],
        [{ t: "  | " }, { t: "null", c: C.orange }],
        [{ t: "  | " }, { t: "JSONValue", c: C.accent }, { t: "[]       // масив JSON" }],
        [{ t: "  | { [key: " }, { t: "string", c: C.yellow }, { t: "]: " }, { t: "JSONValue", c: C.accent }, { t: " }; // об'єкт" }],
        [{ t: "" }],
        [{ t: "// TS перевіряє будь-яку глибину ✓", c: C.muted }],
      ],
    },
    tree: {
      label: "Tree Node",
      color: C.purple,
      title: "Бінарне дерево",
      desc: "Кожен вузол дерева має лівого і правого нащадка — той самий тип.",
      code: [
        [{ t: "// бінарне дерево — два рекурсивних поля" }],
        [{ t: "interface", c: C.purple }, { t: " TreeNode" }, { t: "<T>", c: C.teal }, { t: " {" }],
        [{ t: "  value: " }, { t: "T", c: C.teal }, { t: ";" }],
        [{ t: "  left:  " }, { t: "TreeNode", c: C.yellow }, { t: "<T>", c: C.teal }, { t: " | " }, { t: "null", c: C.orange }, { t: ";" }],
        [{ t: "  right: " }, { t: "TreeNode", c: C.yellow }, { t: "<T>", c: C.teal }, { t: " | " }, { t: "null", c: C.orange }, { t: ";" }],
        [{ t: "}" }],
        [{ t: "" }],
        [{ t: "// рекурсивна функція для обходу" }],
        [{ t: "function", c: C.purple }, { t: " traverse" }, { t: "<T>", c: C.teal }, { t: "(node: " }, { t: "TreeNode", c: C.yellow }, { t: "<T>", c: C.teal }, { t: " | " }, { t: "null", c: C.orange }, { t: ") {" }],
        [{ t: "  if (!node) " }, { t: "return", c: C.purple }, { t: ";" }],
        [{ t: "  traverse(node.left); traverse(node.right);" }],
        [{ t: "}" }],
      ],
    },
  };

  const ex = examples[example];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: C.teal + "12", border: `1px solid ${C.teal}33`, borderRadius: 8, padding: "10px 14px" }}>
        <div style={{ color: C.teal, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>🔍 Новий TS тип — Recursive types</div>
        <div style={{ color: C.muted, fontSize: 11 }}>Типи які посилаються на себе — патерн для дерев, списків, JSON і будь-яких вкладених структур</div>
      </div>

      {/* selector */}
      <div style={{ display: "flex", gap: 6 }}>
        {Object.entries(examples).map(([id, val]) => (
          <button key={id} onClick={() => setExample(id)} style={{
            flex: 1, padding: "6px 4px",
            background: example === id ? val.color + "22" : C.surface2,
            border: `1px solid ${example === id ? val.color : C.border}`,
            borderRadius: 7, color: example === id ? val.color : C.muted,
            fontSize: 10, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
          }}>{val.label}</button>
        ))}
      </div>

      {/* title + desc */}
      <div>
        <div style={{ color: ex.color, fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{ex.title}</div>
        <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.6 }}>{ex.desc}</div>
      </div>

      {/* code */}
      <div style={{ background: C.bg, border: `1px solid ${ex.color}44`, borderRadius: 8, padding: "12px 14px" }}>
        {ex.code.map((line, li) => (
          <div key={li} style={{ display: "flex", gap: 12, lineHeight: "1.85", minHeight: 19 }}>
            <span style={{ color: "#2a2c4a", minWidth: 20, textAlign: "right", fontSize: 10, userSelect: "none", flexShrink: 0 }}>{li + 1}</span>
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono','Fira Code',monospace", whiteSpace: "pre" }}>
              {line.length === 1 && line[0].t === "" ? <>&nbsp;</> : line.map((tok, ti) => (
                <span key={ti} style={{ color: tok.c || C.text }}>{tok.t}</span>
              ))}
            </span>
          </div>
        ))}
      </div>

      {/* null vs undefined */}
      <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
        <div style={{ color: C.muted, fontSize: 10, marginBottom: 8 }}>// Node{"<T>"} | null — чому null, а не undefined?</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={{ background: C.green + "10", border: `1px solid ${C.green}33`, borderRadius: 7, padding: "8px 10px" }}>
            <div style={{ color: C.green, fontSize: 10, fontWeight: 700, marginBottom: 4 }}>null ✓</div>
            {["явно означає відсутність", "навмисне 'немає вузла'", "більш виразний контракт"].map((t, i) => (
              <div key={i} style={{ color: C.muted, fontSize: 10, lineHeight: 1.7 }}>→ {t}</div>
            ))}
          </div>
          <div style={{ background: C.red + "10", border: `1px solid ${C.red}33`, borderRadius: 7, padding: "8px 10px" }}>
            <div style={{ color: C.red, fontSize: 10, fontWeight: 700, marginBottom: 4 }}>undefined ✗</div>
            {["означає 'не ініціалізовано'", "менш виразний намір", "може бути пропущено"].map((t, i) => (
              <div key={i} style={{ color: C.muted, fontSize: 10, lineHeight: 1.7 }}>→ {t}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// App
// ═══════════════════════════════════════════════════════════════════
const TABS = [
  { id: "viz",  label: "Візуалізація", color: C.accent },
  { id: "code", label: "Код",          color: C.teal   },
  { id: "type", label: "TS Тип",       color: C.purple },
];

export default function LinkedListDemo() {
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
            <span style={{ color: C.muted, fontSize: 11 }}>linked-list.ts</span>
            <span style={{ background: C.teal + "22", color: C.teal, fontSize: 9, padding: "1px 7px", borderRadius: 99 }}>Алго + TS #3</span>
          </div>
          <span style={{ color: C.muted, fontSize: 10 }}>@nby.frontend</span>
        </div>

        {/* tabs */}
        <div style={{
          background: C.surface2, border: `1px solid ${C.border}`,
          borderTop: `1px solid ${C.border}`, borderBottom: "none", display: "flex",
        }}>
          {TABS.map(t => (
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
          💡 Node{"<T>"} | null — рекурсивний тип. Посилається сам на себе.
        </div>

      </div>
    </div>
  );
}
