"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Item = { tipo: "deputado" | "circulo"; href: string; titulo: string; sub: string; foto?: string };

const semAcentos = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function Pesquisa({ itens, placeholder }: { itens: Item[]; placeholder: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const resultados = useMemo(() => {
    const t = semAcentos(q.trim());
    if (t.length < 2) return [];
    const bate = (i: Item) => semAcentos(`${i.titulo} ${i.sub}`).includes(t);
    return [...itens.filter((i) => i.tipo === "circulo" && bate(i)).slice(0, 3), ...itens.filter((i) => i.tipo === "deputado" && bate(i)).slice(0, 8)];
  }, [q, itens]);

  return (
    <div className="pesquisa" role="search">
      <svg className="lupa" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={q}
        placeholder={placeholder}
        aria-label={placeholder}
        aria-autocomplete="list"
        aria-controls="resultados-pesquisa"
        autoComplete="off"
        onChange={(e) => {
          setQ(e.target.value);
          setSel(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setSel((s) => Math.min(s + 1, resultados.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSel((s) => Math.max(s - 1, 0));
          } else if (e.key === "Enter" && resultados[sel]) {
            router.push(resultados[sel].href);
          } else if (e.key === "Escape") {
            setQ("");
          }
        }}
      />
      {q.trim().length >= 2 && (
        <ul className="resultados" id="resultados-pesquisa" role="listbox">
          {resultados.length === 0 ? (
            <li className="vazio">Sem resultados para “{q}”.</li>
          ) : (
            resultados.map((r, i) => (
              <li key={r.href} role="option" aria-selected={i === sel}>
                <a href={r.href} className={i === sel ? "ativo" : undefined} onMouseEnter={() => setSel(i)}>
                  {r.foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.foto} alt="" loading="lazy" />
                  ) : (
                    <span className="icone-circulo" aria-hidden="true">
                      ⌖
                    </span>
                  )}
                  <span>
                    <strong>{r.titulo}</strong>
                    <small>{r.sub}</small>
                  </span>
                </a>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
