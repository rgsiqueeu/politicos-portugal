// Estatísticas de uso anónimas (ver /metodologia#privacidade).
// A chave é a "publishable" do Supabase: pública por desenho. A tabela só se acede por duas funções.

const URL = process.env.SUPABASE_URL ?? "https://rnjcavdztocoswpwbglt.supabase.co";
const CHAVE = process.env.SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_zczdTl0o9U62J5baFK99YQ_kr3HwN1Y";

export async function rpc<T>(funcao: string, args: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(`${URL}/rest/v1/rpc/${funcao}`, {
    method: "POST",
    headers: { apikey: CHAVE, Authorization: `Bearer ${CHAVE}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Supabase ${funcao}: HTTP ${res.status}`);
  const texto = await res.text();
  return (texto ? JSON.parse(texto) : null) as T;
}

export type Estatisticas = {
  agora: number;
  hoje: number;
  ultimas24h: number;
  pessoasDesdeInicio: number;
  paginasVistas: number;
  desde: string | null;
  maisVistos: { caminho: string; pessoas: number }[];
  cidades: { cidade: string; pais: string | null; pessoas: number }[];
  paises: { pais: string; pessoas: number }[];
};
