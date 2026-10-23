# Fontes: dados abertos da Assembleia da República

Levantamento feito a 23/10/2026 sobre os ficheiros JSON da **XVII Legislatura** (início a 03/06/2025),
publicados em https://www.parlamento.pt/Cidadania/Paginas/DadosAbertos.aspx.

Os links de download (`app.parlamento.pt/webutils/docs/doc.txt?path=…`) são cifrados e mudam:
a recolha tem de os descobrir a partir da página de cada conjunto, nunca guardá-los fixos.
Os ficheiros vêm com BOM UTF-8 (`utf-8-sig`).

## Conjuntos usados no MVP

| Conjunto (página) | Ficheiro | Tamanho | O que traz |
|---|---|---|---|
| Informação base (`DAInformacaoBase`) | `InformacaoBaseXVII_json.txt` | 0,6 MB | Legislatura, sessões legislativas, 22 círculos, grupos parlamentares, todos os deputados (efetivos e suplentes) com histórico de situação e de grupo |
| Registo biográfico (`DARegistoBiografico`) | `RegistoBiograficoXVII_json.txt` | 0,7 MB | Data de nascimento, sexo, profissão, habilitações, cargos e funções, condecorações, obras publicadas, órgãos da AR |
| Atividade dos deputados (`DAatividadeDeputado`) | `AtividadeDeputadoXVII_json.txt` | 41 MB | Por deputado: iniciativas, intervenções, requerimentos, comissões e cargos, audições, audiências, deslocações, eventos, grupos de amizade, relatórios, votos (de saudação/pesar) |
| Composição de órgãos (`DAComposicaoOrgaos`) | `OrgaoComposicaoXVII_json.txt` | 5 MB | Composição de plenário e comissões, reuniões, **presenças no plenário** |
| Iniciativas (`DAIniciativas`) | `IniciativasXVII_json.txt` | 100 MB | 2.164 iniciativas com eventos (fases), autores e **votações** |
| Intervenções (`DAIntervencoes`) | `IntervencoesXVII_json.txt` | 0,3 MB | Intervenções com vídeo, debate e membro do governo (parece parcial; usar a atividade dos deputados como base) |

Também descarregados, fora do MVP: Atividades, Requerimentos, Diplomas aprovados, Orçamento do Estado 2026
e propostas de alteração.

## Deputados

- `InformacaoBase.Deputados`: 1.446 registos (efetivos e suplentes), um por `DepCadId`.
- **Em funções hoje = situação `Efetivo*` sem `sioDtFim`: 230.** Bate certo com a composição oficial
  (PSD 89, CH 60, PS 58, IL 9, L 6, PCP 3, CDS-PP 2, BE 1, PAN 1, JPP 1).
- Situações possíveis: Efetivo, Efetivo Temporário, Efetivo Definitivo, Suplente, Suspenso (Eleito),
  Suspenso (Não Eleito), Renunciou, Impedido, Desistência. Cada uma com início e fim, o que permite
  saber exatamente quando alguém estava em exercício.
- Identificador estável entre conjuntos: `DepCadId` (= `CadId` no registo biográfico).

## Presenças no plenário — disponível

`OrgaoComposicao.Plenario.Reunioes[].Presencas.presencas[]`: 125 reuniões, 28.750 registos, todos com código.

**A ligação ao deputado é feita por nome parlamentar + grupo (não há ID).** Verificado: os 28.750 registos ligam
a um único deputado da informação base, sem nenhuma ambiguidade. A recolha deve falhar ruidosamente se aparecer
um nome que não liga ou que liga a mais de uma pessoa.

Códigos, confirmados contra as páginas oficiais `DetalheReuniaoPlenaria.aspx?BID=…`:

| Código | Texto oficial | Registos |
|---|---|---|
| `PR` | Presença (P) | 26.238 |
| `FJ` | Falta Justificada (FJ) | 822 |
| `QVJ` | Falta Justificada (FJ) — mostrada assim na página; associada ao quórum de votação | 586 |
| `ME` | Ausência em Missão Parlamentar (AMP) | 822 |
| `MP` | Ausência em Missão Parlamentar (AMP) | 47 |
| `PNO` | Presença Noutro Órgão (PNO) | 172 |
| `QV` | Falta ao Quórum de Votação | 30 |
| `FA` | Falta | 23 |
| `FI` | Falta Injustificada (FI) | 9 |
| `FAJ` | **por confirmar** (1 registo) | 1 |

Faltas justificadas trazem `motivoFalta` (Trabalho político, Doença, Assistência à família, Trabalho parlamentar,
Força maior, Casamento, Luto, Paternidade, …).

Regra de apresentação: mostrar cada categoria com o texto oficial, sem somar "faltas" de categorias diferentes.
Missão parlamentar e presença noutro órgão **não são faltas**.

## Votações — por bancada, com desvios nominais

`Iniciativas[].IniEventos[].Votacao[]`: 2.178 votações únicas no plenário (1.318 aprovadas, 858 rejeitadas,
2 prejudicadas; 312 unânimes).

O campo `detalhe` é texto com HTML, por grupo parlamentar:

```
A Favor: <I>PSD</I>, <I> CH</I>, <I> IL</I>, <I> CDS-PP</I>Contra: <I>PS</I>, …Abstenção: <I>PCP</I>
```

Variantes encontradas (73 votações):

- **Contagem por grupo** em votações nominais/contadas: `86-PSD, 59-CH, …`
- **Deputados que se afastam da bancada, pelo nome**: `Pedro Vaz (PS)`, `João Pedro Louro (PSD)`
- **Parte de uma bancada**: `1-PS` noutra coluna que não a do resto do PS

`ausencias` lista grupos ausentes (ex.: `['BE']`). Cada votação liga à publicação no Diário (`URLDiario`).

Consequência: **"votou com o partido X%" não se publica**, porque seria quase sempre 100% por construção.
Publica-se, por deputado, a lista das votações em que o seu nome aparece fora da posição da bancada,
com o texto oficial e o link para o Diário.

## Iniciativas, intervenções e restante atividade

Por deputado em `AtividadeDeputado[].AtividadeDeputadoList[]`:

- `Ini[]`: iniciativas de autoria (tipo, número, título, sessão)
- `Intev[]`: intervenções em plenário (tipo — intervenção, pedido de esclarecimento…; sumário; data; Diário)
- `Req[]`: requerimentos e perguntas ao Governo
- `Cms[]`: comissões e cargo (presidente, efetivo, suplente…)
- `Audicoes[]`, `Audiencias[]`, `Deslocacoes[]`, `Eventos[]`, `Gpa[]` (grupos de amizade), `Rel` (relatórios)
- `ActP[]`: votos de saudação, pesar, etc.

## Não disponível em dados abertos (a tratar como "—")

- **Despesas individuais** (ajudas de custo, deslocações em valor): não encontradas nos conjuntos.
- **Registo de interesses / declarações de rendimentos**: não está nos dados abertos da AR;
  existe uma página de consulta (`/RegistoInteresses/`) e a Entidade para a Transparência. Fora do MVP.
- **Salário**: não vem nos dados; é fixado por lei (Estatuto Remuneratório dos Titulares de Cargos Políticos).
  Só entra com a norma citada e o valor em vigor confirmado.
