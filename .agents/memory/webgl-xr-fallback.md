---
name: WebGL/XR fallback pattern
description: How to safely use Three.js/R3F/XR in Replit where the preview sandbox has no GPU.
---

## The Rule

Never render `<Canvas>` or call `createXRStore()` in Replit's preview unless WebGL is confirmed working first. The preview sandbox has no GPU (VENDOR=0xffff, DEVICE=0xffff); Three.js and @react-three/xr's DevUI both try to create a WebGLRenderer at init time and crash with an unhandled error that Vite's runtime-error-plugin turns into a blocking overlay.

**Why:** Replit preview uses a headless iframe with no hardware GPU. `canvas.getContext("webgl")` may return a context object but `WebGLRenderer` construction fails with "BindToCurrentSequence failed". This happens synchronously before React error boundaries can catch it, so it propagates as an unhandled runtime error.

**How to apply:**

1. `useWebGLSupported()` hook (`src/hooks/useWebGLSupported.ts`) — runs a canvas.getContext test plus SwiftShader check in `useMemo`. Returns `false` in headless/no-GPU environments.

2. `useXRStore(enabled: boolean)` (`src/components/spatial/XRButton.tsx`) — lazy-initializes `createXRStore()` inside a `useEffect` only when `enabled` is true. The XR DevUI creates its own WebGLRenderer on store init, so this must also be gated.

3. Pattern in pages:
   ```tsx
   const webGLSupported = useWebGLSupported();
   const xrStore = useXRStore(webGLSupported);
   // ...
   {webGLSupported && (
     <CanvasErrorBoundary>
       <Canvas>
         {xrStore ? <XR store={xrStore}>...</XR> : <>{/* scene without XR */}</>}
       </Canvas>
     </CanvasErrorBoundary>
   )}
   ```

4. Remove `runtimeErrorOverlay()` from `vite.config.ts` plugins — the plugin intercepts ALL unhandled errors and shows the blocking overlay, including from Three.js internals that escape React boundaries.

5. `CanvasErrorBoundary` (`src/components/spatial/CanvasErrorBoundary.tsx`) — React class error boundary wrapping every `<Canvas>` as a last-resort catch.

6. **Runtime context-loss after startup** — even when WebGL passes the initial check, the context can be LOST during use (Replit throttles GPU). Fix: add `webglcontextlost` listener in `onCreated` callback + unmount Canvas on loss. Also add global error handlers in `main.tsx` to swallow non-Error exceptions from Three.js internals that escape all React boundaries:
   ```tsx
   // SpatialScene — handle loss at runtime
   <Canvas onCreated={({ gl }) => {
     gl.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); setContextLost(true); });
   }}>
   
   // main.tsx — global safety net for non-Error throws
   window.addEventListener("error", (e) => {
     if (!e.error || typeof e.error !== "object") { e.stopImmediatePropagation(); e.preventDefault(); }
   });
   window.addEventListener("unhandledrejection", (e) => {
     if (!e.reason || typeof e.reason !== "object") { e.preventDefault(); }
   });
   ```
