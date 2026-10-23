import Link from "next/link";
import ListaDeputados from "@/components/ListaDeputados";
import Fonte from "@/components/Fonte";
import { deputados, meta, num } from "@/lib/dados";

export default function Inicio() {
  const m = meta();
  const todos = deputados();
  const emFuncoes = todos.filter((d) => d.emFuncoes);
  const siglas = [...new Set(todos.map((d) => d.gp).filter((g): g is string => !!g))].sort((a, b) =>
    a.localeCompare(b, "pt"),
  );
  const circulos = m.circulos.map((c) => c.nome);
  const nomeGrupo = new Map(m.grupos.map((g) => [g.sigla, g.nome]));

  return (
    <>
      <h1>Quem nos representa na Assembleia da República</h1>
      <p>
        Os {num(emFuncoes.length)} deputados em funções na {m.legislatura} Legislatura: quem são, de que círculo
        vêm, se estiveram nas reuniões do plenário, o que propuseram e quando votaram de forma diferente da sua
        bancada. Só dados oficiais, em linguagem simples.
      </p>
      <p>
        <Link href="/circulos">Escolher o meu círculo eleitoral →</Link>
      </p>

      <div className="numeros">
        <div className="cartao">
          <strong>{num(emFuncoes.length)}</strong>
          <span>deputados em funções</span>
        </div>
        <div className="cartao">
          <strong>{m.circulos.length}</strong>
          <span>círculos eleitorais</span>
        </div>
        <div className="cartao">
          <strong>{num(m.contagens.reunioesPlenario)}</strong>
          <span>reuniões do plenário com presenças publicadas</span>
        </div>
        <div className="cartao">
          <strong>{num(m.contagens.votacoesPlenario)}</strong>
          <span>votações no plenário</span>
        </div>
      </div>

      <h2>Composição</h2>
      <p className="nota">Por ordem alfabética da sigla. A cor não é usada para partidos.</p>
      <div className="tabela">
        <table>
          <thead>
            <tr>
              <th>Grupo parlamentar</th>
              <th style={{ textAlign: "right" }}>Deputados em funções</th>
            </tr>
          </thead>
          <tbody>
            {siglas.map((s) => (
              <tr key={s}>
                <td>
                  {s} <small>· {nomeGrupo.get(s) ?? ""}</small>
                </td>
                <td className="n">{emFuncoes.filter((d) => d.gp === s).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Fonte />

      <h2>Todos, de A a Z</h2>
      <ListaDeputados deputados={todos} grupos={siglas} circulos={circulos} />
      <Fonte />
    </>
  );
}
