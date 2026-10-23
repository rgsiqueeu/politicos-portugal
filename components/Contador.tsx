"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Conta páginas vistas, de forma anónima. Respeita "não rastrear".
export default function Contador() {
  const caminho = usePathname();
  useEffect(() => {
    if (navigator.doNotTrack === "1") return;
    let sessao = "";
    try {
      sessao = sessionStorage.getItem("sessao") ?? "";
      if (!sessao) {
        sessao = crypto.randomUUID();
        sessionStorage.setItem("sessao", sessao);
      }
    } catch {
      sessao = crypto.randomUUID();
    }
    fetch("/api/evento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caminho, sessao }),
      keepalive: true,
    }).catch(() => {});
  }, [caminho]);
  return null;
}
