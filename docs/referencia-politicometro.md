# Referência: Politicômetro (Brasil)

Levantamento feito a 23/10/2026 em https://www.politicometro.org/.
Serve para entender o produto, não para copiar código ou design.

## Proposta

Site de utilidade pública, sem fins comerciais, para "qualquer pessoa ver quem a representa e o que fez
com o mandato, em no máximo três cliques: mapa, estado, crachá". Cobre cerca de 71 mil políticos
(da câmara municipal à Presidência) a partir de cerca de 1.000 fontes oficiais.

## Secções

| Rota | O que faz |
|---|---|
| `/` (Mapa) | Contadores por cargo, mapa por região/estado, lista de A a Z com filtros de cargo e partido |
| `/quem`, `/quem/<cargo>` | Listas por cargo (presidência, senado, câmara, governos estaduais, assembleias, prefeituras, câmaras municipais) |
| `/p/<nome>` (crachá) | Perfil de cada político — o centro do produto |
| `/representantes` (Me representa) | Escreve a cidade/estado e vê todos os eleitos que te representam |
| `/congresso` | Agenda do plenário, votações do ano, resultado e como votou cada partido |
| `/impostos` (Impostômetro) | Arrecadação federal por mês, imposto e estado (Receita Federal) |
| `/governos` | Mandatos presidenciais (e estaduais/municipais) lado a lado com os mesmos indicadores |
| `/eleicoes` | Resultados oficiais 1994–2026, apuração ao vivo |
| `/propostas` | Programas de governo registados no TSE, até 4 candidatos lado a lado por tema |
| `/stf` | Ministros, processos julgados, pauta, processos parados |
| `/cargos` | O que cada cargo faz e pode fazer, segundo a Constituição; diagrama "quem elege/fiscaliza quem" |
| `/mais-vistos` | Crachás e páginas mais abertos (com aviso: "não mede apoio") |
| `/atualizacoes` | Tabela de fontes, o que trazem, frequência e data da última carga |
| `/sobre` | Neutralidade, metodologia, fontes, o que cobre e não cobre, lacunas, privacidade, créditos |

## O crachá (perfil)

Exemplo de deputada federal. Blocos, por ordem:

1. Identificação: cargo, estado, partido, idade, naturalidade, quantas vezes eleita, mandato atual e futuro.
2. Números-chave: salário mensal e anual, total recebido desde a entrada, cota parlamentar gasta,
   património declarado (atual e anterior), votos na última eleição, dinheiro de campanha,
   presença na carreira, número de propostas.
3. Seletor de ano: a página inteira muda para o ano escolhido.
4. "Em resumo": presença do ano comparada com a média; temas mais tratados (contagem de propostas e falas);
   alinhamento com a orientação do partido; maior item de despesa.
5. Grelha de presença: um quadrado por sessão (presente / sem registo / fora do exercício).
6. Ano a ano: tabela com presença, propostas, falas, votos e cota.
7. Detalhe da cota: cada despesa com nota fiscal.
8. Botões "Reportar erro" e "Direito de resposta".

Cada bloco termina com "Fonte: … · atualizado em …". Dado indisponível aparece como "—", nunca zero.

## Regras editoriais declaradas

- Sem ranking, nota, "melhores e piores", adjetivos.
- Cores só para lugar, tipo de cargo ou estado de um dado.
- Sem recomendação de voto (inclusive por IA) nem enquetes.
- Listas em ordem alfabética.
- Temas por lista pública de palavras-chave sobre a ementa oficial, sem IA.
- Ligações entre bases só por identificador ou por combinação única de nome+cargo+estado+mandato.
- Processos: decisões oficiais automáticas; investigações à mão, só com documento oficial público.
- Privacidade: CPF/título só como hash com sal; nunca endereço; analytics sem cookie nem IP.

## Fontes e cadência

| Fonte | Conteúdo | Frequência |
|---|---|---|
| Câmara dos Deputados (9 fontes) | deputados, presença, propostas, falas, votos, comissões, cota, viagens | diária |
| Senado Federal (6) | senadores, propostas, falas, votos, comissões, cota | diária |
| TSE (14) | eleitos, candidaturas, votos, bens, contas de campanha, fotos | por eleição |
| Receita Federal | arrecadação por mês, imposto e estado | mensal |
| Assembleias Legislativas (20) | presença, votos, propostas, verbas onde publicadas | semanal |
| Câmaras Municipais SAPL (927) | presença, votos, propostas | semanal |
| IBGE | malhas e nomes dos municípios | anual |

Se uma carga é mais antiga do que a frequência prevista, a página marca "fora do prazo previsto".

## Técnica observada

- Next.js (rotas com `_rsc`) alojado na Vercel, com Security Checkpoint ativo.
- APIs internas: `/api/online`, `/api/evento` (analytics próprio), `/api/galeria/indice`, `/api/area/<cargo>`.
- Fotos em `/fotos/<slug>.webp`.
- Recolha por rotinas agendadas, com gravação após verificação.
