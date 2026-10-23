"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import mapa from "@/lib/mapa-portugal.json";
import { nivel } from "@/lib/niveis";

const slug = (nome: string) =>
  nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const COR = ["", "#e8eeff", "#c9d6ff", "#8fa8f5", "#1740c8", "#0d2a8f"];
const ESTRANGEIRO = ["Europa", "Fora da Europa"];

export default function MapaPortugal({ contagem, atual }: { contagem: Record<string, number>; atual?: string }) {
  const router = useRouter();
  const [foco, setFoco] = useState<string | null>(null);
  const mostrado = foco ?? atual ?? null;
  const n = mostrado ? (contagem[mostrado] ?? 0) : null;

  return (
    <div className="mapa-portugal">
      <svg viewBox={mapa.viewBox} role="group" aria-label="Mapa de Portugal por círculo eleitoral">
        {mapa.regioes.map((r) => {
          const k = contagem[r.nome] ?? 0;
          const ativo = mostrado === r.nome;
          // Nos Açores e na Madeira a caixa inteira é clicável: as ilhas são pequenas demais para tocar.
          const caixa = (mapa.caixasIlhas as Record<string, { x: number; y: number; w: number; h: number }>)[r.nome];
          return (
            <a
              key={r.nome}
              href={`/circulos/${slug(r.nome)}`}
              aria-label={`${r.nome}: ${k} deputados`}
              onMouseEnter={() => setFoco(r.nome)}
              onMouseLeave={() => setFoco(null)}
              onFocus={() => setFoco(r.nome)}
              onBlur={() => setFoco(null)}
              onClick={(e) => {
                e.preventDefault();
                router.push(`/circulos/${slug(r.nome)}`);
              }}
            >
              {caixa && (
                <>
                  <rect x={caixa.x} y={caixa.y} width={caixa.w} height={caixa.h} rx="10" className={`caixa-ilha${ativo ? " ativa" : ""}`} />
                  <text x={caixa.x + 10} y={caixa.y + caixa.h - 10} className="rotulo-ilha">
                    {r.nome} · {k}
                  </text>
                </>
              )}
              <path d={r.d} fill={COR[nivel(k)]} className={`regiao${ativo ? " ativa" : ""}${caixa ? " ilha" : ""}`} />
              {!caixa && k >= 9 && (
                <text x={r.centro[0]} y={r.centro[1] + 4} textAnchor="middle" className={`numero-regiao${nivel(k) >= 4 ? " claro" : ""}`} aria-hidden="true">
                  {k}
                </text>
              )}
            </a>
          );
        })}
      </svg>
      <div className="mapa-info" aria-live="polite">
        {mostrado ? (
          <>
            <strong className="display">{mostrado}</strong>
            <span>
              {n} {n === 1 ? "deputado" : "deputados"}
            </span>
            <Link href={`/circulos/${slug(mostrado)}`}>Ver quem são →</Link>
          </>
        ) : (
          <span>Passa o rato ou toca num distrito.</span>
        )}
      </div>
      <div className="estrangeiro">
        <span>Vives no estrangeiro?</span>
        {ESTRANGEIRO.map((nome) => (
          <Link key={nome} className="chip" href={`/circulos/${slug(nome)}`}>
            {nome} · {contagem[nome] ?? 0}
          </Link>
        ))}
      </div>
    </div>
  );
}
