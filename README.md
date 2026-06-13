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

Para o **deploy** no GitHub Pages funcionar com o Supabase, adicione as mesmas
duas variáveis como **secrets** do repositório:
**Settings > Secrets and variables > Actions > New repository secret**, com os
nomes `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

## Estrutura

```
src/
  domain/dnd.ts          Constantes 5e (atributos, perícias, classes) e cálculos
  types/character.ts     Modelo da ficha (CharacterData) e ficha vazia padrão
  lib/
    supabase.ts          Cliente Supabase
    characters.ts        CRUD de personagens (listar, criar, ler, salvar, apagar)
  auth/                  Provedor de autenticação (email/senha)
  components/
    form.tsx             Campos reutilizáveis (texto, número, select, área)
    editor/              Blocos do editor (atributos, perícias, ataques, magias...)
    CharacterCard.tsx    Card da galeria
  pages/
    Login.tsx            Entrar / criar conta
    Gallery.tsx          Galeria de personagens (CRUD)
    CharacterEditor.tsx  Editor completo da ficha 5e
    CharacterSheet.tsx   Ficha em estilo papel + impressão (window.print)
supabase/schema.sql      SQL do banco (tabela characters + RLS)
```

## Funcionalidades

- Login por email/senha (Supabase Auth)
- Galeria de personagens com criar, editar e apagar
- Editor completo da ficha de D&D 5e com cálculos automáticos (modificadores,
  bônus de proficiência, testes de resistência, perícias, CD de magia, etc.)
- Visualização da ficha em estilo "papel" e impressão fiel num clique
