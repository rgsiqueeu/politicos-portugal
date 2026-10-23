// Gera lib/mapa-portugal.json (caminhos SVG dos distritos e regiões autónomas) a partir do
// Natural Earth, ne_10m_admin_1_states_provinces (domínio público): https://www.naturalearthdata.com/
//
// Uso: node scripts/gerar-mapa.mjs <caminho para ne_10m_admin_1_states_provinces.geojson>
// O ficheiro está em https://github.com/nvkelso/natural-earth-vector (geojson/).

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const NOMES = { Azores: "Açores" };

// Caixas no SVG (viewBox 0 0 400 520): continente à direita, ilhas em caixas à esquerda.
const CAIXAS = {
  continente: { x: 150, y: 8, w: 245, h: 504 },
  Açores: { x: 4, y: 250, w: 136, h: 96 },
  Madeira: { x: 4, y: 362, w: 136, h: 96 },
};
const MARGEM_ILHA = 8;

const caixaDe = (nome) => (nome === "Açores" || nome === "Madeira" ? nome : "continente");

function anelParaPontos(coords) {
  return coords.map(([lon, lat]) => [lon, lat]);
}

function poligonos(geom) {
  if (geom.type === "Polygon") return [geom.coordinates];
  if (geom.type === "MultiPolygon") return geom.coordinates;
  throw new Error(`geometria inesperada: ${geom.type}`);
}

// Simplificação Douglas-Peucker, em unidades do SVG.
function simplificar(pts, tol) {
  if (pts.length < 4) return pts;
  const d2 = (p, a, b) => {
    const [x, y] = p;
    const [x1, y1] = a;
    const [x2, y2] = b;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const l = dx * dx + dy * dy;
    const t = l ? Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / l)) : 0;
    const px = x1 + t * dx - x;
    const py = y1 + t * dy - y;
    return px * px + py * py;
  };
  const manter = new Uint8Array(pts.length);
  manter[0] = manter[pts.length - 1] = 1;
  const pilha = [[0, pts.length - 1]];
  while (pilha.length) {
    const [i, j] = pilha.pop();
    let max = 0;
    let idx = -1;
    for (let k = i + 1; k < j; k++) {
      const d = d2(pts[k], pts[i], pts[j]);
      if (d > max) {
        max = d;
        idx = k;
      }
    }
    if (max > tol * tol && idx > 0) {
      manter[idx] = 1;
      pilha.push([i, idx], [idx, j]);
    }
  }
  return pts.filter((_, k) => manter[k]);
}

async function main() {
  const origem = process.argv[2];
  if (!origem) throw new Error("indica o caminho do ficheiro GeoJSON do Natural Earth");
  const geo = JSON.parse(await readFile(origem, "utf8"));
  const pt = geo.features.filter((f) => f.properties.iso_a2 === "PT");
  if (pt.length !== 20) throw new Error(`esperava 20 regiões de Portugal, encontrei ${pt.length}`);

  // Limites (em graus) de cada caixa, para ajustar a escala.
  const limites = {};
  for (const f of pt) {
    const nome = NOMES[f.properties.name] ?? f.properties.name;
    const c = caixaDe(nome);
    const l = (limites[c] ??= { minLon: 180, maxLon: -180, minLat: 90, maxLat: -90 });
    for (const pol of poligonos(f.geometry)) {
      for (const [lon, lat] of pol[0]) {
        l.minLon = Math.min(l.minLon, lon);
        l.maxLon = Math.max(l.maxLon, lon);
        l.minLat = Math.min(l.minLat, lat);
        l.maxLat = Math.max(l.maxLat, lat);
      }
    }
  }
  // Projeção equirretangular com correção da latitude média de cada caixa.
  const projetores = {};
  for (const [c, l] of Object.entries(limites)) {
    const caixa = CAIXAS[c];
    const margem = c === "continente" ? 0 : MARGEM_ILHA;
    const k = Math.cos((((l.minLat + l.maxLat) / 2) * Math.PI) / 180);
    const largura = (l.maxLon - l.minLon) * k;
    const altura = l.maxLat - l.minLat;
    const escala = Math.min((caixa.w - 2 * margem) / largura, (caixa.h - 2 * margem) / altura);
    const ox = caixa.x + (caixa.w - largura * escala) / 2;
    const oy = caixa.y + (caixa.h - altura * escala) / 2;
    projetores[c] = ([lon, lat]) => [ox + (lon - l.minLon) * k * escala, oy + (l.maxLat - lat) * escala];
  }

  const regioes = pt
    .map((f) => {
      const nome = NOMES[f.properties.name] ?? f.properties.name;
      const proj = projetores[caixaDe(nome)];
      const tol = caixaDe(nome) === "continente" ? 0.6 : 0.35;
      let d = "";
      // Centro para o número: centroide (por área) do maior polígono.
      let maior = { area: 0, centro: [0, 0] };
      for (const pol of poligonos(f.geometry)) {
        pol.forEach((anel, i) => {
          const pts = simplificar(anelParaPontos(anel).map(proj), tol);
          if (pts.length < 3) return;
          d += `M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L")}Z`;
          if (i !== 0) return;
          let a = 0;
          let cx = 0;
          let cy = 0;
          for (let k = 0; k < pts.length; k++) {
            const [x1, y1] = pts[k];
            const [x2, y2] = pts[(k + 1) % pts.length];
            const c = x1 * y2 - x2 * y1;
            a += c;
            cx += (x1 + x2) * c;
            cy += (y1 + y2) * c;
          }
          if (Math.abs(a) > maior.area) maior = { area: Math.abs(a), centro: [Math.round(cx / (3 * a)), Math.round(cy / (3 * a))] };
        });
      }
      return { nome, d, centro: maior.centro };
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt"));

  const saida = {
    fonte: "Natural Earth, ne_10m_admin_1_states_provinces (domínio público)",
    viewBox: "0 0 400 520",
    caixasIlhas: { Açores: CAIXAS["Açores"], Madeira: CAIXAS.Madeira },
    regioes,
  };
  const destino = join(import.meta.dirname, "..", "lib", "mapa-portugal.json");
  await writeFile(destino, JSON.stringify(saida));
  console.log(`${regioes.length} regiões, ${(JSON.stringify(saida).length / 1024).toFixed(0)} KB → lib/mapa-portugal.json`);
}

main().catch((err) => {
  console.error(`ERRO: ${err.message}`);
  process.exit(1);
});
