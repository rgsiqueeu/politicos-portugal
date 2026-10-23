// Descarrega os conjuntos de dados abertos da Assembleia da República para data/raw/.
//
// Os links de download são cifrados e mudam, por isso descobrem-se sempre a partir da
// página pública de cada conjunto: página do conjunto → pasta da legislatura → ficheiro *_json.txt.
//
// Uso: node scripts/recolha.mjs [legislatura]   (por omissão: XVII)

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const BASE = "https://www.parlamento.pt";
const LEG = process.argv[2] ?? "XVII";
const OUT = join(import.meta.dirname, "..", "data", "raw");

// chave interna → página do conjunto em parlamento.pt/Cidadania/Paginas/
export const CONJUNTOS = {
  informacaoBase: "DAInformacaoBase",
  registoBiografico: "DARegistoBiografico",
  atividadeDeputado: "DAatividadeDeputado",
  orgaos: "DAComposicaoOrgaos",
  iniciativas: "DAIniciativas",
};

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

async function get(url, tentativas = 3) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(300_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      if (i >= tentativas) throw new Error(`${url}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 2000 * 2 ** i));
    }
  }
}

// Procura <a ...href="X"...>texto</a> com o texto exato pedido.
function linkPorTexto(html, texto) {
  for (const m of html.matchAll(/<a([^>]*)>([^<]*)<\/a>/g)) {
    if (m[2].trim() === texto) {
      const href = m[1].match(/href="([^"]+)"/);
      if (href) return decode(href[1]);
    }
  }
  return null;
}

async function descobrirFicheiro(pagina) {
  const html = await (await get(`${BASE}/Cidadania/Paginas/${pagina}.aspx`)).text();
  const pasta = linkPorTexto(html, `${LEG} Legislatura`);
  if (!pasta) throw new Error(`${pagina}: não encontrei a pasta "${LEG} Legislatura"`);
  const htmlPasta = await (await get(BASE + pasta)).text();
  const links = [...htmlPasta.matchAll(/href="([^"]*doc\.txt[^"]*)"/g)]
    .map((m) => decode(m[1]))
    .filter((h) => /fich=[^&]*_json\.txt/.test(h));
  if (links.length !== 1) {
    throw new Error(`${pagina}: esperava 1 ficheiro JSON na pasta ${LEG}, encontrei ${links.length}`);
  }
  return links[0];
}

// O servidor da AR às vezes devolve uma página de erro HTML com HTTP 200 nos ficheiros grandes.
// Só se grava o que for JSON válido.
async function descarregarJson(url, tentativas = 4) {
  for (let i = 1; ; i++) {
    const corpo = Buffer.from(await (await get(url)).arrayBuffer());
    try {
      JSON.parse(corpo.toString("utf8").replace(/^﻿/, ""));
      return corpo;
    } catch {
      if (i >= tentativas) throw new Error(`${url}: a resposta não é JSON válido após ${i} tentativas`);
      console.log(`  resposta inválida (${corpo.length} bytes), nova tentativa ${i + 1}…`);
      await new Promise((r) => setTimeout(r, 5000 * i));
    }
  }
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const manifest = { legislatura: LEG, recolhidoEm: new Date().toISOString(), conjuntos: {} };
  for (const [chave, pagina] of Object.entries(CONJUNTOS)) {
    const url = await descobrirFicheiro(pagina);
    const nome = new URL(url).searchParams.get("fich");
    const corpo = await descarregarJson(url);
    await writeFile(join(OUT, `${chave}.json`), corpo);
    manifest.conjuntos[chave] = {
      pagina: `${BASE}/Cidadania/Paginas/${pagina}.aspx`,
      ficheiro: nome,
      bytes: corpo.length,
      recolhidoEm: new Date().toISOString(),
    };
    console.log(`ok ${chave} ${nome} ${(corpo.length / 1e6).toFixed(1)} MB`);
  }
  await writeFile(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
}

main().catch((err) => {
  console.error(`ERRO: ${err.message}`);
  process.exit(1);
});
