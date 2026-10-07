// Умовний склад JS-бандла (KB). Листки мають value, вузли — children.
export const data = {
  name: "bundle",
  children: [
    {
      name: "node_modules",
      children: [
        { name: "react-dom", children: [{ name: "client", value: 96 }, { name: "server", value: 34 }] },
        {
          name: "d3",
          children: [
            { name: "shape", value: 28 },
            { name: "scale", value: 22 },
            { name: "zoom", value: 16 },
            { name: "selection", value: 14 },
          ],
        },
        { name: "date-fns", children: [{ name: "locale", value: 18 }, { name: "format", value: 12 }] },
        { name: "lodash-es", children: [{ name: "merge", value: 16 }, { name: "debounce", value: 8 }] },
      ],
    },
    {
      name: "src",
      children: [
        { name: "components", children: [{ name: "Chart", value: 26 }, { name: "Sidebar", value: 22 }, { name: "Header", value: 12 }] },
        { name: "pages", children: [{ name: "Dashboard", value: 24 }, { name: "Home", value: 20 }] },
        { name: "utils", value: 14 },
      ],
    },
    { name: "assets", children: [{ name: "fonts", value: 48 }, { name: "images", value: 36 }] },
  ],
};
