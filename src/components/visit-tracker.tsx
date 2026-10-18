"use client";

import { useEffect } from "react";

export function VisitTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("visit-recorded")) return;
      sessionStorage.setItem("visit-recorded", "1");
      let visitorId = localStorage.getItem("visitor-id");
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem("visitor-id", visitorId);
      }
      void fetch("/api/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId }),
        keepalive: true,
      }).catch(() => {});
    } catch { /* Browser storage can be blocked; counting is best-effort. */ }
  }, []);
  return null;
}
