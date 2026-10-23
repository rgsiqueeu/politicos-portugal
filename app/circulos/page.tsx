import type { Metadata } from "next";
import Link from "next/link";
import { circuloSlug, deputados, meta } from "@/lib/dados";

export const metadata: Metadata = { title: "Quem me representa" };

export default function Circulos() {
  const m = meta();
  const em = deputados().filter((d) => d.emFuncoes);
  return (
    <>
      <h1>Quem me representa?</h1>
      <p>
        Os deputados são eleitos por círculo eleitoral: os 18 distritos do continente, as duas regiões autónomas e
        dois círculos para quem vive no estrangeiro. Escolha o seu círculo para ver quem foi eleito por ele e está
        hoje em funções.
      </p>
      <ul className="lista az">
        {m.circulos.map((c) => (
          <li key={c.id}>
            <Link href={`/circulos/${circuloSlug(c.nome)}`}>{c.nome}</Link>{" "}
            <small>· {em.filter((d) => d.circulo === c.nome).length} deputados</small>
          </li>
        ))}
      </ul>
      <p className="nota" style={{ marginTop: "1.5rem" }}>
        O número de deputados de cada círculo é proporcional ao número de eleitores inscritos (Constituição, art.
        149.º). Fonte: Assembleia da República, dados abertos.
      </p>
    </>
  );
}
