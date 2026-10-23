import dados from "./temas.json";

export type Tema = { id: string; nome: string; icone: string; palavras: string[] };
export const TEMAS: Tema[] = dados.temas;
export const NOTA_TEMAS = dados.nota;
export const temaPorId = new Map(TEMAS.map((t) => [t.id, t]));
