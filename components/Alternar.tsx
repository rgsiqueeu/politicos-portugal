"use client";

import { useEffect, useState } from "react";

// Escolha entre o mapa geográfico e o mosaico; lembra a escolha neste browser.
export default function Alternar({ mapa, quadrados }: { mapa: React.ReactNode; quadrados: React.ReactNode }) {
  const [vista, setVista] = useState<"mapa" | "quadrados">("mapa");
  useEffect(() => {
    try {
      if (localStorage.getItem("vista-circulos") === "quadrados") setVista("quadrados");
    } catch {}
  }, []);
  const escolher = (v: "mapa" | "quadrados") => {
    setVista(v);
    try {
      localStorage.setItem("vista-circulos", v);
    } catch {}
  };
  return (
    <div>
      <div className="alternar" role="group" aria-label="Forma de escolher o círculo">
        <button type="button" aria-pressed={vista === "mapa"} onClick={() => escolher("mapa")}>
          Mapa
        </button>
        <button type="button" aria-pressed={vista === "quadrados"} onClick={() => escolher("quadrados")}>
          Quadrados
        </button>
      </div>
      {vista === "mapa" ? mapa : quadrados}
    </div>
  );
}
