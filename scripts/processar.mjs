// Transforma os ficheiros oficiais de data/raw/ nos dados do site, em data/gerado/.
//
// Regras (ver docs/principios.md e docs/fontes-ar.md):
// - Pessoas só se ligam por identificador oficial, ou por nome parlamentar + grupo quando isso
//   aponta para uma única pessoa. Presenças que não liguem assim param o processamento.
// - Nomes em votações que não liguem a uma única pessoa ficam de fora e vão para o relatório.
// - Nada de inventar valores: o que a fonte não traz fica null.
//
// Uso: node scripts/processar.mjs

import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const RAIZ = join(import.meta.dirname, "..");
const RAW = process.env.RAW_DIR ?? join(RAIZ, "data", "raw");
const OUT = join(RAIZ, "data", "gerado");

const ler = async (nome) =>
  JSON.parse((await readFile(join(RAW, `${nome}.json`), "utf8")).replace(/^﻿/, ""));

const id = (v) => (v == null ? null : String(Math.trunc(Number(v))));
const dia = (s) => (s ? s.slice(0, 10) : null);

export function slugify(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Códigos de presença, com o texto das páginas oficiais DetalheReuniaoPlenaria.aspx.
export const PRESENCA = {
  PR: { texto: "Presença", grupo: "presenca" },
  PNO: { texto: "Presença noutro órgão", grupo: "presenca" },
  ME: { texto: "Ausência em missão parlamentar", grupo: "missao" },
  MP: { texto: "Ausência em missão parlamentar", grupo: "missao" },
  FJ: { texto: "Falta justificada", grupo: "falta_justificada" },
  QVJ: { texto: "Falta justificada", grupo: "falta_justificada" },
  QV: { texto: "Falta ao quórum de votação", grupo: "falta" },
  FA: { texto: "Falta", grupo: "falta" },
  FI: { texto: "Falta injustificada", grupo: "falta" },
};

const SITUACAO_EM_FUNCOES = /^Efetivo/;

function maisRecente(lista, campoInicio) {
  return [...(lista ?? [])].sort((a, b) => (a[campoInicio] < b[campoInicio] ? -1 : 1)).at(-1);
}

// --- votações -----------------------------------------------------------------------------

const SENTIDOS = [
  ["A Favor", "a_favor"],
  ["Contra", "contra"],
  ["Abstenção", "abstencao"],
];

// "A Favor: <I>PSD</I>, 2-<I>PS</I>, Pedro Vaz (PS)Contra: …" → { a_favor: [tokens], … }
export function partirDetalhe(detalhe) {
  const texto = (detalhe ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ");
  const marcas = [];
  for (const [rotulo, chave] of SENTIDOS) {
    for (const m of texto.matchAll(new RegExp(`${rotulo}\\s*:`, "g"))) {
      marcas.push({ chave, inicio: m.index, fim: m.index + m[0].length });
    }
  }
  marcas.sort((a, b) => a.inicio - b.inicio);
  const out = {};
  marcas.forEach((m, i) => {
    const pedaco = texto.slice(m.fim, marcas[i + 1]?.inicio ?? texto.length);
    out[m.chave] = pedaco
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  });
  return out;
}

// Classifica um token: grupo inteiro ("PS"), parte contada ("2-PS") ou pessoa ("Pedro Vaz (PS)").
export function lerToken(token, siglas) {
  const pessoa = token.match(/^(.+?)\s*\(([^()]+)\)$/);
  if (pessoa && siglas.has(pessoa[2].trim())) {
    return { tipo: "pessoa", nome: pessoa[1].trim(), gp: pessoa[2].trim() };
  }
  const contado = token.match(/^(\d+)\s*-\s*(.+)$/);
  if (contado && siglas.has(contado[2].trim())) {
    return { tipo: "grupo", gp: contado[2].trim(), n: Number(contado[1]) };
  }
  if (siglas.has(token)) return { tipo: "grupo", gp: token, n: null };
  return { tipo: "desconhecido", texto: token };
}

// Posição da bancada: o sentido onde o grupo aparece sem contagem; se só houver contagens,
// o sentido com mais deputados. null se o grupo não aparece.
function posicaoBancada(partes, gp) {
  let melhor = null;
  for (const [sentido, toks] of Object.entries(partes)) {
    for (const t of toks) {
      if (t.tipo !== "grupo" || t.gp !== gp) continue;
      const peso = t.n == null ? Infinity : t.n;
      if (!melhor || peso > melhor.peso) melhor = { sentido, peso };
    }
  }
  return melhor?.sentido ?? null;
}

// --- principal ----------------------------------------------------------------------------

async function main() {
  const manifest = await ler("manifest");
  const base = await ler("informacaoBase");
  const bio = await ler("registoBiografico");
  const atividade = await ler("atividadeDeputado");
  const orgaos = await ler("orgaos");
  const iniciativas = await ler("iniciativas");

  const relatorio = { avisos: [], contagens: {} };
  const grupos = base.GruposParlamentares.map((g) => ({ sigla: g.sigla, nome: g.nome }));
  const siglas = new Set(grupos.map((g) => g.sigla));
  const circulos = base.CirculosEleitorais.map((c) => ({ id: id(c.cpId), nome: c.cpDes })).sort(
    (a, b) => a.nome.localeCompare(b.nome, "pt"),
  );

  // Deputados que exerceram funções nesta legislatura (situação Efetivo* em algum momento).
  const bioPorId = new Map(bio.map((b) => [id(b.CadId), b]));
  const ativPorId = new Map(
    atividade.map((a) => [id(a.Deputado.DepCadId), a.AtividadeDeputadoList?.[0] ?? {}]),
  );
  const deputados = [];
  const slugs = new Set();
  for (const d of base.Deputados) {
    const situacoes = (d.DepSituacao ?? []).map((s) => ({
      situacao: s.sioDes,
      inicio: dia(s.sioDtInicio),
      fim: dia(s.sioDtFim),
    }));
    if (!situacoes.some((s) => SITUACAO_EM_FUNCOES.test(s.situacao))) continue;
    const atual = maisRecente(situacoes, "inicio");
    const gps = (d.DepGP ?? []).map((g) => ({ sigla: g.gpSigla, inicio: dia(g.gpDtInicio), fim: dia(g.gpDtFim) }));
    let slug = slugify(d.DepNomeParlamentar);
    if (slugs.has(slug)) slug = `${slug}-${id(d.DepCadId)}`;
    slugs.add(slug);
    deputados.push({
      id: id(d.DepCadId),
      slug,
      nome: d.DepNomeParlamentar,
      nomeCompleto: d.DepNomeCompleto,
      circulo: d.DepCPDes,
      gp: maisRecente(gps, "inicio")?.sigla ?? null,
      emFuncoes: SITUACAO_EM_FUNCOES.test(atual.situacao) && !atual.fim,
      situacaoAtual: atual.situacao,
      situacoes,
      gps,
    });
  }
  const porId = new Map(deputados.map((d) => [d.id, d]));

  // Índice nome parlamentar + grupo → ids (inclui suplentes, para detetar ambiguidade).
  const porNomeGp = new Map();
  for (const d of base.Deputados) {
    for (const g of d.DepGP ?? []) {
      const k = `${d.DepNomeParlamentar}|${g.gpSigla}`;
      porNomeGp.set(k, new Set([...(porNomeGp.get(k) ?? []), id(d.DepCadId)]));
    }
  }
  const ligarNome = (nome, gp) => {
    const ids = porNomeGp.get(`${nome}|${gp}`);
    return ids?.size === 1 ? [...ids][0] : null;
  };

  // Presenças no plenário.
  const presencas = new Map(deputados.map((d) => [d.id, []]));
  const reunioes = [];
  for (const r of orgaos.Plenario?.Reunioes ?? []) {
    const reu = r.Reuniao;
    const data = dia(r.Presencas?.dtReuniao ?? reu.reuDataHora);
    reunioes.push({ id: id(reu.reuId), data, numero: reu.reuNumero, sessao: reu.selNumero, tipo: reu.reuTirDes });
    for (const p of r.Presencas?.presencas ?? []) {
      const depId = ligarNome(p.nomeDeputado, p.siglaGrupo);
      if (!depId || !presencas.has(depId)) {
        throw new Error(`Presença sem ligação única: "${p.nomeDeputado}" (${p.siglaGrupo}) em ${data}`);
      }
      if (!PRESENCA[p.siglaFalta]) {
        relatorio.avisos.push(`Código de presença sem significado confirmado: ${p.siglaFalta} (${p.nomeDeputado}, ${data})`);
      }
      presencas.get(depId).push({ reuniao: id(reu.reuId), data, codigo: p.siglaFalta, motivo: p.motivoFalta ?? null });
    }
  }
  reunioes.sort((a, b) => (a.data < b.data ? -1 : 1));

  // Iniciativas: autoria por idCadastro (identificador oficial).
  const iniPorDep = new Map(deputados.map((d) => [d.id, []]));
  const votacoes = new Map();
  for (const ini of iniciativas) {
    const eventos = ini.IniEventos ?? [];
    const resumo = {
      id: id(ini.IniId),
      tipo: ini.IniDescTipo,
      numero: ini.IniNr,
      titulo: ini.IniTitulo,
      entrada: dia(eventos.find((e) => e.Fase === "Entrada")?.DataFase ?? eventos[0]?.DataFase),
      ultimaFase: eventos.at(-1)?.Fase ?? null,
      ultimaFaseData: dia(eventos.at(-1)?.DataFase),
    };
    for (const a of ini.IniAutorDeputados ?? []) {
      iniPorDep.get(id(a.idCadastro))?.push(resumo);
    }
    for (const ev of eventos) {
      for (const v of ev.Votacao ?? []) {
        const vid = id(v.id);
        if (!votacoes.has(vid)) {
          votacoes.set(vid, {
            id: vid,
            data: dia(v.data),
            resultado: v.resultado,
            unanime: Boolean(v.unanime),
            fase: ev.Fase,
            descricao: v.descricao ?? null,
            detalhe: v.detalhe ?? null,
            ausencias: v.ausencias ?? [],
            diario: v.publicacao?.[0]?.URLDiario ?? null,
            iniciativas: [],
          });
        }
        const vv = votacoes.get(vid);
        if (!vv.iniciativas.some((i) => i.id === resumo.id)) {
          vv.iniciativas.push({ id: resumo.id, tipo: resumo.tipo, numero: resumo.numero, titulo: resumo.titulo });
        }
      }
    }
  }

  // Votos que se afastam da bancada (pessoas nomeadas no detalhe).
  const desvios = new Map(deputados.map((d) => [d.id, []]));
  let nomeados = 0;
  for (const v of votacoes.values()) {
    const brutos = partirDetalhe(v.detalhe);
    const partes = {};
    for (const [sentido, toks] of Object.entries(brutos)) {
      partes[sentido] = toks.map((t) => lerToken(t, siglas));
      for (const t of partes[sentido]) {
        if (t.tipo === "desconhecido") relatorio.avisos.push(`Votação ${v.id}: termo não reconhecido "${t.texto}"`);
      }
    }
    for (const [sentido, toks] of Object.entries(partes)) {
      for (const t of toks) {
        if (t.tipo !== "pessoa") continue;
        nomeados++;
        const depId = ligarNome(t.nome, t.gp);
        if (!depId || !desvios.has(depId)) {
          relatorio.avisos.push(`Votação ${v.id}: "${t.nome} (${t.gp})" não liga a uma única pessoa; fica de fora`);
          continue;
        }
        desvios.get(depId).push({
          votacao: v.id,
          data: v.data,
          sentido,
          sentidoBancada: posicaoBancada(partes, t.gp),
          resultado: v.resultado,
          fase: v.fase,
          descricao: v.descricao,
          iniciativas: v.iniciativas,
          diario: v.diario,
        });
      }
    }
  }

  // Perfis.
  await rm(OUT, { recursive: true, force: true });
  await mkdir(join(OUT, "perfis"), { recursive: true });
  const ordenar = (lista, campo) => lista.sort((a, b) => ((a[campo] ?? "") < (b[campo] ?? "") ? 1 : -1));
  for (const d of deputados) {
    const b = bioPorId.get(d.id) ?? {};
    const a = ativPorId.get(d.id) ?? {};
    const perfil = {
      ...d,
      sexo: b.CadSexo ?? null,
      nascimento: dia(b.CadDtNascimento),
      profissao: b.CadProfissao ?? null,
      habilitacoes: (b.CadHabilitacoes ?? []).map((h) => h.HabDes).filter(Boolean),
      cargosFuncoes: (b.CadCargosFuncoes ?? []).map((f) => ({ texto: f.FunDes?.replace(/^\s*-\s*/, ""), antigo: f.FunAntiga === "S" })),
      comissoes: (a.Cms ?? []).map((c) => ({ nome: c.CmsNo?.trim(), cargo: c.CmsCargo, situacao: c.CmsSituacao })),
      gruposAmizade: (a.Gpa ?? []).map((g) => ({ nome: g.GplNo, cargo: g.CgaCrg })),
      iniciativas: ordenar(iniPorDep.get(d.id), "entrada"),
      intervencoes: ordenar(
        (a.Intev ?? []).map((i) => ({ id: i.IntId, data: dia(i.PubDtreu), tipo: i.TinDs, sumario: i.IntSu, diario: i.PubNr })),
        "data",
      ),
      requerimentos: ordenar(
        (a.Req ?? []).map((r) => ({ id: r.ReqId, data: dia(r.ReqDt), tipo: r.ReqPerTp, numero: r.ReqNr, assunto: r.ReqAs })),
        "data",
      ),
      presencas: presencas.get(d.id).sort((x, y) => (x.data < y.data ? -1 : 1)),
      desviosBancada: ordenar(desvios.get(d.id), "data"),
    };
    await writeFile(join(OUT, "perfis", `${d.slug}.json`), JSON.stringify(perfil));
  }

  const lista = deputados
    .map(({ situacoes, gps, ...resto }) => resto)
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt"));
  await writeFile(join(OUT, "deputados.json"), JSON.stringify(lista));
  await writeFile(join(OUT, "reunioes.json"), JSON.stringify(reunioes));

  relatorio.contagens = {
    deputadosNaLegislatura: deputados.length,
    emFuncoes: deputados.filter((d) => d.emFuncoes).length,
    reunioesPlenario: reunioes.length,
    registosPresenca: [...presencas.values()].reduce((n, l) => n + l.length, 0),
    iniciativas: iniciativas.length,
    votacoesPlenario: votacoes.size,
    nomesEmVotacoes: nomeados,
    desviosLigados: [...desvios.values()].reduce((n, l) => n + l.length, 0),
  };
  const meta = {
    legislatura: base.DetalheLegislatura.sigla,
    inicioLegislatura: dia(base.DetalheLegislatura.dtini),
    geradoEm: new Date().toISOString(),
    recolhidoEm: manifest.recolhidoEm,
    fontes: manifest.conjuntos,
    grupos,
    circulos,
    contagens: relatorio.contagens,
  };
  await writeFile(join(OUT, "meta.json"), JSON.stringify(meta, null, 2));
  await writeFile(join(OUT, "relatorio.json"), JSON.stringify(relatorio, null, 2));

  console.log(relatorio.contagens);
  console.log(`${relatorio.avisos.length} avisos (ver data/gerado/relatorio.json)`);
  if (deputados.filter((d) => d.emFuncoes).length !== 230) {
    throw new Error("O número de deputados em funções não é 230: verificar a regra de situação");
  }
}

main().catch((err) => {
  console.error(`ERRO: ${err.message}`);
  process.exit(1);
});
