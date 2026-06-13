# Grimório de Personagens (D&D 5e)

App para criar, organizar, ver e imprimir fichas de personagens de Dungeons & Dragons 5e.

- **Frontend:** React + Vite + TypeScript + Tailwind v4
- **Backend:** Supabase (Postgres + Auth) — plano free
- **Hospedagem:** GitHub Pages (deploy automático via GitHub Actions)

## Rodar localmente

```powershell
npm install
npm run dev
```

## Build de produção

```powershell
npm run build
npm run preview
```

## Deploy

O deploy é automático: todo push na branch `main` dispara o workflow em
`.github/workflows/deploy.yml`, que builda e publica no GitHub Pages.

Para o deploy funcionar, no GitHub: **Settings > Pages > Build and deployment >
Source** deve estar em **GitHub Actions**.

> O site fica em `https://<usuario>.github.io/dnd-caracters/`. Se o repositório
> tiver outro nome, ajuste o `base` em [vite.config.ts](vite.config.ts).

## Variáveis de ambiente (Supabase)

Copie `.env.example` para `.env` e preencha com os dados do seu projeto Supabase.
Nunca commite o `.env` (já está no `.gitignore`).
