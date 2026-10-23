import type { Metadata } from "next";
import Link from "next/link";
import { PRESENCA, data, dataHora, meta, num } from "@/lib/dados";

export const metadata: Metadata = { title: "Metodologia e fontes" };

const NOMES_FONTES: Record<string, [string, string]> = {
  informacaoBase: ["Informação base", "legislatura, círculos, grupos parlamentares, deputados e o seu percurso"],
  registoBiografico: ["Registo biográfico", "data de nascimento, profissão, habilitações, cargos e funções"],
  atividadeDeputado: ["Atividade dos deputados", "intervenções, perguntas e requerimentos, comissões, grupos de amizade"],
  orgaos: ["Composição de órgãos", "reuniões do plenário e presenças"],
  iniciativas: ["Iniciativas", "iniciativas, autores, fases e votações"],
};

export default function Metodologia() {
  const m = meta();
  const c = m.contagens;
  const codigos = Object.entries(PRESENCA);
  return (
    <div className="dentro pagina" style={{ maxWidth: 860 }}>
      <h1 className="display">Metodologia e fontes</h1>
      <p>
        Este site mostra quem nos representa na Assembleia da República e o que fez com o mandato, usando só dados
        oficiais e públicos. Cada bloco indica de onde vem o dado e quando foi atualizado.
      </p>

      <h2>Neutralidade</h2>
      <ul>
        <li>Não há ranking, nota, &quot;melhores e piores&quot; nem adjetivos sobre ninguém.</li>
        <li>Listas por ordem alfabética.</li>
        <li>As cores indicam só o estado de um dado (por exemplo, presença ou falta). Nunca partido.</li>
        <li>Não há recomendação de voto, inquéritos nem sondagens.</li>
        <li>Um dado que a fonte não publica aparece como &quot;—&quot;, nunca como zero.</li>
      </ul>

      <h2>Fontes</h2>
      <p>
        Dados abertos da Assembleia da República,{" "}
        <a href="https://www.parlamento.pt/Cidadania/Paginas/DadosAbertos.aspx">parlamento.pt/Cidadania/Paginas/DadosAbertos.aspx</a>
        , {m.legislatura} Legislatura (desde {data(m.inicioLegislatura)}).
      </p>
      <div className="tabela">
        <table>
          <thead>
            <tr>
              <th>Conjunto</th>
              <th>O que traz</th>
              <th>Recolhido em</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(m.fontes).map(([k, f]) => (
              <tr key={k}>
                <td>
                  <a href={f.pagina}>{NOMES_FONTES[k]?.[0] ?? k}</a>
                  <br />
                  <small>{f.ficheiro}</small>
                </td>
                <td>{NOMES_FONTES[k]?.[1] ?? "—"}</td>
                <td>{dataHora(f.recolhidoEm)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="nota">
        Nesta recolha: {num(c.emFuncoes)} deputados em funções ({num(c.deputadosNaLegislatura)} passaram pela
        legislatura), {num(c.reunioesPlenario)} reuniões plenárias com {num(c.registosPresenca)} registos de presença,{" "}
        {num(c.iniciativas)} iniciativas e {num(c.votacoesPlenario)} votações.
      </p>
      <p>
        Se uma fonte falha ou muda de formato, a atualização pára e avisa, em vez de gravar dados errados. Por isso
        um bloco pode estar mais desatualizado do que outro.
      </p>

      <h2>Quem conta como deputado em funções</h2>
      <p>
        Quem tem, na informação base da Assembleia, uma situação &quot;Efetivo&quot;, &quot;Efetivo
        Temporário&quot; ou &quot;Efetivo Definitivo&quot; sem data de fim. Quem renunciou, suspendeu o mandato ou
        foi substituído continua no site, assinalado como fora de funções, com as datas.
      </p>

      <h2>Como contamos a presença</h2>
      <p>
        A Assembleia publica, para cada reunião plenária, o registo de cada deputado em exercício. Mostramos esse
        registo tal como é publicado, com o texto das páginas oficiais da reunião. Reuniões antes da posse ou
        durante suspensão ou substituição não aparecem no registo da pessoa e não contam como falta.
      </p>
      <div className="tabela">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Texto oficial</th>
              <th>No site</th>
            </tr>
          </thead>
          <tbody>
            {codigos.map(([cod, v]) => (
              <tr key={cod}>
                <td>{cod}</td>
                <td>{v.texto}</td>
                <td>
                  {
                    {
                      presenca: "Presença",
                      missao: "Missão parlamentar (não é falta)",
                      falta_justificada: "Falta justificada",
                      falta: "Falta",
                      por_confirmar: "—",
                    }[v.grupo]
                  }
                </td>
              </tr>
            ))}
            <tr>
              <td>FAJ</td>
              <td>Significado ainda por confirmar junto da Assembleia</td>
              <td>Mostrado com o código, sem classificar</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="nota">
        Os registos de presença não trazem identificador do deputado, só o nome parlamentar e o grupo. Só os ligamos
        quando esse par aponta para uma única pessoa; na recolha atual todos os registos cumprem essa regra. Se um
        deixar de cumprir, a atualização pára.
      </p>

      <h2>Como tratamos as votações</h2>
      <p>
        Na Assembleia da República o voto em plenário regista-se quase sempre por grupo parlamentar. Por isso não
        mostramos &quot;percentagem de votos com o partido&quot;: seria quase sempre 100% por construção, e não
        informa nada.
      </p>
      <p>
        Mostramos, em cada perfil, as votações em que a ata nomeia essa pessoa com um sentido de voto diferente do
        da sua bancada (por exemplo, &quot;Contra: … Pedro Vaz (PS)&quot;), com o link para a iniciativa e para o
        Diário da Assembleia. A posição da bancada é o sentido em que o grupo aparece no registo oficial da
        votação. Nesta recolha, {num(c.nomesEmVotacoes)} nomes aparecem nas votações e {num(c.desviosLigados)} ficaram
        ligados a uma única pessoa.
      </p>

      <h2>Iniciativas, perguntas e requerimentos</h2>
      <p>
        Contamos as iniciativas em que a pessoa figura como autora, pelo identificador oficial. Muitas iniciativas
        são assinadas por toda a bancada, por isso os números incluem coautorias e não medem trabalho individual.
        O mesmo vale para perguntas e requerimentos.
      </p>

      <h2>O que ainda não cobrimos</h2>
      <ul>
        <li>
          Despesas, ajudas de custo, rendimentos, património e registo de interesses: não estão nos dados abertos da
          Assembleia.
        </li>
        <li>Remuneração: é fixada por lei, mas ainda não a mostramos.</li>
        <li>Legislaturas anteriores à {m.legislatura}.</li>
        <li>Votações em comissão.</li>
        <li>Presidente da República, Governo, eurodeputados, regiões autónomas e autarquias.</li>
      </ul>

      <h2>Lacunas conhecidas</h2>
      <ul>
        <li>O código de presença FAJ aparece uma vez e ainda não confirmámos o seu significado.</li>
        <li>Algumas páginas de iniciativa do site da Assembleia devolvem erro de forma intermitente.</li>
        <li>As fotografias vêm do site da Assembleia e são guardadas em versão reduzida.</li>
      </ul>

      <h2 id="correcoes">Correções e direito de resposta</h2>
      <p>
        O canal para reportar erros e exercer direito de resposta ainda está a ser preparado. Todas as mensagens serão
        conferidas contra a fonte oficial.
      </p>

      <h2 id="privacidade">Privacidade</h2>
      <p>Não guardamos nem mostramos moradas, números de identificação civil ou fiscal.</p>
      <p>
        Contamos as visitas para mostrar a página <Link href="/ao-vivo">Ao vivo</Link> e saber o que melhorar. É anónimo:
        sem cookies, sem conta e sem endereço IP gravado. Para cada visita guardamos só a página aberta, a cidade e o
        país aproximados (dados pela ligação à internet) e dois códigos aleatórios: um por separador do browser, que
        desaparece quando o fechas, e outro para contar pessoas diferentes em cada dia, calculado a partir do endereço
        de internet, do browser e de um segredo que muda todos os dias. Não é possível seguir ninguém de um dia para o
        outro. Os registos são apagados ao fim de 90 dias.
      </p>
      <p>
        Só mostramos cidades e países com pelo menos 5 pessoas. Se o teu browser pede “não rastrear”, não contamos nada.
        Estes números nunca servem para ordenar políticos.
      </p>

      <h2>Créditos</h2>
      <p>
        Mapa: Natural Earth (domínio público). Inspirado no <a href="https://www.politicometro.org/">Politicômetro</a>, um projeto brasileiro com o mesmo
        princípio: só dados oficiais, em linguagem simples, sem ranking. Fotografias: Assembleia da República.
      </p>
      <p className="nota">Página gerada em {dataHora(m.geradoEm)}.</p>
    </div>
  );
}
