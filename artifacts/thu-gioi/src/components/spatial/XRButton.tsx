import { useEffect, useState, useRef } from "react";
import { createXRStore, XRStore } from "@react-three/xr";
import { Button } from "@/components/ui/button";

let _xrStore: XRStore | null = null;

function getXRStore(): XRStore {
  if (!_xrStore) {
    _xrStore = createXRStore();
  }
  return _xrStore;
}

export function getXRStoreIfAvailable(): XRStore | null {
  return _xrStore;
}

export function useXRStore(enabled: boolean = true): XRStore | null {
  const ref = useRef<XRStore | null>(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    if (!ref.current) {
      ref.current = getXRStore();
      forceUpdate((n) => n + 1);
    }
  }, [enabled]);

  return ref.current;
}

export function XRButton() {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if ("xr" in navigator) {
      navigator.xr?.isSessionSupported("immersive-vr").then((isSupported) => {
        setSupported(!!isSupported);
      });
    }
  }, []);

  if (!supported) return null;

  const store = getXRStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 p-3 bg-[#050514]/80 border border-primary/40 backdrop-blur-xl rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.25)]">
      <Button
        variant="outline"
        size="sm"
        className="border-primary/50 text-primary hover:bg-primary/20 hover:text-primary-foreground font-serif text-xs"
        onClick={() => store.enterVR()}
        title="Tương thích VR khi kết nối thiết bị"
      >
        VR Mode
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="border-accent/50 text-accent hover:bg-accent/20 hover:text-accent-foreground font-serif text-xs"
        onClick={() => store.enterAR()}
        title="Tương thích AR khi kết nối thiết bị"
      >
        AR Mode
      </Button>
    </div>
  );
}
