# VERTEX

SaaS PWA para estudante que faz faculdade/curso e tambem estagio. O app centraliza lembretes de prova, estudos, anotacoes com IA, bem-estar, estagio e controle financeiro pessoal.

## O que o app cobre

- Painel **Hoje** com provas proximas, estudos do dia e compromissos de estagio.
- Area de **Faculdade e curso** para provas, revisoes, trabalhos, aulas, atividades e entregas.
- Area de **Anotacoes IA** para salvar conteudos e gerar resumo, palavras-chave, perguntas, flashcards e plano de revisao para prova.
- Area de **Estagio** para reunioes, entregas, supervisores, horarios e status.
- Area **Financas** para registrar quanto ganhou, gastou e investiu, com radar educativo de investimentos.
- **Agenda** unica com faculdade, provas, revisoes, estagio, bem-estar e financeiro.
- PWA instalavel em Android, iPhone, tablets e computadores.

## Como rodar

```bash
npm install
npm run dev
```

Abra:

```text
http://localhost:5173/
```

Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` para usar Supabase real. Sem essas variaveis, o app roda em modo demo local.

## Supabase

1. Crie um projeto no Supabase.
2. Execute `supabase/schema.sql` no SQL Editor.
3. Em Authentication > URL Configuration, configure a URL da Vercel como Site URL e Redirect URL.
4. Ative confirmacao de email e recuperacao de senha em Authentication, se quiser exigir verificacao.
5. Nunca use a service role key no frontend.

## Vercel

O projeto ja inclui `vercel.json` com build `npm run build`, output `dist` e rewrite para SPA/PWA.

Variaveis obrigatorias para Supabase real:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Variaveis opcionais:

```text
VITE_AI_API_ENDPOINT
VITE_INVESTMENT_RADAR_ENDPOINT
VITE_PUSH_PUBLIC_KEY
VITE_PUSH_SUBSCRIBE_ENDPOINT
```

IA e radar de investimentos funcionam com fallback local quando os endpoints opcionais nao forem configurados.

## Deploy

Veja o passo a passo em [DEPLOY.md](./DEPLOY.md).

## Validacao

```bash
npm run deploy:check
```
