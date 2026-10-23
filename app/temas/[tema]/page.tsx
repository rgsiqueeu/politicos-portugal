import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Fonte from "@/components/Fonte";
import LinhaIniciativa from "@/components/LinhaIniciativa";
import { ESTADO, num, todasIniciativas, type EstadoIniciativa } from "@/lib/dados";
import { TEMAS, temaPorId } from "@/lib/temas";

type Props = { params: Promise<{ tema: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return TEMAS.map((t) => ({ tema: t.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = temaPorId.get((await params).tema);
  return t ? { title: t.nome } : {};
}

const RECENTES = 30;

export default async function Tema({ params }: Props) {
  const t = temaPorId.get((await params).tema);
  if (!t) notFound();
  const lista = todasIniciativas().filter((i) => i.temas.includes(t.id));
  const porEstado = (e: EstadoIniciativa) => lista.filter((i) => i.estado === e).length;
  const autores = new Map<string, number>();
  for (const i of lista) for (const a of i.autores) autores.set(a, (autores.get(a) ?? 0) + 1);

  return (
    <div className="dentro pagina">
      <p className="migalhas">
        <Link href="/temas">Temas</Link>
      </p>
      <h1 className="display">
        <span aria-hidden="true">{t.icone} </span>
        {t.nome}
      </h1>
      <p>
        {num(lista.length)} iniciativas sobre este tema nesta legislatura: projetos e propostas de lei, de resolução
        e outras.
      </p>
      <div className="numeros">
        {(["publicada", "rejeitada", "em_curso", "retirada"] as EstadoIniciativa[]).map((e) => (
          <div className="cartao" key={e}>
            <strong>{num(porEstado(e))}</strong>
            <span>{ESTADO[e].toLowerCase()}</span>
          </div>
        ))}
      </div>

      <div className="colunas" style={{ marginTop: "2rem", alignItems: "start" }}>
        <div>
          <h2>Mais recentes</h2>
          <ul className="lista">
            {lista.slice(0, RECENTES).map((i) => (
              <LinhaIniciativa key={i.id} i={i} />
            ))}
          </ul>
          {lista.length > RECENTES && (
            <details>
              <summary>Ver as outras {lista.length - RECENTES}</summary>
              <ul className="lista">
                {lista.slice(RECENTES).map((i) => (
                  <LinhaIniciativa key={i.id} i={i} />
                ))}
              </ul>
            </details>
          )}
        </div>
        <div className="cartao">
          <h3>Quem apresentou</h3>
          <p className="nota">
            Número de iniciativas deste tema por autor, por ordem alfabética. Uma iniciativa pode ter vários autores.
          </p>
          <ul className="lista">
            {[...autores.entries()]
              .sort((a, b) => a[0].localeCompare(b[0], "pt"))
              .map(([a, n]) => (
                <li key={a} style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <span>{a}</span>
                  <span className="nota">{num(n)}</span>
                </li>
              ))}
          </ul>
        </div>
      </div>
      <p className="nota" style={{ marginTop: "1.5rem" }}>
        Palavras usadas para este tema: {t.palavras.map((p) => p.replace(/\$$/, "")).join(", ")}. Viu uma iniciativa no
        tema errado? <Link href="/metodologia#correcoes">Diga-nos</Link>.
      </p>
      <Fonte texto="iniciativas, autores e fases" />
    </div>
  );
}
