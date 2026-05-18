// TEMP: Sentry smoke test — remove after validation.
function SentryDebugButton() {
  return (
    <button
      onClick={() => {
        throw new Error("Family Flow Sentry test — this is your first error!");
      }}
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 9999,
        padding: "8px 12px",
        background: "#ef4444",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      Break the world (Sentry test)
    </button>
  );
}

export default SentryDebugButton;
