// TEMP: Sentry smoke test — remove after validation.
import { useEffect } from "react";
import { createPortal } from "react-dom";

function SentryDebugButton() {
  useEffect(() => {
    // Plan B: call window.__sentryTest() in the browser console.
    (window as unknown as { __sentryTest: () => void }).__sentryTest = () => {
      throw new Error("Family Flow Sentry test — triggered from console");
    };
    return () => {
      delete (window as unknown as { __sentryTest?: () => void }).__sentryTest;
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <button
      onClick={() => {
        throw new Error("Family Flow Sentry test — this is your first error!");
      }}
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 2147483647,
        padding: "10px 14px",
        background: "#ef4444",
        color: "white",
        border: "2px solid white",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        pointerEvents: "auto",
      }}
    >
      Break the world (Sentry test)
    </button>,
    document.body,
  );
}

export default SentryDebugButton;
