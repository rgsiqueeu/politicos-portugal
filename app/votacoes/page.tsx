import type { Metadata } from "next";
import CartaoVotacao from "@/components/CartaoVotacao";
import Fonte from "@/components/Fonte";
import ListaVotacoes from "@/components/ListaVotacoes";
import { meta, num, votacoes } from "@/lib/dados";

export const metadata: Metadata = { title: "Votações" };

export default function Votacoes() {
  const m = meta();
  const vs = votacoes();
  return (
    <div className="dentro pagina">
      <h1 className="display">Votações</h1>
      <p>
        As {vs.length} votações mais recentes no plenário (de {num(m.contagens.votacoesPlenario)} nesta legislatura), com
        o resultado e o sentido de voto de cada grupo parlamentar. Quando um deputado vota diferente da bancada, aparece
        pelo nome.
      </p>
      <ListaVotacoes
        votacoes={vs.map(({ id, resultado, unanime, iniciativas, descricao }) => ({ id, resultado, unanime, iniciativas, descricao }))}
        cartoes={Object.fromEntries(vs.map((v) => [v.id, <CartaoVotacao key={v.id} v={v} />]))}
      />
      <Fonte texto="iniciativas e votações" />
    </div>
  );
}
