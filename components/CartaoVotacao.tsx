import { AR, SENTIDO, data, type Sentido, type Votacao } from "@/lib/dados";

const classe = (r: string) => (r === "Aprovado" ? "aprovado" : r === "Rejeitado" ? "rejeitado" : "outro");

export default function CartaoVotacao({ v }: { v: Votacao }) {
  const ini = v.iniciativas[0];
  return (
    <li className="votacao">
      <div className="topo-v">
        <span>
          {data(v.data)} · {v.fase}
        </span>
        <span style={{ display: "flex", gap: ".35rem" }}>
          {v.unanime && <span className="unanime">Unanimidade</span>}
          <span className={`resultado ${classe(v.resultado)}`}>{v.resultado}</span>
        </span>
      </div>
      <h3>
        {ini ? (
          <a href={AR.iniciativa(ini.id)}>{ini.titulo}</a>
        ) : (
          v.descricao ?? "Votação"
        )}
      </h3>
      {ini && (
        <small>
          {ini.tipo} n.º {ini.numero}
          {v.iniciativas.length > 1 ? ` e mais ${v.iniciativas.length - 1}` : ""}
        </small>
      )}
      {!v.unanime && (
        <dl className="sentidos">
          {(["a_favor", "contra", "abstencao"] as Sentido[])
            .filter((s) => v.sentidos[s]?.length)
            .map((s) => (
              <div key={s}>
                <dt>{SENTIDO[s]}</dt>
                <dd>{v.sentidos[s]!.join(", ")}</dd>
              </div>
            ))}
        </dl>
      )}
    </li>
  );
}
