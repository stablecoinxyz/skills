import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Radius skill test app",
  description: "Test harness for sbc-radius-integration skill",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "ui-monospace, monospace" }}>
        {children}
      </body>
    </html>
  );
}
