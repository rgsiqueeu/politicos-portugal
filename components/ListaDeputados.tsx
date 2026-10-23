"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Resumo } from "@/lib/dados";

const semAcentos = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function ListaDeputados({
  deputados,
  grupos,
  circulos,
}: {
  deputados: Resumo[];
  grupos: string[];
  circulos: string[];
}) {
  const [texto, setTexto] = useState("");
  const [gp, setGp] = useState("");
  const [circulo, setCirculo] = useState("");
  const [todos, setTodos] = useState(false);

  const filtrados = useMemo(() => {
    const t = semAcentos(texto.trim());
    return deputados.filter(
      (d) =>
        (todos || d.emFuncoes) &&
        (!gp || d.gp === gp) &&
        (!circulo || d.circulo === circulo) &&
        (!t || semAcentos(`${d.nome} ${d.nomeCompleto}`).includes(t)),
    );
  }, [deputados, texto, gp, circulo, todos]);

  const porLetra = useMemo(() => {
    const m = new Map<string, Resumo[]>();
    for (const d of filtrados) {
      const l = semAcentos(d.nome[0]).toUpperCase();
      m.set(l, [...(m.get(l) ?? []), d]);
    }
    return [...m.entries()];
  }, [filtrados]);

  return (
    <>
      <div className="filtros" role="search">
        <input
          type="search"
          placeholder="Nome"
          aria-label="Procurar por nome"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <select aria-label="Grupo parlamentar" value={gp} onChange={(e) => setGp(e.target.value)}>
          <option value="">Grupo parlamentar: todos</option>
          {grupos.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <select aria-label="Círculo eleitoral" value={circulo} onChange={(e) => setCirculo(e.target.value)}>
          <option value="">Círculo: todos</option>
          {circulos.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <label className="nota" style={{ display: "flex", alignItems: "center", gap: ".35rem" }}>
          <input type="checkbox" checked={todos} onChange={(e) => setTodos(e.target.checked)} />
          incluir quem já saiu nesta legislatura
        </label>
      </div>
      <p className="nota" aria-live="polite">
        {filtrados.length} {filtrados.length === 1 ? "pessoa" : "pessoas"}, de A a Z
      </p>
      <ul className="lista az">
        {porLetra.map(([letra, lista]) => [
          <li key={`l-${letra}`} className="letra" aria-hidden="true">
            {letra}
          </li>,
          ...lista.map((d) => (
            <li key={d.id}>
              <Link href={`/deputados/${d.slug}`}>{d.nome}</Link>
              <br />
              <small>
                {d.gp} · {d.circulo}
                {d.emFuncoes ? "" : ` · ${d.situacaoAtual.toLowerCase()}`}
              </small>
            </li>
          )),
        ])}
      </ul>
    </>
  );
}
