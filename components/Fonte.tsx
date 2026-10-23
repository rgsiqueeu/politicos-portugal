import { meta, data } from "@/lib/dados";

export default function Fonte({ texto }: { texto?: string }) {
  const m = meta();
  return (
    <p className="fonte">
      Fonte: Assembleia da República · dados abertos · atualizado em {data(m.recolhidoEm)}
      {texto ? ` · ${texto}` : ""}
    </p>
  );
}
