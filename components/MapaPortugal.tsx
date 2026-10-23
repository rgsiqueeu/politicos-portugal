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

// Nível 0 = sem valor (por exemplo, nenhum deputado desse partido no círculo).
const COR = ["#efebe3", "#e8eeff", "#c9d6ff", "#8fa8f5", "#1740c8", "#0d2a8f"];
const ESTRANGEIRO = ["Europa", "Fora da Europa"];

// Por omissão mostra o número de deputados de cada círculo. Para outros indicadores
// (retrato do Parlamento) recebe o nível de cor, a etiqueta e o texto de cada círculo.
export default function MapaPortugal({
  contagem,
  atual,
  niveis,
  etiquetas,
  detalhes,
}: {
  contagem: Record<string, number>;
  atual?: string;
  niveis?: Record<string, number>;
  etiquetas?: Record<string, string>;
  detalhes?: Record<string, string>;
}) {
  const router = useRouter();
  const [foco, setFoco] = useState<string | null>(null);
  const mostrado = foco ?? atual ?? null;
  const nivelDe = (nome: string) => niveis?.[nome] ?? nivel(contagem[nome] ?? 0);
  const etiquetaDe = (nome: string) => etiquetas?.[nome] ?? String(contagem[nome] ?? 0);
  const detalheDe = (nome: string) => detalhes?.[nome] ?? `${contagem[nome] ?? 0} ${contagem[nome] === 1 ? "deputado" : "deputados"}`;

  return (
    <div className="mapa-portugal">
      <svg viewBox={mapa.viewBox} role="group" aria-label="Mapa de Portugal por círculo eleitoral">
        {mapa.regioes.map((r) => {
          const ativo = mostrado === r.nome;
          // Nos Açores e na Madeira a caixa inteira é clicável: as ilhas são pequenas demais para tocar.
          const caixa = (mapa.caixasIlhas as Record<string, { x: number; y: number; w: number; h: number }>)[r.nome];
          return (
            <a
              key={r.nome}
              href={`/circulos/${slug(r.nome)}`}
              aria-label={`${r.nome}: ${detalheDe(r.nome)}`}
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
                    {r.nome} · {etiquetaDe(r.nome)}
                  </text>
                </>
              )}
              <path d={r.d} fill={COR[nivelDe(r.nome)]} className={`regiao${ativo ? " ativa" : ""}${caixa ? " ilha" : ""}`} />
              {!caixa && (
                <text x={r.centro[0]} y={r.centro[1] + 4} textAnchor="middle" className={`numero-regiao${nivelDe(r.nome) >= 4 ? " claro" : ""}`} aria-hidden="true">
                  {etiquetaDe(r.nome)}
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
            <span>{detalheDe(mostrado)}</span>
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
            {nome} · {etiquetaDe(nome)}
          </Link>
        ))}
      </div>
    </div>
  );
}
