"use client";

import { useMemo, useState } from "react";
import type { Votacao } from "@/lib/dados";

const semAcentos = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Filtra as votações; os cartões chegam já desenhados do servidor, indexados pelo id.
export default function ListaVotacoes({
  votacoes,
  cartoes,
  temas,
}: {
  votacoes: Pick<Votacao, "id" | "resultado" | "unanime" | "iniciativas" | "descricao" | "temas">[];
  cartoes: Record<string, React.ReactNode>;
  temas: { id: string; nome: string }[];
}) {
  const [tema, setTema] = useState("");
  const [q, setQ] = useState("");
  const [resultado, setResultado] = useState("");
  const [mostrar, setMostrar] = useState(30);
  const filtradas = useMemo(() => {
    const t = semAcentos(q.trim());
    return votacoes.filter(
      (v) =>
        (!resultado || (resultado === "unanime" ? v.unanime : v.resultado === resultado)) &&
        (!tema || v.temas.includes(tema)) &&
        (!t || semAcentos(`${v.iniciativas.map((i) => `${i.titulo} ${i.tipo} ${i.numero}`).join(" ")} ${v.descricao ?? ""}`).includes(t)),
    );
  }, [votacoes, q, resultado, tema]);
  return (
    <>
      <div className="filtros" role="search">
        <input type="search" placeholder="Procurar por tema ou título (ex.: habitação, saúde)" aria-label="Procurar votações" value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="Tema" value={tema} onChange={(e) => setTema(e.target.value)}>
          <option value="">Todos os temas</option>
          {temas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
        <select aria-label="Resultado" value={resultado} onChange={(e) => setResultado(e.target.value)}>
          <option value="">Todos os resultados</option>
          <option value="Aprovado">Aprovadas</option>
          <option value="Rejeitado">Rejeitadas</option>
          <option value="unanime">Por unanimidade</option>
        </select>
      </div>
      <p className="nota" aria-live="polite">
        {filtradas.length} votações
      </p>
      <ul className="votacoes">{filtradas.slice(0, mostrar).map((v) => cartoes[v.id])}</ul>
      {filtradas.length > mostrar && (
        <p style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button className="chip" type="button" onClick={() => setMostrar((m) => m + 30)} style={{ cursor: "pointer", font: "inherit" }}>
            Mostrar mais
          </button>
        </p>
      )}
    </>
  );
}
