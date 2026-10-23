import type { Metadata } from "next";
import ListaDeputados from "@/components/ListaDeputados";
import Fonte from "@/components/Fonte";
import { deputados, meta } from "@/lib/dados";

export const metadata: Metadata = { title: "Deputados" };

export default function Deputados() {
  const m = meta();
  const todos = deputados();
  const siglas = [...new Set(todos.map((d) => d.gp).filter((g): g is string => !!g))].sort((a, b) => a.localeCompare(b, "pt"));
  return (
    <div className="dentro pagina">
      <h1 className="display">Deputados</h1>
      <p>
        Os {todos.filter((d) => d.emFuncoes).length} deputados em funções na {m.legislatura} Legislatura, por ordem
        alfabética. Filtra por nome, grupo parlamentar ou círculo.
      </p>
      <ListaDeputados deputados={todos} grupos={siglas} circulos={m.circulos.map((c) => c.nome)} />
      <Fonte />
    </div>
  );
}
