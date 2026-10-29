import "./globals.css";

export const metadata = { title: "Launchpad - Next.js" };

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
