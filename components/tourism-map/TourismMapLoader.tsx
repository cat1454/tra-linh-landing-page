"use client";

import dynamic from "next/dynamic";
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";

import type { TourismMapMode, TourismPlace } from "@/data/tourism-map/types";
import { TourismMapErrorFallback } from "./TourismMapErrorFallback";
import { TourismMapSkeleton } from "./TourismMapSkeleton";

const TourismMapClient = dynamic(() => import("./TourismMapClient"), {
  ssr: false,
  loading: () => <TourismMapSkeleton />,
});

interface MapLoadBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  retryKey: number;
  onError: (error: Error, errorInfo: ErrorInfo) => void;
}

class MapLoadBoundary extends Component<
  MapLoadBoundaryProps,
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError(error, errorInfo);
  }

  componentDidUpdate(previousProps: MapLoadBoundaryProps) {
    if (previousProps.retryKey !== this.props.retryKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

interface TourismMapLoaderProps {
  entities: TourismPlace[];
  eager?: boolean;
  mode?: TourismMapMode;
}

export function TourismMapLoader({
  entities,
  eager = false,
  mode = "preview",
}: TourismMapLoaderProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [clientReady, setClientReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const loaderRef = useRef<HTMLDivElement>(null);
  const markClientReady = useCallback(() => setClientReady(true), []);

  useEffect(() => {
    if (eager) {
      const eagerLoadTimer = window.setTimeout(() => setShouldLoad(true), 0);
      return () => window.clearTimeout(eagerLoadTimer);
    }
    const element = loaderRef.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "500px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [eager]);

  useEffect(() => {
    if (!shouldLoad || clientReady || loadFailed) return;
    const timeout = window.setTimeout(() => setLoadFailed(true), 20_000);
    return () => window.clearTimeout(timeout);
  }, [clientReady, loadFailed, shouldLoad]);

  function retryLoad() {
    setLoadFailed(false);
    setClientReady(false);
    setRetryKey((current) => current + 1);
  }

  const fallback = (
    <TourismMapErrorFallback places={entities} onRetry={retryLoad} />
  );

  return (
    <div
      ref={loaderRef}
      className="mt-8 min-h-[430px] lg:min-h-[560px]"
      data-testid="tourism-map-loader"
    >
      {loadFailed ? (
        fallback
      ) : shouldLoad ? (
        <MapLoadBoundary
          fallback={fallback}
          retryKey={retryKey}
          onError={() => setLoadFailed(true)}
        >
          <TourismMapClient
            key={retryKey}
            entities={entities}
            mode={mode}
            onClientReady={markClientReady}
          />
        </MapLoadBoundary>
      ) : (
        <TourismMapSkeleton places={entities} />
      )}
    </div>
  );
}
