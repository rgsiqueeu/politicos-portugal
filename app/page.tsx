import Link from "next/link";
import CartaoVotacao from "@/components/CartaoVotacao";
import Alternar from "@/components/Alternar";
import MapaCirculos from "@/components/MapaCirculos";
import MapaPortugal from "@/components/MapaPortugal";
import MaisVistos from "@/components/MaisVistos";
import Pesquisa from "@/components/Pesquisa";
import VivoAgora from "@/components/VivoAgora";
import { circuloSlug, data, deputados, meta, miniatura, num, todasIniciativas, votacoes } from "@/lib/dados";
import { TEMAS } from "@/lib/temas";

export default function Inicio() {
  const m = meta();
  const f = m.factos;
  const todos = deputados();
  const emFuncoes = todos.filter((d) => d.emFuncoes);
  const contagem: Record<string, number> = {};
  for (const d of emFuncoes) contagem[d.circulo] = (contagem[d.circulo] ?? 0) + 1;
  const pct = (a: number, b: number) => Math.round((a / b) * 100);

  const itensPesquisa = [
    ...m.circulos.map((c) => ({
      tipo: "circulo" as const,
      href: `/circulos/${circuloSlug(c.nome)}`,
      titulo: c.nome,
      sub: `Círculo eleitoral · ${contagem[c.nome] ?? 0} deputados`,
    })),
    ...emFuncoes.map((d) => ({
      tipo: "deputado" as const,
      href: `/deputados/${d.slug}`,
      titulo: d.nome,
      sub: `${d.gp} · ${d.circulo}`,
      foto: miniatura(d.id),
    })),
  ];

  return (
    <>
      <section className="heroi">
        <div className="dentro">
          <span className="sobre">Assembleia da República · {m.legislatura} Legislatura</span>
          <h1 className="display">
            Quem <em>te</em> representa?
          </h1>
          <p className="lead">
            Os {emFuncoes.length} deputados, as votações, as presenças e o que cada um propôs. Tudo com dados oficiais,
            explicado de forma simples. Sem rankings e sem opinião.
          </p>
          <Pesquisa itens={itensPesquisa} placeholder="Escreve o nome de um deputado ou o teu distrito" />
          <div className="atalhos">
            <VivoAgora />
            <Link className="chip" href="/circulos/lisboa">
              Lisboa
            </Link>
            <Link className="chip" href="/circulos/porto">
              Porto
            </Link>
            <Link className="chip" href="/circulos/braga">
              Braga
            </Link>
            <Link className="chip" href="/circulos">
              Todos os círculos →
            </Link>
          </div>
        </div>
      </section>

      <section className="seccao">
        <div className="dentro">
          <div className="cab-seccao">
            <div>
              <h2>Os {emFuncoes.length} deputados</h2>
              <p>Por ordem alfabética. Toca num rosto para ver o perfil.</p>
            </div>
            <Link className="ver-mais" href="/deputados">
              Ver lista com filtros →
            </Link>
          </div>
          <div className="mosaico">
            {emFuncoes.map((d) => (
              <Link key={d.id} href={`/deputados/${d.slug}`} title={`${d.nome} · ${d.gp} · ${d.circulo}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={miniatura(d.id)} alt={d.nome} loading="lazy" width={72} height={90} />
              </Link>
            ))}
          </div>
          <p className="fonte">Fotografias e dados: Assembleia da República.</p>
        </div>
      </section>

      <section className="seccao">
        <div className="dentro">
          <div className="cab-seccao">
            <div>
              <h2>A legislatura em números</h2>
              <p>Desde {data(m.inicioLegislatura)}, segundo os dados abertos do Parlamento.</p>
            </div>
          </div>
          <div className="grandes">
            <div className="grande amarelo">
              <strong>{f.mulheres}</strong>
              <span>
                mulheres entre os {emFuncoes.length} deputados em funções ({pct(f.mulheres, emFuncoes.length)}%)
              </span>
              <div className="barra" aria-hidden="true">
                <i style={{ width: `${pct(f.mulheres, emFuncoes.length)}%` }} />
              </div>
            </div>
            <div className="grande">
              <strong>{f.idadeMedia ? Math.round(f.idadeMedia) : "—"}</strong>
              <span>
                anos de idade média. O mais novo tem {f.idadeMin}, o mais velho {f.idadeMax}.
              </span>
            </div>
            <div className="grande escuro">
              <strong>{num(m.contagens.votacoesPlenario)}</strong>
              <span>
                votações no plenário: {num(f.votacoesAprovadas)} aprovadas, {num(f.votacoesUnanimes)} por
                unanimidade
              </span>
            </div>
            <div className="grande">
              <strong>{num(m.contagens.iniciativas)}</strong>
              <span>iniciativas entregues: projetos e propostas de lei, de resolução e outras</span>
            </div>
            <div className="grande">
              <strong>{num(f.perguntasRequerimentos)}</strong>
              <span>perguntas e requerimentos ao Governo e a outras entidades</span>
            </div>
            <div className="grande">
              <strong>{num(m.contagens.reunioesPlenario)}</strong>
              <span>reuniões do plenário, com a presença de cada deputado publicada</span>
            </div>
            <div className="grande">
              <strong>{num(m.contagens.desviosLigados)}</strong>
              <span>votos individuais diferentes da própria bancada</span>
            </div>
            <div className="grande">
              <strong>{f.profissoes[0]?.n ?? "—"}</strong>
              <span>
                {f.profissoes[0]?.nome.toLowerCase()}, a profissão mais declarada. Seguem-se{" "}
                {f.profissoes
                  .slice(1, 4)
                  .map((p) => `${p.nome.toLowerCase()} (${p.n})`)
                  .join(", ")}
                .
              </span>
            </div>
          </div>
          <p className="fonte">
            Fonte: Assembleia da República · dados abertos · atualizado em {data(m.recolhidoEm)}. Idade e profissão
            segundo o registo biográfico de cada deputado.
          </p>
        </div>
      </section>

      <section className="seccao">
        <div className="dentro">
          <div className="cab-seccao">
            <div>
              <h2>O que se propõe, por tema</h2>
              <p>Projetos e propostas de lei e de resolução desta legislatura, arrumados por assunto.</p>
            </div>
            <Link className="ver-mais" href="/temas">
              Todos os temas →
            </Link>
          </div>
          <ul className="temas" style={{ marginTop: 0 }}>
            {TEMAS.map((t) => ({ ...t, n: todasIniciativas().filter((i) => i.temas.includes(t.id)).length }))
              .sort((a, b) => b.n - a.n)
              .slice(0, 8)
              .map((t) => (
                <li key={t.id}>
                  <Link href={`/temas/${t.id}`} className="tema">
                    <span className="icone-tema" aria-hidden="true">
                      {t.icone}
                    </span>
                    <strong>{t.nome}</strong>
                    <span className="nota">{num(t.n)} iniciativas</span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </section>

      <section className="seccao">
        <div className="dentro">
          <div className="cab-seccao">
            <div>
              <h2>Escolhe o teu círculo</h2>
              <p>Cada distrito elege deputados em proporção ao número de eleitores.</p>
            </div>
            <Link className="ver-mais" href="/circulos">
              Todos os círculos →
            </Link>
          </div>
          <div className="mapa-e-lista">
            <Alternar mapa={<MapaPortugal contagem={contagem} />} quadrados={<MapaCirculos contagem={contagem} />} />
            <div className="cartao">
              <h3>Como funciona a eleição</h3>
              <p>
                Votas no teu círculo eleitoral: os 18 distritos do continente, os Açores, a Madeira e dois círculos
                para quem vive no estrangeiro. Os lugares de cada círculo são divididos pelos partidos de forma
                proporcional aos votos (método de Hondt).
              </p>
              <p>
                Lisboa elege {contagem["Lisboa"] ?? "—"} deputados, o Porto {contagem["Porto"] ?? "—"} e Portalegre{" "}
                {contagem["Portalegre"] ?? "—"}.
              </p>
              <p className="nota" style={{ margin: 0 }}>
                Constituição da República Portuguesa, artigo 149.º.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="seccao">
        <div className="dentro">
          <div className="cab-seccao">
            <div>
              <h2>Últimas votações</h2>
              <p>
                O que o plenário decidiu e como votou cada grupo parlamentar. Última reunião com presenças publicadas:{" "}
                {data(f.ultimaReuniao)}.
              </p>
            </div>
            <Link className="ver-mais" href="/votacoes">
              Todas as votações →
            </Link>
          </div>
          <ul className="votacoes">
            {votacoes()
              .slice(0, 6)
              .map((v) => (
                <CartaoVotacao key={v.id} v={v} />
              ))}
          </ul>
        </div>
      </section>

      <section className="seccao">
        <div className="dentro">
          <div className="cab-seccao">
            <div>
              <h2>
                <span className="ponto-vivo" aria-hidden="true" />
                Ao vivo
              </h2>
              <p>Quem está a usar o site e o que está a ser mais visto. Anónimo, sem cookies.</p>
            </div>
            <Link className="ver-mais" href="/ao-vivo">
              Ver tudo →
            </Link>
          </div>
          <MaisVistos pessoas={todos.map(({ slug, id, nome, gp }) => ({ slug, id, nome, gp }))} />
        </div>
      </section>

      <section className="seccao">
        <div className="dentro">
          <div className="principios">
            <div>
              <b>Só dados oficiais</b>
              Tudo vem dos dados abertos da Assembleia da República, com a fonte e a data em cada bloco.
            </div>
            <div>
              <b>Sem rankings nem notas</b>
              Não dizemos quem é melhor ou pior. Listas por ordem alfabética, cores nunca por partido.
            </div>
            <div>
              <b>Sem recomendação de voto</b>
              Mostramos o que cada pessoa fez. A conclusão é tua.
            </div>
            <div>
              <b>O que falta, dizemos</b>
              Um dado que não existe aparece como “—”, nunca como zero.{" "}
              <Link href="/metodologia">Como funciona</Link>.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
