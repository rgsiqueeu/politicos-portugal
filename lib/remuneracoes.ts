// Remunerações mensais ilíquidas dos deputados em 2026, transcritas da tabela oficial da Assembleia da República:
// https://www.parlamento.pt/DeputadoGP/Paginas/EstatutoRemuneratorioDeputados.aspx
// (imagem /DeputadoGP/PublishingImages/Mapas_RemuneracoesTPoliticos/remun2026.jpg). Atualizar todos os anos.
export const ANO_REMUNERACOES = 2026;
export const FONTE_REMUNERACOES = "https://www.parlamento.pt/DeputadoGP/Paginas/EstatutoRemuneratorioDeputados.aspx";

export const REMUNERACOES: { cargo: string; vencimento: number; representacao: number }[] = [
  { cargo: "Presidente da Assembleia da República", vencimento: 6840.08, representacao: 2736.03 },
  { cargo: "Vice-Presidente da Assembleia da República", vencimento: 4275.05, representacao: 1068.76 },
  { cargo: "Membro do Conselho de Administração", vencimento: 4275.05, representacao: 1068.76 },
  { cargo: "Presidente de Grupo Parlamentar", vencimento: 4275.05, representacao: 855.01 },
  { cargo: "Secretário da Mesa da Assembleia da República", vencimento: 4275.05, representacao: 855.01 },
  { cargo: "Presidente de Comissão Parlamentar", vencimento: 4275.05, representacao: 641.26 },
  { cargo: "Vice-Presidente de Grupo Parlamentar (com um mínimo de 20 deputados)", vencimento: 4275.05, representacao: 641.26 },
  { cargo: "Vice-Secretário da Mesa da Assembleia da República", vencimento: 4275.05, representacao: 641.26 },
  { cargo: "Deputado em regime de exclusividade", vencimento: 4275.05, representacao: 427.51 },
  { cargo: "Deputado", vencimento: 4275.05, representacao: 0 },
];
export const VENCIMENTO_BASE = 4275.05;

export const euros = (v: number) =>
  v.toLocaleString("pt-PT", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });
