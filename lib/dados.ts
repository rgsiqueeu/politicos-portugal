import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "data", "gerado");
const ler = <T>(f: string): T => JSON.parse(readFileSync(join(DIR, f), "utf8"));

export type Resumo = {
  id: string;
  slug: string;
  nome: string;
  nomeCompleto: string;
  circulo: string;
  gp: string | null;
  emFuncoes: boolean;
  situacaoAtual: string;
  sexo: "M" | "F" | null;
  nascimento: string | null;
};

export type Presenca = { reuniao: string; data: string; codigo: string; motivo: string | null };

export type Desvio = {
  votacao: string;
  data: string;
  sentido: Sentido;
  sentidoBancada: Sentido | null;
  resultado: string;
  fase: string;
  descricao: string | null;
  iniciativas: { id: string; tipo: string; numero: string; titulo: string }[];
  diario: string | null;
};

export type Sentido = "a_favor" | "contra" | "abstencao";

export type Perfil = Resumo & {
  situacoes: { situacao: string; inicio: string; fim: string | null }[];
  gps: { sigla: string; inicio: string; fim: string | null }[];
  sexo: "M" | "F" | null;
  nascimento: string | null;
  profissao: string | null;
  habilitacoes: string[];
  cargosFuncoes: { texto: string; antigo: boolean }[];
  comissoes: { nome: string; cargo: string | null; situacao: string | null }[];
  gruposAmizade: { nome: string; cargo: string | null }[];
  iniciativas: {
    id: string;
    tipo: string;
    numero: string;
    titulo: string;
    entrada: string | null;
    ultimaFase: string | null;
    ultimaFaseData: string | null;
    temas: string[];
    estado: EstadoIniciativa;
  }[];
  intervencoes: { id: string; data: string; tipo: string | null; sumario: string | null; diario: string | null; temas: string[] }[];
  requerimentos: { id: string; data: string; tipo: "PER" | "REQ"; numero: string; assunto: string; temas: string[] }[];
  presencas: Presenca[];
  desviosBancada: Desvio[];
};

export type Reuniao = { id: string; data: string; numero: number; sessao: string; tipo: string };

export type Votacao = {
  id: string;
  data: string;
  resultado: string;
  unanime: boolean;
  fase: string;
  descricao: string | null;
  ausencias: string[];
  diario: string | null;
  iniciativas: { id: string; tipo: string; numero: string; titulo: string }[];
  sentidos: Partial<Record<Sentido, string[]>>;
};

export type Factos = {
  mulheres: number;
  homens: number;
  idadeMedia: number | null;
  idadeMin: number | null;
  idadeMax: number | null;
  comIdade: number;
  profissoes: { nome: string; n: number }[];
  comProfissao: number;
  votacoesAprovadas: number;
  votacoesUnanimes: number;
  perguntasRequerimentos: number;
  intervencoes: number;
  ultimaReuniao: string | null;
};

export type Meta = {
  legislatura: string;
  inicioLegislatura: string;
  geradoEm: string;
  recolhidoEm: string;
  fontes: Record<string, { pagina: string; ficheiro: string; bytes: number; recolhidoEm: string }>;
  grupos: { sigla: string; nome: string }[];
  circulos: { id: string; nome: string }[];
  contagens: Record<string, number>;
  factos: Factos;
};

export const meta = (): Meta => ler("meta.json");
export const deputados = (): Resumo[] => ler("deputados.json");
export const reunioes = (): Reuniao[] => ler("reunioes.json");
export const votacoes = (): Votacao[] => ler("votacoes.json");

export type EstadoIniciativa = "publicada" | "rejeitada" | "retirada" | "em_curso";
export type IniciativaTema = {
  id: string;
  tipo: string;
  numero: string;
  titulo: string;
  entrada: string | null;
  estado: EstadoIniciativa;
  temas: string[];
  autores: string[];
};
export const todasIniciativas = (): IniciativaTema[] => ler("iniciativas.json");
export const ESTADO: Record<EstadoIniciativa, string> = {
  publicada: "Aprovada e publicada",
  rejeitada: "Rejeitada",
  retirada: "Retirada",
  em_curso: "Em curso",
};
export const perfil = (slug: string): Perfil | null => {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    return ler(join("perfis", `${slug}.json`));
  } catch {
    return null;
  }
};
export const slugs = () =>
  readdirSync(join(DIR, "perfis")).map((f) => f.replace(/\.json$/, ""));

export const circuloSlug = (nome: string) =>
  nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Códigos de presença (texto das páginas oficiais da AR). Ver docs/fontes-ar.md.
export const PRESENCA: Record<string, { texto: string; grupo: GrupoPresenca }> = {
  PR: { texto: "Presença", grupo: "presenca" },
  PNO: { texto: "Presença noutro órgão", grupo: "presenca" },
  ME: { texto: "Ausência em missão parlamentar", grupo: "missao" },
  MP: { texto: "Ausência em missão parlamentar", grupo: "missao" },
  FJ: { texto: "Falta justificada", grupo: "falta_justificada" },
  QVJ: { texto: "Falta justificada", grupo: "falta_justificada" },
  QV: { texto: "Falta ao quórum de votação", grupo: "falta" },
  FA: { texto: "Falta", grupo: "falta" },
  FI: { texto: "Falta injustificada", grupo: "falta" },
};
export type GrupoPresenca = "presenca" | "missao" | "falta_justificada" | "falta" | "por_confirmar";
export const grupoPresenca = (codigo: string): GrupoPresenca => PRESENCA[codigo]?.grupo ?? "por_confirmar";

export const SENTIDO: Record<Sentido, string> = {
  a_favor: "a favor",
  contra: "contra",
  abstencao: "abstenção",
};

export const AR = {
  biografia: (id: string) => `https://www.parlamento.pt/DeputadoGP/Paginas/Biografia.aspx?BID=${id}`,
  atividade: (id: string) => `https://www.parlamento.pt/DeputadoGP/Paginas/ActividadeDeputado.aspx?BID=${id}`,
  iniciativa: (id: string) => `https://www.parlamento.pt/ActividadeParlamentar/Paginas/DetalheIniciativa.aspx?BID=${id}`,
  reuniao: (id: string) => `https://www.parlamento.pt/DeputadoGP/Paginas/DetalheReuniaoPlenaria.aspx?BID=${id}`,
};

// Fotografias oficiais da AR, guardadas em versão leve (scripts/fotos.mjs).
export const foto = (id: string) => `/fotos/${id}.webp`;
export const miniatura = (id: string) => `/fotos/p/${id}.webp`;

const fmt = new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Lisbon" });
const fmtHora = new Intl.DateTimeFormat("pt-PT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Lisbon",
});
export const data = (s: string | null) => (s ? fmt.format(new Date(`${s.slice(0, 10)}T12:00:00Z`)) : "—");
export const dataHora = (s: string) => fmtHora.format(new Date(s));
export const num = (n: number) => n.toLocaleString("pt-PT");

export function idade(nascimento: string | null, hoje = new Date()) {
  if (!nascimento) return null;
  const n = new Date(nascimento);
  let a = hoje.getFullYear() - n.getFullYear();
  if (hoje.getMonth() < n.getMonth() || (hoje.getMonth() === n.getMonth() && hoje.getDate() < n.getDate())) a--;
  return a;
}

export const cargoDeputado = (sexo: "M" | "F" | null) =>
  sexo === "F" ? "Deputada" : sexo === "M" ? "Deputado" : "Deputado(a)";
