# Políticos de Portugal

Quem nos representa em Portugal, com dados oficiais e abertos, em linguagem simples.
Sem ranking, nota ou recomendação de voto.


## Estado

MVP: os deputados da XVII Legislatura, com perfil, presenças no plenário, iniciativas, intervenções,
perguntas e requerimentos, e votações em que votaram diferente da bancada.

## Como funciona

```bash
npm install
npm run dados     # recolhe os dados abertos da AR (data/raw/) e gera data/gerado/
npm run dev       # site em http://localhost:3000
```

- `scripts/recolha.mjs` descobre os links de download nas páginas de dados abertos da AR (mudam a cada visita)
  e só grava respostas que sejam JSON válido.
- `scripts/processar.mjs` gera `data/gerado/` e pára se uma presença não ligar a um único deputado.
  Avisos não fatais ficam em `data/gerado/relatorio.json`.
- `data/gerado/` está no repositório, para que a publicação não dependa de o site da AR estar no ar.
  Uma GitHub Action atualiza-o todos os dias.
- `scripts/fotos.mjs` guarda as fotografias oficiais em versão leve em `public/fotos/`.
- O site é Next.js, estático, com `noindex` enquanto estiver em testes.
- Estatísticas de visitas (página **Ao vivo**): Supabase, projeto `politicos-app`, tabela `eventos`,
  acedida só pelas funções `registar_evento` e `estatisticas`. Sem cookies nem IP; o código diário de visitante
  usa o segredo `SEGREDO_VISITAS` (variável de ambiente na Vercel). Registos apagados ao fim de 90 dias.
  Limitação conhecida: como qualquer contador público, pode ser inflacionado por quem chame a função diretamente.

Atrás de um proxy (como no ambiente de desenvolvimento do Claude), corre a recolha com `NODE_USE_ENV_PROXY=1`.

## Documentos

- [`docs/principios.md`](docs/principios.md) — regras editoriais e de credibilidade (não negociáveis)
- [`docs/ambito-mvp.md`](docs/ambito-mvp.md) — o que entra na primeira versão e o que fica de fora
- [`docs/fontes-ar.md`](docs/fontes-ar.md) — o que a Assembleia da República publica, campo a campo
