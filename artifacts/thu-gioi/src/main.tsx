import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const THREE_WEBGL_ERRORS = [
  "context lost",
  "webgl",
  "BindToCurrentSequence",
  "lost context",
  "GL_",
];

function isThreeJsError(msg: string): boolean {
  const lower = msg.toLowerCase();
  return THREE_WEBGL_ERRORS.some((k) => lower.includes(k.toLowerCase()));
}

window.addEventListener("error", (e) => {
  if (!e.error || typeof e.error !== "object") {
    e.stopImmediatePropagation();
    e.preventDefault();
    return;
  }
  const msg = String(e.message ?? "");
  if (isThreeJsError(msg)) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

window.addEventListener("unhandledrejection", (e) => {
  const reason = e.reason;
  if (!reason || typeof reason !== "object") {
    e.preventDefault();
    return;
  }
  const msg = String(reason?.message ?? reason ?? "");
  if (isThreeJsError(msg)) {
    e.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
