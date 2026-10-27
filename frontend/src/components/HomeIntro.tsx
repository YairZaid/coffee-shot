"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";

const BeanCanvas = dynamic(() => import("./BeanCanvas"), {
  ssr: false,
  loading: () => <BeanFallback />,
});

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function BeanFallback({ onTap }: { onTap?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="animate-bean-float flex h-32 w-28 items-center justify-center rounded-[50%_50%_48%_48%/60%_60%_40%_40%] bg-[#6b4226]">
        <div className="h-20 w-2 rounded-full bg-[#2b1810]" />
      </div>
      {onTap ? (
        <button
          type="button"
          onClick={onTap}
          className="h-10 rounded-full border border-border px-4 text-xs font-semibold text-text"
        >
          Tap to continue
        </button>
      ) : null}
    </div>
  );
}

class BeanErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export function HomeIntro({ onFinished }: { onFinished: () => void }) {
  const [greeting, setGreeting] = useState<string | null>(null);
  const [webglOk, setWebglOk] = useState<boolean | null>(null);
  const [cracking, setCracking] = useState(false);
  const [canvasFailed, setCanvasFailed] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- reading the system
       clock (an external source) is the standard exception */
    setGreeting(greetingForHour(new Date().getHours()));
    setWebglOk(hasWebGL());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    // Safety net: if the canvas hasn't confirmed it initialized within a
    // few seconds (WebGL init stall, chunk load failure, a silent error
    // inside the render loop that no error boundary can catch), fall back
    // rather than leaving the user stuck looking at nothing. Once the
    // canvas is ready, this never fires regardless of how long the user
    // then spends turning the bean around.
    if (canvasReady) return;
    const timeout = setTimeout(() => setCanvasFailed(true), 4000);
    return () => clearTimeout(timeout);
  }, [canvasReady]);

  function startCrack() {
    setCracking(true);
  }

  const showInteractiveFallback = webglOk === false || canvasFailed;

  return (
    <div className="flex flex-col items-center gap-5 p-6">
      <p className="m-0 text-[15px] font-semibold text-text">
        {greeting ?? "Hello"}
      </p>
      <p className="m-0 text-center text-[12.5px] text-text-muted">
        Turn the bean, then tap it.
      </p>
      <div className="h-56 w-full">
        {showInteractiveFallback ? (
          <div className="flex h-full items-center justify-center">
            <BeanFallback onTap={onFinished} />
          </div>
        ) : webglOk === null ? (
          <div className="flex h-full items-center justify-center">
            <BeanFallback />
          </div>
        ) : (
          <BeanErrorBoundary onError={() => setCanvasFailed(true)}>
            <BeanCanvas
              cracking={cracking}
              onTap={startCrack}
              onCrackDone={onFinished}
              onReady={() => setCanvasReady(true)}
            />
          </BeanErrorBoundary>
        )}
      </div>
    </div>
  );
}
