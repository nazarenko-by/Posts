// Server Component: HTML генерується на збірці, у браузері гідратуються лише "use client" компоненти
import { Landing } from "../components/Landing.jsx";

export default function Page() {
  return <Landing />;
}
