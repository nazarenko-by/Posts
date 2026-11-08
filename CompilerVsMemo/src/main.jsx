import { createRoot } from "react-dom/client";
import { Profiler } from "react";
import App from "@app";
import { onAppRender } from "./stats.js";
import "./style.css";

document.getElementById("variant").textContent = __VARIANT__;
createRoot(document.getElementById("root")).render(
    <Profiler id="app" onRender={onAppRender}>
        <App />
    </Profiler>,
);
