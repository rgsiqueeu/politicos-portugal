// Descarrega as fotografias oficiais dos deputados (site da AR) e grava versões leves em public/fotos/<id>.webp
// e miniaturas em public/fotos/p/<id>.webp.
// Só descarrega as que ainda não existem. Fotografias: Assembleia da República.
//
// Uso: node scripts/fotos.mjs

import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const RAIZ = join(import.meta.dirname, "..");
const OUT = join(RAIZ, "public", "fotos");
const URL_FOTO = (id) => `https://app.parlamento.pt/webutils/getimage.aspx?id=${id}&type=deputado`;

async function main() {
  await mkdir(OUT, { recursive: true });
  const deputados = JSON.parse(await readFile(join(RAIZ, "data", "gerado", "deputados.json"), "utf8"));
  const falta = deputados.filter((d) => !existsSync(join(OUT, `${d.id}.webp`)));
  console.log(`${falta.length} fotografias por descarregar`);
  let ok = 0;
  const falhas = [];
  // 4 em paralelo para não sobrecarregar o servidor da AR.
  for (let i = 0; i < falta.length; i += 4) {
    await Promise.all(
      falta.slice(i, i + 4).map(async (d) => {
        try {
          const res = await fetch(URL_FOTO(d.id), { signal: AbortSignal.timeout(120_000) });
          if (!res.ok || !/image/i.test(res.headers.get("content-type") ?? "")) throw new Error(`HTTP ${res.status}`);
          await sharp(Buffer.from(await res.arrayBuffer()))
            .resize(240, 300, { fit: "cover", position: "attention" })
            .webp({ quality: 78 })
            .toFile(join(OUT, `${d.id}.webp`));
          ok++;
        } catch (err) {
          falhas.push(`${d.nome} (${d.id}): ${err.message}`);
        }
      }),
    );
  }
  console.log(`${ok} gravadas, ${falhas.length} falhas`);
  for (const f of falhas) console.log(`  falhou: ${f}`);

  // Miniaturas para mosaicos e listas.
  await mkdir(join(OUT, "p"), { recursive: true });
  let mini = 0;
  for (const d of deputados) {
    const origem = join(OUT, `${d.id}.webp`);
    const destino = join(OUT, "p", `${d.id}.webp`);
    if (existsSync(origem) && !existsSync(destino)) {
      await sharp(origem).resize(72, 90).webp({ quality: 70 }).toFile(destino);
      mini++;
    }
  }
  console.log(`${mini} miniaturas novas`);
}

main();
