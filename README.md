# Semana de Tecnologia — SETEC XXXIII

Site público do evento, construído com **Astro + TypeScript + Tailwind CSS**,
fiel ao design de referência (página inicial, programação completa e modal
de palestra) e já estruturado para consumir uma API/banco **Supabase (Postgres)**.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:4321`.

## Estrutura

```
src/
  components/   # Hero, PartnersMarquee, SpeakerCard, SessionCard,
                # SessionModal, CTASection, Footer, BottomNav, Logo
  layouts/
    Layout.astro
  lib/
    types.ts           # Tipos do domínio (Speaker, Session, Partner...)
    data.ts             # <-- único ponto de acesso a dados (mock hoje)
    supabaseClient.ts    # cliente Supabase + DDL sugerido, pronto para uso
  pages/
    index.astro          # Página inicial
    programacao.astro    # Programação completa (agrupada por dia)
```

## Páginas

- **`/`** — Hero com gradiente, marquee de parceiros, grid de palestrantes
  em destaque (`#01`, `#02`, `#03`), banner de inscrições, cards de data e
  redes sociais, footer e navbar flutuante inferior com seletor de tema.
- **`/programacao`** — Timeline por dia da semana, com badges de categoria
  (`#KEYNOTE`, `#WORKSHOP`, `#PAINEL`, `#MASTERCLASS`, `#PALESTRA`) e cards
  clicáveis.
- **Modal de palestra** — Renderizado uma única vez em `Layout.astro`
  (`SessionModal.astro`) e populado via JavaScript no clique em qualquer
  card (`data-session-trigger="<id>"`), tanto na Home quanto na Programação.

## Migrando para o Supabase

1. Crie o projeto no Supabase e rode o DDL sugerido em
   `src/lib/supabaseClient.ts` (tabelas `speakers`, `sessions`,
   `session_speakers`, `partners`).
2. Copie `.env.example` para `.env` e preencha `PUBLIC_SUPABASE_URL` e
   `PUBLIC_SUPABASE_ANON_KEY`.
3. Em `src/lib/data.ts`, troque o corpo de cada função (`getSpeakers`,
   `getSessions`, `getPartners`, etc.) por uma chamada equivalente usando
   `supabase.from('...').select('...')`, mantendo a mesma assinatura de
   retorno. **Nenhum componente ou página precisa ser alterado** — todos
   consomem exclusivamente as funções deste arquivo.

## Notas de fidelidade visual

- Tema escuro com gradiente roxo/neon (`bg-hero-gradient`), tokens de cor
  em `tailwind.config.mjs` (`accent`, `base`).
- Badges de categoria usam um único estilo neutro (pill translúcida),
  igual em todas as categorias — conforme as imagens de referência.
- Item ativo da navbar inferior é um pill sólido branco.
- Fotos no modal mantêm proporção quadrada fixa.
- Suporte a tema claro via classe `.light` no `<html>`, alternado pelo
  botão de lua na navbar (persistido em `localStorage`).
