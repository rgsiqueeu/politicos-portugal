"use client";

import { useMemo, useState } from "react";
import MapaPortugal from "./MapaPortugal";

type Linha = { circulo: string; gp: string | null; sexo: "M" | "F" | null; idade: number | null };

const CIRCULOS_FORA = ["Europa", "Fora da Europa"];

// Níveis 1–5 por limites fixos, para a cor não depender de quem está no topo.
const porLimites = (v: number, limites: number[]) => 1 + limites.filter((l) => v >= l).length;

export default function Retrato({ linhas, circulos, grupos }: { linhas: Linha[]; circulos: string[]; grupos: { sigla: string; nome: string }[] }) {
  const [indicador, setIndicador] = useState("deputados");

  const porCirculo = useMemo(() => {
    const m = new Map<string, Linha[]>();
    for (const c of circulos) m.set(c, []);
    for (const l of linhas) m.get(l.circulo)?.push(l);
    return m;
  }, [linhas, circulos]);

  const contagem = Object.fromEntries([...porCirculo].map(([c, ls]) => [c, ls.length]));

  const vista = useMemo(() => {
    const niveis: Record<string, number> = {};
    const etiquetas: Record<string, string> = {};
    const detalhes: Record<string, string> = {};
    let titulo = "";
    let nota = "";
    for (const [c, ls] of porCirculo) {
      const n = ls.length;
      if (indicador === "deputados") {
        titulo = "Deputados eleitos por círculo";
        niveis[c] = n <= 3 ? 1 : n <= 6 ? 2 : n <= 10 ? 3 : n <= 20 ? 4 : 5;
        etiquetas[c] = String(n);
        detalhes[c] = `${n} ${n === 1 ? "deputado" : "deputados"}`;
      } else if (indicador === "mulheres") {
        titulo = "Mulheres entre os deputados de cada círculo (%)";
        nota = "Nos círculos pequenos, uma pessoa muda muito a percentagem.";
        const f = ls.filter((l) => l.sexo === "F").length;
        const pct = n ? Math.round((f / n) * 100) : 0;
        niveis[c] = n ? porLimites(pct, [20, 30, 40, 50]) : 0;
        etiquetas[c] = String(pct);
        detalhes[c] = `${f} ${f === 1 ? "mulher" : "mulheres"} em ${n} deputados (${pct}%)`;
      } else if (indicador === "idade") {
        titulo = "Idade média dos deputados de cada círculo";
        nota = "Idade segundo a data de nascimento do registo biográfico.";
        const idades = ls.map((l) => l.idade).filter((x): x is number => x != null);
        const media = idades.length ? Math.round(idades.reduce((a, b) => a + b, 0) / idades.length) : null;
        niveis[c] = media == null ? 0 : porLimites(media, [45, 50, 55, 60]);
        etiquetas[c] = media == null ? "—" : String(media);
        detalhes[c] = media == null ? "sem dados" : `idade média de ${media} anos (${idades.length} deputados)`;
      } else {
        const g = grupos.find((x) => x.sigla === indicador);
        titulo = `Deputados do ${g?.sigla ?? indicador} por círculo`;
        nota = "A cor mostra quantos deputados deste grupo foram eleitos em cada círculo. É sempre a mesma cor, para qualquer partido.";
        const k = ls.filter((l) => l.gp === indicador).length;
        niveis[c] = k === 0 ? 0 : k <= 1 ? 1 : k <= 3 ? 2 : k <= 6 ? 3 : k <= 12 ? 4 : 5;
        etiquetas[c] = String(k);
        detalhes[c] = `${k} de ${n} deputados do círculo`;
      }
    }
    return { niveis, etiquetas, detalhes, titulo, nota };
  }, [indicador, porCirculo, grupos]);

  return (
    <div>
      <div className="filtros">
        <label htmlFor="indicador" className="nota">
          Mostrar no mapa:
        </label>
        <select id="indicador" value={indicador} onChange={(e) => setIndicador(e.target.value)}>
          <option value="deputados">Número de deputados</option>
          <option value="mulheres">Mulheres (%)</option>
          <option value="idade">Idade média</option>
          <optgroup label="Grupo parlamentar">
            {grupos.map((g) => (
              <option key={g.sigla} value={g.sigla}>
                {g.sigla} · {g.nome}
              </option>
            ))}
          </optgroup>
        </select>
      </div>
      <h2 style={{ marginTop: ".5rem" }}>{vista.titulo}</h2>
      {vista.nota && <p className="nota">{vista.nota}</p>}
      <div className="mapa-e-lista">
        <MapaPortugal contagem={contagem} niveis={vista.niveis} etiquetas={vista.etiquetas} detalhes={vista.detalhes} />
        <div className="tabela">
          <table>
            <thead>
              <tr>
                <th>Círculo</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {[...circulos.filter((c) => !CIRCULOS_FORA.includes(c)), ...CIRCULOS_FORA].map((c) => (
                <tr key={c}>
                  <td>{c}</td>
                  <td>{vista.detalhes[c]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
