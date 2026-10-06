import { useEffect, useRef, useState } from "react";

const GOOGLE_SCRIPT_URL = "https://accounts.google.com/gsi/client";

const GoogleSignInButton = ({ onCredential, disabled = false }) => {
  const containerRef = useRef(null);
  const credentialHandler = useRef(onCredential);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const clientId = import.meta.env.VITE_GMAIL_CLIENT_ID;
  const error = clientId ? loadError : "Google sign-in is not configured.";
  useEffect(() => {
    credentialHandler.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!clientId) return undefined;

    let active = true;
    const container = containerRef.current;
    const renderButton = () => {
      if (!active || !window.google?.accounts?.id || !container) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => {
          if (active && credential) credentialHandler.current(credential);
        },
        auto_select: false
      });
      container.replaceChildren();
      window.google.accounts.id.renderButton(container, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        width: Math.min(container.clientWidth || 360, 400)
      });
      setIsReady(true);
    };

    let script = document.querySelector(`script[src="${GOOGLE_SCRIPT_URL}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = GOOGLE_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.onload = renderButton;
      script.onerror = () => {
        if (active) setLoadError("Google sign-in could not be loaded. Please try again.");
      };
      document.head.appendChild(script);
    } else if (window.google?.accounts?.id) {
      window.setTimeout(renderButton, 0);
    } else {
      script.addEventListener("load", renderButton, { once: true });
      script.addEventListener("error", () => {
        if (active) setLoadError("Google sign-in could not be loaded. Please try again.");
      }, { once: true });
    }

    return () => {
      active = false;
      container?.replaceChildren();
    };
  }, [clientId]);

  return (
    <div aria-busy={!isReady && !error} className={disabled ? "pointer-events-none opacity-60" : ""}>
      <div ref={containerRef} className="flex min-h-10 justify-center" />
      {error && <p role="alert" className="mt-2 text-center text-xs theme-danger">{error}</p>}
      {!isReady && !error && (
        <p className="mt-2 text-center text-xs theme-text-muted">Loading Google sign-in…</p>
      )}
    </div>
  );
};

export default GoogleSignInButton;
