import { data } from "./data.js";
import { sunburst } from "./sunburst.js";

sunburst(document.getElementById("chart"), data, { size: 640 });
