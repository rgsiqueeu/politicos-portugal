import { rpc, type Estatisticas } from "@/lib/visitas";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const e = await rpc<Estatisticas>("estatisticas");
    return Response.json(e, { headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40" } });
  } catch {
    return Response.json(null, { status: 503 });
  }
}
