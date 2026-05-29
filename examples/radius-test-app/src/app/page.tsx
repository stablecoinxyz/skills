export default function HomePage() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: 32 }}>
      <p style={{ fontSize: 11, opacity: 0.6 }}>// skill test app</p>
      <h1 style={{ fontSize: 20, fontWeight: 600 }}>radius_integration</h1>
      <p style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.8 }}>
        Not integrated yet. In Cursor, open this folder and run:
      </p>
      <pre
        style={{
          fontSize: 12,
          padding: 16,
          background: "#f4f4f5",
          borderRadius: 8,
          overflow: "auto",
        }}
      >
        {`@sbc-radius-integration

integrate radius for me`}
      </pre>
      <p style={{ fontSize: 12, opacity: 0.7 }}>
        Skill path: <code>plugins/sbc/skills/sbc-radius-integration/</code>
      </p>
    </main>
  );
}
