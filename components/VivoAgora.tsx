"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Estatisticas } from "@/lib/visitas";

export function useEstatisticas() {
  const [e, setE] = useState<Estatisticas | null>(null);
  useEffect(() => {
    let vivo = true;
    const ler = () =>
      fetch("/api/estatisticas")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => vivo && d && setE(d))
        .catch(() => {});
    ler();
    const t = setInterval(ler, 30_000);
    return () => {
      vivo = false;
      clearInterval(t);
    };
  }, []);
  return e;
}

const n = (x: number) => x.toLocaleString("pt-PT");

// Linha curta para o herói.
export default function VivoAgora() {
  const e = useEstatisticas();
  if (!e) return null;
  return (
    <Link href="/ao-vivo" className="chip">
      <span className="ponto-vivo" aria-hidden="true" />
      {n(e.agora)} {e.agora === 1 ? "pessoa" : "pessoas"} aqui agora · {n(e.hoje)} hoje
    </Link>
  );
}
