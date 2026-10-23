import type { Metadata } from "next";
import Link from "next/link";
import Fonte from "@/components/Fonte";
import { meta, num, todasIniciativas } from "@/lib/dados";
import { TEMAS } from "@/lib/temas";

export const metadata: Metadata = { title: "Temas" };

export default function Temas() {
  const m = meta();
  const ini = todasIniciativas();
  const semTema = ini.filter((i) => i.temas.length === 0).length;
  return (
    <div className="dentro pagina">
      <h1 className="display">Temas</h1>
      <p>
        As {num(ini.length)} iniciativas entregues na {m.legislatura} Legislatura, arrumadas por assunto: saúde,
        habitação, transportes e outros. Toca num tema para ver as propostas, quem as apresentou e em que estado estão.
      </p>
      <ul className="temas">
        {TEMAS.map((t) => {
          const doTema = ini.filter((i) => i.temas.includes(t.id));
          const pub = doTema.filter((i) => i.estado === "publicada").length;
          return (
            <li key={t.id}>
              <Link href={`/temas/${t.id}`} className="tema">
                <span className="icone-tema" aria-hidden="true">
                  {t.icone}
                </span>
                <strong>{t.nome}</strong>
                <span className="nota">
                  {num(doTema.length)} iniciativas · {num(pub)} aprovadas e publicadas
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="nota" style={{ marginTop: "1.5rem" }}>
        Os temas saem de uma lista pública de palavras procuradas no título oficial de cada iniciativa, igual para
        toda a gente e sem inteligência artificial. Uma iniciativa pode ter vários temas; {num(semTema)} não citam
        nenhuma palavra da lista e ficam em “outros assuntos”. <Link href="/metodologia#temas">Ver a lista de palavras</Link>.
      </p>
      <Fonte texto="iniciativas" />
    </div>
  );
}
