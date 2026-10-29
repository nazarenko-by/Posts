import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Landing } from "./Landing.jsx";
import "./styles.css";

const router = createBrowserRouter([{ path: "/", element: <Landing /> }]);

createRoot(document.getElementById("root")).render(<RouterProvider router={router} />);
