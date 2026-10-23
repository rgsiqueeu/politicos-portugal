import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Fonte from "@/components/Fonte";
import Alternar from "@/components/Alternar";
import MapaCirculos from "@/components/MapaCirculos";
import MapaPortugal from "@/components/MapaPortugal";
import { circuloSlug, deputados, meta, miniatura } from "@/lib/dados";

type Props = { params: Promise<{ circulo: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return meta().circulos.map((c) => ({ circulo: circuloSlug(c.nome) }));
}

const encontrar = (slug: string) => meta().circulos.find((c) => circuloSlug(c.nome) === slug);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = encontrar((await params).circulo);
  return c ? { title: `Círculo de ${c.nome}` } : {};
}

export default async function Circulo({ params }: Props) {
  const c = encontrar((await params).circulo);
  if (!c) notFound();
  const todos = deputados().filter((d) => d.circulo === c.nome);
  const em = todos.filter((d) => d.emFuncoes);
  const sairam = todos.filter((d) => !d.emFuncoes);
  const contagem: Record<string, number> = {};
  for (const d of deputados().filter((x) => x.emFuncoes)) contagem[d.circulo] = (contagem[d.circulo] ?? 0) + 1;
  const cartao = (d: (typeof todos)[number]) => (
    <li key={d.id}>
      <Link className="pessoa" href={`/deputados/${d.slug}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={miniatura(d.id)} alt="" loading="lazy" width={48} height={60} />
        <span>
          <strong>{d.nome}</strong>
          <small>
            {d.gp}
            {d.emFuncoes ? "" : ` · ${d.situacaoAtual.toLowerCase()}`}
          </small>
        </span>
      </Link>
    </li>
  );
  return (
    <div className="dentro pagina">
      <p className="migalhas">
        <Link href="/circulos">O meu círculo</Link>
      </p>
      <h1 className="display">{c.nome}</h1>
      <p>{em.length} deputados em funções eleitos por este círculo, por ordem alfabética.</p>
      <div className="mapa-e-lista">
        <Alternar
          mapa={<MapaPortugal contagem={contagem} atual={c.nome} />}
          quadrados={<MapaCirculos contagem={contagem} atual={c.nome} />}
        />
        <div>
          <ul className="pessoas">{em.map(cartao)}</ul>
          {sairam.length > 0 && (
            <>
              <h2 style={{ marginTop: "2rem" }}>Também eleitos por {c.nome} nesta legislatura, já fora de funções</h2>
              <ul className="pessoas">{sairam.map(cartao)}</ul>
            </>
          )}
        </div>
      </div>
      <Fonte />
    </div>
  );
}
