import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Fonte from "@/components/Fonte";
import { circuloSlug, deputados, meta } from "@/lib/dados";

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
  return (
    <>
      <p className="nota">
        <Link href="/circulos">Quem me representa</Link>
      </p>
      <h1>Círculo de {c.nome}</h1>
      <p>
        {em.length} deputados em funções eleitos por este círculo, por ordem alfabética.
      </p>
      <ul className="lista az">
        {em.map((d) => (
          <li key={d.id}>
            <Link href={`/deputados/${d.slug}`}>{d.nome}</Link>
            <br />
            <small>{d.gp}</small>
          </li>
        ))}
      </ul>
      {sairam.length > 0 && (
        <>
          <h2>Também eleitos por {c.nome} nesta legislatura, já fora de funções</h2>
          <ul className="lista az">
            {sairam.map((d) => (
              <li key={d.id}>
                <Link href={`/deputados/${d.slug}`}>{d.nome}</Link>
                <br />
                <small>
                  {d.gp} · {d.situacaoAtual.toLowerCase()}
                </small>
              </li>
            ))}
          </ul>
        </>
      )}
      <Fonte />
    </>
  );
}
