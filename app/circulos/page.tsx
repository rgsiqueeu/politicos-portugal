import type { Metadata } from "next";
import Link from "next/link";
import MapaCirculos from "@/components/MapaCirculos";
import { circuloSlug, deputados, meta } from "@/lib/dados";

export const metadata: Metadata = { title: "O meu círculo" };

export default function Circulos() {
  const m = meta();
  const em = deputados().filter((d) => d.emFuncoes);
  const contagem: Record<string, number> = {};
  for (const d of em) contagem[d.circulo] = (contagem[d.circulo] ?? 0) + 1;
  return (
    <div className="dentro pagina">
      <h1 className="display">Quem me representa?</h1>
      <p>
        Os deputados são eleitos por círculo eleitoral: os 18 distritos do continente, as duas regiões autónomas e dois
        círculos para quem vive no estrangeiro. Escolhe o teu para ver quem foi eleito por ele.
      </p>
      <div className="mapa-e-lista">
        <MapaCirculos contagem={contagem} />
        <div className="cartao">
          <ul className="lista">
            {m.circulos.map((c) => (
              <li key={c.id} style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <Link href={`/circulos/${circuloSlug(c.nome)}`}>{c.nome}</Link>
                <small>{contagem[c.nome] ?? 0} deputados</small>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="nota" style={{ marginTop: "1.5rem" }}>
        O número de deputados de cada círculo é proporcional ao número de eleitores inscritos (Constituição, art.
        149.º). Fonte: Assembleia da República, dados abertos.
      </p>
    </div>
  );
}
