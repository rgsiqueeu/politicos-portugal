"use client";

import Link from "next/link";
import { useEstatisticas } from "./VivoAgora";

type Pessoa = { slug: string; id: string; nome: string; gp: string | null };

const n = (x: number) => x.toLocaleString("pt-PT");
const nomePais = (codigo: string | null) => {
  if (!codigo) return "";
  try {
    return new Intl.DisplayNames(["pt-PT"], { type: "region" }).of(codigo) ?? codigo;
  } catch {
    return codigo;
  }
};

export default function MaisVistos({ pessoas, completo = false }: { pessoas: Pessoa[]; completo?: boolean }) {
  const e = useEstatisticas();
  const porSlug = new Map(pessoas.map((p) => [p.slug, p]));
  if (!e) return <p className="nota">A carregar números ao vivo…</p>;
  const vistos = e.maisVistos
    .map((m) => ({ ...m, p: porSlug.get(m.caminho.replace("/deputados/", "")) }))
    .filter((m) => m.p)
    .slice(0, completo ? 10 : 5);
  return (
    <div className="ao-vivo">
      <div className="grande escuro">
        <strong>{n(e.agora)}</strong>
        <span>
          <span className="ponto-vivo" aria-hidden="true" />
          {e.agora === 1 ? "pessoa no site agora" : "pessoas no site agora"}
        </span>
        <p style={{ margin: "1rem 0 0", color: "rgb(255 255 255 / 85%)" }}>
          {n(e.hoje)} hoje · {n(e.ultimas24h)} nas últimas 24 horas · {n(e.pessoasDesdeInicio)} desde{" "}
          {e.desde ? new Date(e.desde).toLocaleDateString("pt-PT") : "o início"}
        </p>
      </div>
      <div className="cartao">
        <h3>Perfis mais abertos nas últimas 24 horas</h3>
        <p className="nota">Conta quantas pessoas abriram o perfil. Não mede apoio, aprovação nem voto.</p>
        {vistos.length === 0 ? (
          <p className="nota">Ainda sem dados suficientes.</p>
        ) : (
          <ol className="ranking-neutro">
            {vistos.map(({ p, pessoas: k }) => (
              <li key={p!.slug}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/fotos/p/${p!.id}.webp`} alt="" />
                <Link href={`/deputados/${p!.slug}`}>{p!.nome}</Link>
                <small>{p!.gp}</small>
                <span className="n">{n(k)} {k === 1 ? "pessoa" : "pessoas"}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
      <div className="cartao">
        <h3>De onde nos visitam</h3>
        <p className="nota">
          Últimos 7 dias. Cidade aproximada, a partir da ligação à internet. Só mostramos cidades com pelo menos 5
          pessoas, para ninguém ser identificável.
        </p>
        {e.cidades.length === 0 ? (
          <p className="nota">Ainda sem cidades com 5 ou mais pessoas.</p>
        ) : (
          <ol className="ranking-neutro">
            {e.cidades.slice(0, completo ? 12 : 6).map((c) => (
              <li key={`${c.cidade}-${c.pais}`}>
                <span>
                  {c.cidade}
                  {c.pais && c.pais !== "PT" ? <small> · {nomePais(c.pais)}</small> : null}
                </span>
                <span className="n">{n(c.pessoas)} pessoas</span>
              </li>
            ))}
          </ol>
        )}
        {completo && e.paises.length > 0 && (
          <>
            <h3 style={{ marginTop: "1.25rem" }}>Países</h3>
            <ol className="ranking-neutro">
              {e.paises.map((c) => (
                <li key={c.pais}>
                  <span>{nomePais(c.pais)}</span>
                  <span className="n">{n(c.pessoas)} pessoas</span>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </div>
  );
}
