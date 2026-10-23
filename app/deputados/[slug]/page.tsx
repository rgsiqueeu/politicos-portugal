import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Fonte from "@/components/Fonte";
import { ANO_REMUNERACOES, VENCIMENTO_BASE, euros } from "@/lib/remuneracoes";
import { TEMAS } from "@/lib/temas";
import {
  AR,
  PRESENCA,
  SENTIDO,
  cargoDeputado,
  circuloSlug,
  data,
  foto,
  grupoPresenca,
  idade,
  meta,
  num,
  perfil,
  reunioes,
  slugs,
} from "@/lib/dados";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return slugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = perfil((await params).slug);
  return p ? { title: `${p.nome} (${p.gp})` } : {};
}

const RECENTES = 20;

const GRUPOS_LEGENDA = [
  ["presenca", "Presença"],
  ["missao", "Missão parlamentar"],
  ["falta_justificada", "Falta justificada"],
  ["falta", "Falta"],
  ["fora", "Fora do exercício do mandato"],
] as const;

export default async function Cracha({ params }: Props) {
  const p = perfil((await params).slug);
  if (!p) notFound();
  const m = meta();
  const todas = reunioes();
  const nomeGrupo = new Map(m.grupos.map((g) => [g.sigla, g.nome]));
  const cargo = cargoDeputado(p.sexo);
  const anos = idade(p.nascimento);

  const presPorReuniao = new Map(p.presencas.map((x) => [x.reuniao, x]));
  const contagem = new Map<string, number>();
  for (const x of p.presencas) {
    const rotulo = PRESENCA[x.codigo]?.texto ?? `Código ${x.codigo} (significado por confirmar)`;
    contagem.set(rotulo, (contagem.get(rotulo) ?? 0) + 1);
  }
  const presentes = p.presencas.filter((x) => grupoPresenca(x.codigo) === "presenca").length;
  // Por motivo: quantas reuniões e entre que datas (uma licença apanha várias reuniões seguidas).
  const motivos = new Map<string, { n: number; de: string; ate: string }>();
  for (const x of p.presencas) {
    if (!x.motivo) continue;
    const m = motivos.get(x.motivo);
    motivos.set(x.motivo, m ? { n: m.n + 1, de: m.de < x.data ? m.de : x.data, ate: m.ate > x.data ? m.ate : x.data } : { n: 1, de: x.data, ate: x.data });
  }

  const intervPorTipo = new Map<string, number>();
  for (const i of p.intervencoes) intervPorTipo.set(i.tipo ?? "Sem tipo", (intervPorTipo.get(i.tipo ?? "Sem tipo") ?? 0) + 1);
  const perguntas = p.requerimentos.filter((r) => r.tipo === "PER").length;
  const requerimentos = p.requerimentos.length - perguntas;
  const saida = !p.emFuncoes ? p.situacoes.at(-1) : null;

  // Do que mais tratou: temas das suas iniciativas, intervenções e perguntas (palavras-chave, ver /metodologia#temas).
  const temas = TEMAS.map((t) => ({
    ...t,
    ini: p.iniciativas.filter((i) => i.temas?.includes(t.id)).length,
    int: p.intervencoes.filter((i) => i.temas?.includes(t.id)).length,
    req: p.requerimentos.filter((r) => r.temas?.includes(t.id)).length,
  })).map((t) => ({ ...t, total: t.ini + t.int + t.req }));

  return (
    <div className="perfil">
      <div className="perfil-topo">
        <div className="dentro">
          <p className="migalhas">
            <Link href="/deputados">Deputados</Link> ·{" "}
            <Link href={`/circulos/${circuloSlug(p.circulo)}`}>Círculo de {p.circulo}</Link>
          </p>
          <div className="cabecalho-perfil">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={foto(p.id)} alt={`Fotografia de ${p.nome}`} width={132} height={165} />
            <div>
              <h1 className="display">{p.nome}</h1>
              <p>
                {cargo} · <strong>{p.gp}</strong> ({nomeGrupo.get(p.gp ?? "") ?? p.gp}) · círculo de {p.circulo}
              </p>
              <p>
                <span className={`etiqueta${p.emFuncoes ? "" : " fora"}`}>
                  {p.emFuncoes ? "em funções" : `${p.situacaoAtual.toLowerCase()} desde ${data(saida?.inicio ?? null)}`}
                </span>
              </p>
              <p className="nota" style={{ margin: 0 }}>
                {p.nomeCompleto}
                {anos != null ? ` · ${anos} anos` : ""}
                {p.profissao ? ` · ${p.profissao}` : ""} · Fotografia: Assembleia da República
              </p>
            </div>
          </div>
      <div className="numeros">
        <div className="cartao">
          <strong>
            {num(presentes)}/{num(p.presencas.length)}
          </strong>
          <span>reuniões do plenário com presença registada</span>
        </div>
        <div className="cartao">
          <strong>{num(p.iniciativas.length)}</strong>
          <span>iniciativas como autor ou coautor</span>
        </div>
        <div className="cartao">
          <strong>{num(p.intervencoes.length)}</strong>
          <span>intervenções no plenário</span>
        </div>
        <div className="cartao">
          <strong>{num(p.requerimentos.length)}</strong>
          <span>perguntas e requerimentos ao Governo e outras entidades</span>
        </div>
        <div className="cartao">
          <strong>{num(p.desviosBancada.length)}</strong>
          <span>votações em que votou diferente da bancada</span>
        </div>
        <div className="cartao">
          <strong>{Math.floor(VENCIMENTO_BASE)} €</strong>
          <span>
            de vencimento por mês ({euros(VENCIMENTO_BASE)} ilíquidos em {ANO_REMUNERACOES}), igual para todos.{" "}
            <Link href="/metodologia#remuneracoes">Acréscimos por cargo</Link>
          </span>
        </div>
      </div>
          <Fonte texto={`${m.legislatura} Legislatura, desde ${data(m.inicioLegislatura)}`} />
        </div>
      </div>
      <div className="dentro">

      <h2>Do que tratou, por tema</h2>
      <p className="nota">
        Os 16 temas, com o número de iniciativas, intervenções e perguntas desta pessoa em cada um (como autor ou
        coautor). Os temas saem de palavras do título ou resumo oficial, com a mesma regra para toda a gente.{" "}
        <Link href="/metodologia#temas">Como contamos</Link>.
      </p>
      <ul className="temas temas-perfil">
        {temas.map((t) => (
          <li key={t.id}>
            <Link href={`/temas/${t.id}`} className={`tema${t.total === 0 ? " vazio" : ""}`}>
              <span className="cab-tema">
                <span className="icone-tema" aria-hidden="true">
                  {t.icone}
                </span>
                <b className="total-tema">{num(t.total)}</b>
              </span>
              <strong>{t.nome}</strong>
              <small>
                {t.total === 0
                  ? "nada registado"
                  : [
                      t.ini && `${t.ini} ${t.ini === 1 ? "iniciativa" : "iniciativas"}`,
                      t.int && `${t.int} ${t.int === 1 ? "intervenção" : "intervenções"}`,
                      t.req && `${t.req} ${t.req === 1 ? "pergunta" : "perguntas"}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
              </small>
            </Link>
          </li>
        ))}
      </ul>
      <Fonte texto="iniciativas, intervenções e perguntas" />

      <h2>Presença no plenário</h2>
      <p>
        Esteve presente em {num(presentes)} das {num(p.presencas.length)} reuniões plenárias em que estava em
        exercício. Reuniões antes da posse ou durante suspensão ou substituição aparecem a cinzento e não contam.
      </p>
      <div className="grelha" aria-label="Uma marca por reunião plenária, por ordem de data">
        {todas.map((r) => {
          const x = presPorReuniao.get(r.id);
          const g = x ? grupoPresenca(x.codigo) : "fora";
          const rotulo = x ? (PRESENCA[x.codigo]?.texto ?? `Código ${x.codigo}`) : "Fora do exercício do mandato";
          return (
            <a
              key={r.id}
              className={`q-${g}`}
              href={AR.reuniao(r.id)}
              title={`${data(r.data)} · reunião n.º ${r.numero} · ${rotulo}${x?.motivo ? ` (${x.motivo})` : ""}`}
              aria-label={`${data(r.data)}: ${rotulo}`}
            />
          );
        })}
      </div>
      <ul className="legenda">
        {GRUPOS_LEGENDA.map(([g, t]) => (
          <li key={g}>
            <span className={`q q-${g}`} />
            {t}
          </li>
        ))}
      </ul>
      <div className="colunas" style={{ marginTop: "1rem" }}>
        <div className="tabela">
          <table>
            <thead>
              <tr>
                <th>Registo oficial</th>
                <th style={{ textAlign: "right" }}>Reuniões</th>
              </tr>
            </thead>
            <tbody>
              {[...contagem.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([t, n]) => (
                  <tr key={t}>
                    <td>{t}</td>
                    <td className="n">{n}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {motivos.size > 0 && (
          <div className="tabela">
            <table>
              <thead>
                <tr>
                  <th>Motivo da falta justificada</th>
                  <th>Período</th>
                  <th style={{ textAlign: "right" }}>Reuniões</th>
                </tr>
              </thead>
              <tbody>
                {[...motivos.entries()]
                  .sort((a, b) => b[1].n - a[1].n)
                  .map(([t, m]) => (
                    <tr key={t}>
                      <td>{t}</td>
                      <td>
                        <small>{m.de === m.ate ? data(m.de) : `${data(m.de)} a ${data(m.ate)}`}</small>
                      </td>
                      <td className="n">{m.n}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="nota" style={{ marginTop: ".75rem" }}>
        Os números contam reuniões, não ausências separadas: uma licença ou uma baixa apanha várias reuniões
        seguidas. O plenário reúne normalmente duas a três vezes por semana.
      </p>
      <Fonte texto="presenças publicadas por reunião plenária" />

      <h2>Votações em que votou diferente da bancada</h2>
      <p className="nota">
        Na Assembleia da República o voto regista-se quase sempre por grupo parlamentar. Aqui estão só as votações
        em que a ata nomeia esta pessoa com um sentido de voto diferente do da sua bancada.
      </p>
      {p.desviosBancada.length === 0 ? (
        <p>Nenhuma votação com voto nominal diferente da bancada nesta legislatura.</p>
      ) : (
        <div className="tabela">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>O que se votou</th>
                <th>Votou</th>
                <th>Bancada</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {p.desviosBancada.map((d) => (
                <tr key={d.votacao}>
                  <td>{data(d.data)}</td>
                  <td>
                    {d.iniciativas.map((i) => (
                      <div key={i.id}>
                        <a href={AR.iniciativa(i.id)}>
                          {i.tipo} n.º {i.numero}
                        </a>
                        : {i.titulo}
                      </div>
                    ))}
                    <small>
                      {d.fase}
                      {d.diario ? (
                        <>
                          {" · "}
                          <a href={d.diario}>Diário da Assembleia</a>
                        </>
                      ) : null}
                    </small>
                  </td>
                  <td>{SENTIDO[d.sentido]}</td>
                  <td>{d.sentidoBancada ? SENTIDO[d.sentidoBancada] : "—"}</td>
                  <td>{d.resultado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Fonte texto="detalhe de cada votação" />

      <h2>Iniciativas</h2>
      <p className="nota">
        Projetos de lei, de resolução e outras iniciativas em que figura como autor ou coautor. Muitas são
        assinadas por toda a bancada, por isso o número inclui coautorias.
      </p>
      {p.iniciativas.length === 0 ? (
        <p>Sem iniciativas registadas nesta legislatura.</p>
      ) : (
        <ListaIniciativas itens={p.iniciativas} />
      )}
      <Fonte />

      <h2>Intervenções no plenário</h2>
      {p.intervencoes.length === 0 ? (
        <p>Sem intervenções registadas nesta legislatura.</p>
      ) : (
        <>
          <p>
            {[...intervPorTipo.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([t, n]) => `${n} ${t.toLowerCase()}`)
              .join(" · ")}
          </p>
          <ul className="lista">
            {p.intervencoes.slice(0, RECENTES).map((i) => (
              <li key={i.id}>
                <small>
                  {data(i.data)} · {i.tipo ?? "Intervenção"}
                </small>
                <br />
                <span className="resumo-longo" title={i.sumario ?? undefined}>
                  {i.sumario ?? "—"}
                </span>
              </li>
            ))}
          </ul>
          {p.intervencoes.length > RECENTES && (
            <p className="nota">
              Mostramos as {RECENTES} mais recentes. <a href={AR.atividade(p.id)}>Todas no site da Assembleia</a>.
            </p>
          )}
        </>
      )}
      <Fonte />

      <h2>Perguntas e requerimentos</h2>
      {p.requerimentos.length === 0 ? (
        <p>Sem perguntas ou requerimentos registados nesta legislatura.</p>
      ) : (
        <>
          <p>
            {num(perguntas)} perguntas · {num(requerimentos)} requerimentos (como autor ou coautor)
          </p>
          <ul className="lista">
            {p.requerimentos.slice(0, RECENTES).map((r) => (
              <li key={r.id}>
                <small>
                  {data(r.data)} · {r.tipo === "PER" ? "Pergunta" : "Requerimento"} n.º {r.numero}
                </small>
                <br />
                {r.assunto}
              </li>
            ))}
          </ul>
          {p.requerimentos.length > RECENTES && (
            <p className="nota">
              Mostramos os {RECENTES} mais recentes. <a href={AR.atividade(p.id)}>Todos no site da Assembleia</a>.
            </p>
          )}
        </>
      )}
      <Fonte />

      <h2>Comissões e grupos</h2>
      <div className="colunas">
        <div>
          <h3>Comissões parlamentares</h3>
          {p.comissoes.length === 0 ? (
            <p>—</p>
          ) : (
            <ul className="lista">
              {p.comissoes.map((c, i) => (
                <li key={i}>
                  {c.nome}
                  <br />
                  <small>{[c.cargo === "CGP" ? "Coordenação do grupo parlamentar" : c.cargo, c.situacao].filter(Boolean).join(" · ") || "—"}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h3>Grupos parlamentares de amizade</h3>
          {p.gruposAmizade.length === 0 ? (
            <p>—</p>
          ) : (
            <ul className="lista">
              {p.gruposAmizade.map((g, i) => (
                <li key={i}>
                  {g.nome}
                  <br />
                  <small>{g.cargo ?? "—"}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <Fonte />

      <h2>Percurso nesta legislatura</h2>
      <div className="tabela">
        <table>
          <thead>
            <tr>
              <th>Situação</th>
              <th>De</th>
              <th>Até</th>
            </tr>
          </thead>
          <tbody>
            {p.situacoes.map((s, i) => (
              <tr key={i}>
                <td>{s.situacao}</td>
                <td>{data(s.inicio)}</td>
                <td>{s.fim ? data(s.fim) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(p.habilitacoes.length > 0 || p.cargosFuncoes.length > 0) && (
        <div className="colunas" style={{ marginTop: "1rem" }}>
          {p.habilitacoes.length > 0 && (
            <div>
              <h3>Habilitações</h3>
              <ul className="lista">
                {p.habilitacoes.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}
          {p.cargosFuncoes.length > 0 && (
            <div>
              <h3>Cargos e funções declarados</h3>
              <ul className="lista">
                {p.cargosFuncoes.map((f, i) => (
                  <li key={i}>
                    {f.texto}
                    {f.antigo ? <small> · anterior</small> : null}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <Fonte texto="registo biográfico" />

      <h2>O que não aparece aqui</h2>
      <p>
        Despesas, rendimentos, património e registo de interesses não estão nos dados abertos da Assembleia da
        República, por isso não os mostramos. <Link href="/metodologia">Ver o que cobrimos e o que não cobrimos</Link>.
      </p>
      <p>
        <a href={AR.biografia(p.id)}>Página oficial na Assembleia da República</a> ·{" "}
        <Link href="/metodologia#correcoes">Reportar erro</Link>
      </p>
      </div>
    </div>
  );
}

function ListaIniciativas({ itens }: { itens: NonNullable<ReturnType<typeof perfil>>["iniciativas"] }) {
  const porTipo = new Map<string, number>();
  for (const i of itens) porTipo.set(i.tipo, (porTipo.get(i.tipo) ?? 0) + 1);
  const linha = (i: (typeof itens)[number]) => (
    <li key={i.id}>
      <small>
        {data(i.entrada)} · {i.tipo} n.º {i.numero}
        {i.ultimaFase ? ` · fase atual: ${i.ultimaFase}` : ""}
      </small>
      <br />
      <a href={AR.iniciativa(i.id)}>{i.titulo}</a>
    </li>
  );
  return (
    <>
      <p>
        {[...porTipo.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([t, n]) => `${n} ${t.toLowerCase()}`)
          .join(" · ")}
      </p>
      <ul className="lista">{itens.slice(0, RECENTES).map(linha)}</ul>
      {itens.length > RECENTES && (
        <details>
          <summary>Ver as outras {itens.length - RECENTES}</summary>
          <ul className="lista">{itens.slice(RECENTES).map(linha)}</ul>
        </details>
      )}
    </>
  );
}
