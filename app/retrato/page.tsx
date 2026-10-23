import type { Metadata } from "next";
import Fonte from "@/components/Fonte";
import Retrato from "@/components/Retrato";
import { deputados, idade, meta } from "@/lib/dados";

export const metadata: Metadata = { title: "Retrato do Parlamento" };

export default function RetratoPagina() {
  const m = meta();
  const em = deputados().filter((d) => d.emFuncoes);
  const siglas = new Set(em.map((d) => d.gp));
  return (
    <div className="dentro pagina">
      <h1 className="display">Retrato do Parlamento</h1>
      <p>
        Como se distribuem os {em.length} deputados em funções pelo país: quantos elege cada círculo, quantas mulheres,
        que idades e onde foram eleitos os deputados de cada grupo parlamentar. Escolhe o que queres ver.
      </p>
      <Retrato
        linhas={em.map((d) => ({ circulo: d.circulo, gp: d.gp, sexo: d.sexo, idade: idade(d.nascimento) }))}
        circulos={m.circulos.map((c) => c.nome)}
        grupos={m.grupos.filter((g) => siglas.has(g.sigla)).sort((a, b) => a.sigla.localeCompare(b.sigla, "pt"))}
      />
      <Fonte texto="informação base e registo biográfico" />
    </div>
  );
}
