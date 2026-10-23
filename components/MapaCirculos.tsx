import Link from "next/link";
import { circuloSlug } from "@/lib/dados";
import { nivel } from "@/lib/niveis";

// Mapa em mosaico: cada distrito é um quadrado, na posição aproximada. [linha, coluna]
const POSICAO: Record<string, [number, number]> = {
  "Viana do Castelo": [1, 1],
  Braga: [1, 2],
  "Vila Real": [1, 3],
  Bragança: [1, 4],
  Porto: [2, 1],
  Viseu: [2, 2],
  Guarda: [2, 3],
  Aveiro: [3, 1],
  Coimbra: [3, 2],
  "Castelo Branco": [3, 3],
  Leiria: [4, 1],
  Santarém: [4, 2],
  Portalegre: [4, 3],
  Lisboa: [5, 1],
  Setúbal: [5, 2],
  Évora: [5, 3],
  Beja: [6, 3],
  Faro: [7, 3],
};
const FORA = ["Açores", "Madeira", "Europa", "Fora da Europa"];


export default function MapaCirculos({ contagem, atual }: { contagem: Record<string, number>; atual?: string }) {
  const quadrado = (nome: string, estilo?: React.CSSProperties) => {
    const n = contagem[nome] ?? 0;
    return (
      <Link
        key={nome}
        href={`/circulos/${circuloSlug(nome)}`}
        className={`n${nivel(n)}${atual === nome ? " atual" : ""}`}
        style={estilo}
        aria-label={`${nome}: ${n} deputados`}
        title={`${nome}: ${n} deputados`}
      >
        <span>{nome}</span>
        <b>{n}</b>
      </Link>
    );
  };
  return (
    <div>
      <div className="mapa">
        {Object.entries(POSICAO).map(([nome, [l, c]]) => quadrado(nome, { gridRow: l, gridColumn: c }))}
      </div>
      <div className="mapa mapa-fora">{FORA.map((nome) => quadrado(nome))}</div>
      <div className="legenda-mapa" aria-hidden="true">
        menos deputados
        <i style={{ background: "var(--azul-claro)" }} />
        <i style={{ background: "#c9d6ff" }} />
        <i style={{ background: "#8fa8f5" }} />
        <i style={{ background: "var(--azul)" }} />
        <i style={{ background: "var(--azul-escuro)" }} />
        mais deputados
      </div>
    </div>
  );
}
