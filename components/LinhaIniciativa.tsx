import { AR, ESTADO, data, type IniciativaTema } from "@/lib/dados";

export default function LinhaIniciativa({ i }: { i: IniciativaTema }) {
  return (
    <li>
      <small>
        {data(i.entrada)} · {i.tipo} n.º {i.numero} · {i.autores.join(", ") || "—"}
      </small>
      <br />
      <a href={AR.iniciativa(i.id)}>{i.titulo}</a>{" "}
      <span className={`estado-ini ${i.estado}`}>{ESTADO[i.estado]}</span>
    </li>
  );
}
