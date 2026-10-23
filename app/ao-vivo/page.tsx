import type { Metadata } from "next";
import Link from "next/link";
import MaisVistos from "@/components/MaisVistos";
import { deputados } from "@/lib/dados";

export const metadata: Metadata = { title: "Ao vivo" };

export default function AoVivo() {
  return (
    <div className="dentro pagina">
      <h1 className="display">
        <span className="ponto-vivo" aria-hidden="true" />
        Ao vivo
      </h1>
      <p>
        Quantas pessoas estão a usar o site, o que mais abrem e de onde nos visitam. Os números mudam sozinhos a cada 30
        segundos.
      </p>
      <MaisVistos pessoas={deputados().map(({ slug, id, nome, gp }) => ({ slug, id, nome, gp }))} completo />
      <p className="nota" style={{ marginTop: "1.5rem" }}>
        Contagem anónima: sem cookies, sem endereço IP gravado e sem conta. Se o teu browser pede “não rastrear”, não
        contamos nada. Estes números nunca servem para ordenar políticos. <Link href="/metodologia#privacidade">Mais sobre privacidade</Link>.
      </p>
    </div>
  );
}
