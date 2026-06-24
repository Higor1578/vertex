# Deploy do VERTEX

Checklist para subir no GitHub, Vercel e Supabase.

## 1. Supabase

1. Crie um projeto no Supabase.
2. Abra o SQL Editor e execute `supabase/schema.sql`.
3. Em Authentication > URL Configuration:
   - Site URL: `https://SEU-DOMINIO.vercel.app`
   - Redirect URLs: `https://SEU-DOMINIO.vercel.app/**`
   - Para teste local, adicione tambem `http://localhost:5173/**`.
4. Copie:
   - Project URL para `VITE_SUPABASE_URL`
   - anon public key para `VITE_SUPABASE_ANON_KEY`

Nunca coloque a service role key no frontend nem na Vercel para este app.

### Super Admin

Depois de criar sua conta pelo app, promova somente o seu usuario diretamente no SQL Editor do Supabase:

```sql
update public.profiles
set role = 'super_admin', is_blocked = false
where id = (
  select id
  from auth.users
  where email = 'seu-email@dominio.com'
);
```

Em producao, o acesso ao painel `/admin` depende de `public.profiles.role = 'super_admin'`. O atalho de email contendo `admin` existe apenas no modo demo local, quando nao ha variaveis do Supabase configuradas.

## 2. Vercel

Configure as variaveis em Project Settings > Environment Variables:

```text
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-public-key
```

Variaveis opcionais, somente se voce tiver endpoints externos prontos:

```text
VITE_AI_API_ENDPOINT=https://seu-backend.com/ai
VITE_INVESTMENT_RADAR_ENDPOINT=https://seu-backend.com/investment-radar
VITE_PUSH_PUBLIC_KEY=sua-chave-vapid-publica
VITE_PUSH_SUBSCRIBE_ENDPOINT=https://seu-backend.com/push/subscribe
```

Sem esses endpoints opcionais, o app usa fallback local para IA/radar e notificacoes locais enquanto aberto.

## 3. Git

Antes do primeiro push:

```bash
git init
git add .
git commit -m "Prepare VERTEX for Vercel and Supabase"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git push -u origin main
```

## 4. Validacao

```bash
npm run deploy:check
```

Depois do deploy, teste login/cadastro com Supabase real e refresh direto em rotas internas.
