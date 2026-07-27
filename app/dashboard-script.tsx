"use client";

import { useEffect } from "react";

export default function DashboardScript() {
  useEffect(() => {
    if (document.querySelector('script[data-weather-desk="true"]')) return;
    const script = document.createElement("script");
    script.src = "/js/app.js";
    script.type = "module";
    script.dataset.weatherDesk = "true";
    document.body.appendChild(script);
    return () => script.remove();
  }, []);
  return null;
}
