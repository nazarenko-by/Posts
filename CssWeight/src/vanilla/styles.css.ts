// vanilla-extract: стилі в TypeScript, на білді перетворюються на звичайний .css (нуль рантайму)
import { globalStyle, style, styleVariants } from "@vanilla-extract/css";

// токени й reset - ті самі значення, що в modules/global.css
globalStyle(":root", {
    vars: {
        "--bg": "#0f1729", "--panel": "#16213e", "--line": "#2a2c4a", "--ink": "#e8ecfb",
        "--muted": "#8a93c7", "--accent": "#ff9e64", "--font-sans": '"Inter", system-ui, sans-serif',
    },
});
globalStyle("*, ::before, ::after", { boxSizing: "border-box", margin: 0, padding: 0, border: "0 solid" });
globalStyle("html", { lineHeight: 1.5, WebkitTextSizeAdjust: "100%" });
globalStyle("body", { fontFamily: "var(--font-sans)", background: "var(--bg)", color: "var(--ink)", WebkitFontSmoothing: "antialiased" });
globalStyle("a", { color: "inherit", textDecoration: "inherit" });
globalStyle("button", { font: "inherit", color: "inherit", background: "transparent", cursor: "pointer" });
globalStyle("ul", { listStyle: "none" });
globalStyle("h1, h2, h3, h4", { fontSize: "inherit", fontWeight: "inherit" });

const md = "screen and (min-width: 48rem)";

// --- Button ---
export const btnBase = style({
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
    borderRadius: "0.75rem", fontWeight: 600, transition: "color .15s, background-color .15s, border-color .15s",
    selectors: {
        "&:focus-visible": { outline: "2px solid var(--accent)", outlineOffset: 2 },
        "&:disabled": { opacity: 0.5 },
    },
});
export const btnVariant = styleVariants({
    primary: { background: "var(--accent)", color: "var(--bg)", ":hover": { background: "color-mix(in oklab, var(--accent) 90%, transparent)" } },
    secondary: { border: "1px solid var(--line)", background: "var(--panel)", color: "var(--ink)", ":hover": { borderColor: "var(--accent)" } },
    ghost: { color: "var(--muted)", ":hover": { background: "var(--panel)", color: "var(--ink)" } },
});
export const btnSize = styleVariants({
    md: { height: "2.5rem", padding: "0 1rem", fontSize: "0.875rem", lineHeight: "1.25rem" },
    lg: { height: "3rem", padding: "0 1.5rem", fontSize: "1rem", lineHeight: "1.5rem" },
});

// --- Header ---
export const header = style({
    position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between",
    borderBottom: "1px solid var(--line)", background: "color-mix(in oklab, var(--bg) 90%, transparent)",
    padding: "1rem 1.5rem", backdropFilter: "blur(8px)",
});
export const logo = style({ fontSize: "1.25rem", lineHeight: "1.75rem", fontWeight: 800, letterSpacing: "-0.025em" });
export const logoAccent = style({ color: "var(--accent)" });
export const nav = style({ display: "none", gap: "1.5rem", "@media": { [md]: { display: "flex" } } });
export const navLink = style({
    fontSize: "0.875rem", lineHeight: "1.25rem", fontWeight: 500, color: "var(--muted)", transition: "color .15s",
    ":hover": { color: "var(--ink)" },
});

// --- Hero ---
export const hero = style({ maxWidth: "64rem", margin: "0 auto", padding: "4rem 1.5rem", textAlign: "center", "@media": { [md]: { padding: "6rem 1.5rem" } } });
export const kicker = style({ marginBottom: "0.75rem", fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", lineHeight: "1.25rem", color: "var(--accent)" });
export const heroTitle = style({ fontSize: "1.875rem", lineHeight: 1.25, fontWeight: 800, "@media": { [md]: { fontSize: "3rem" } } });
export const lead = style({ maxWidth: "42rem", margin: "1rem auto 0", fontSize: "1rem", lineHeight: "1.5rem", color: "var(--muted)", "@media": { [md]: { fontSize: "1.125rem", lineHeight: "1.75rem" } } });
export const heroActions = style({ marginTop: "2rem", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.75rem" });

// --- ProductCard ---
export const card = style({
    position: "relative", display: "flex", flexDirection: "column", overflow: "hidden",
    border: "1px solid var(--line)", borderRadius: "1rem", background: "var(--panel)", transition: "transform .15s, border-color .15s",
    ":hover": { transform: "translateY(-0.25rem)", borderColor: "color-mix(in oklab, var(--accent) 60%, transparent)" },
});
export const badge = style({ position: "absolute", top: "0.75rem", left: "0.75rem", borderRadius: 9999, background: "var(--accent)", padding: "0.25rem 0.625rem", fontSize: "0.75rem", lineHeight: "1rem", fontWeight: 700, color: "var(--bg)" });
export const like = style({
    position: "absolute", top: "0.75rem", right: "0.75rem", display: "grid", placeItems: "center", width: "2.25rem", height: "2.25rem",
    borderRadius: 9999, background: "color-mix(in oklab, var(--bg) 70%, transparent)", fontSize: "1.125rem", lineHeight: "1.75rem", color: "var(--muted)", backdropFilter: "blur(8px)",
    ":hover": { color: "var(--ink)" },
});
export const liked = style({ color: "var(--accent)" });
export const image = style({ aspectRatio: "4 / 5", background: "linear-gradient(to bottom right, var(--line), var(--bg))" });
export const cardBody = style({ display: "flex", flex: 1, flexDirection: "column", gap: "0.5rem", padding: "1rem" });
export const cardName = style({ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, overflow: "hidden", fontSize: 15, fontWeight: 600 });
export const meta = style({ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.75rem", lineHeight: "1rem", color: "var(--muted)" });
export const cardFooter = style({ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.5rem" });
export const price = style({ fontSize: "1.125rem", lineHeight: "1.75rem", fontWeight: 700, color: "var(--accent)" });

// --- Footer ---
export const footer = style({ marginTop: "4rem", borderTop: "1px solid var(--line)", padding: "3rem 1.5rem" });
export const footerGrid = style({
    maxWidth: "72rem", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "2rem",
    "@media": { [md]: { gridTemplateColumns: "repeat(4, minmax(0, 1fr))" } },
});
export const footerHeading = style({ marginBottom: "0.75rem", fontSize: "0.875rem", lineHeight: "1.25rem", fontWeight: 700 });
export const footerLinks = style({});
globalStyle(`${footerLinks} > li + li`, { marginTop: "0.5rem" });
export const footerLink = style({ fontSize: "0.875rem", lineHeight: "1.25rem", color: "var(--muted)", ":hover": { color: "var(--ink)" } });
export const copy = style({ marginTop: "2.5rem", textAlign: "center", fontSize: "0.75rem", lineHeight: "1rem", color: "var(--muted)" });

// --- App ---
export const main = style({ maxWidth: "72rem", margin: "0 auto", padding: "0 1.5rem" });
export const sectionHeading = style({ marginBottom: "1.5rem", fontSize: "1.5rem", lineHeight: "2rem", fontWeight: 700 });
export const grid = style({ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" });
