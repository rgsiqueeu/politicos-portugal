import { createHash } from "node:crypto";
import { rpc } from "@/lib/visitas";

// Regista uma página vista. Não guarda IP nem cookies:
// "visitante" é um hash de IP + browser + data + segredo, que muda todos os dias.
export async function POST(req: Request) {
  const h = req.headers;
  if (h.get("dnt") === "1" || h.get("sec-gpc") === "1") return new Response(null, { status: 204 });
  let corpo: { caminho?: unknown; sessao?: unknown };
  try {
    corpo = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const caminho = typeof corpo.caminho === "string" ? corpo.caminho.split("?")[0].slice(0, 200) : "";
  const sessao = typeof corpo.sessao === "string" ? corpo.sessao.slice(0, 64) : "";
  if (!caminho.startsWith("/") || sessao.length < 8) return new Response(null, { status: 400 });

  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const dia = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Lisbon" });
  const visitante = createHash("sha256")
    .update(`${ip}|${h.get("user-agent") ?? ""}|${dia}|${process.env.SEGREDO_VISITAS ?? "dev"}`)
    .digest("hex");
  const dec = (v: string | null) => {
    if (!v) return null;
    try {
      return decodeURIComponent(v);
    } catch {
      return v;
    }
  };
  try {
    await rpc("registar_evento", {
      p_caminho: caminho,
      p_sessao: sessao,
      p_visitante: visitante,
      p_cidade: dec(h.get("x-vercel-ip-city")),
      p_regiao: dec(h.get("x-vercel-ip-country-region")),
      p_pais: h.get("x-vercel-ip-country"),
    });
  } catch {
    // Estatísticas nunca podem partir o site.
  }
  return new Response(null, { status: 204 });
}
