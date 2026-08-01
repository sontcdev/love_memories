# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Primary reference: AGENTS.md

**Read `AGENTS.md` in full before doing any non-trivial work here.** It is the
maintained source of truth for this repo (commands, schema, architecture, the
template/edit-page dual-generation split, dark-mode wiring, bundle-size
gotchas, deployment workflow) and is kept up to date as the codebase changes.
This file only calls out what's easy to miss or get wrong on a first pass —
it does not restate AGENTS.md.

## Fastest way to get productive

```bash
./start.sh              # the only command needed to run the app — do all setup itself
npm test                 # Vitest, 282 tests, must pass
npx tsc --noEmit          # typecheck, fastest signal
npm run build             # prisma generate + next build
npm run budget            # First Load JS budget check
```

Run all four after any change of consequence (see AGENTS.md "Verification").

## The single most important invariant

This repo has **two generations of code living side by side on purpose**:
- 7 `LinkType`s (`LOVE`, `LOVE2`, `EVERY`, `IDOL`, `GRAD_PERSONAL`, `GRAD_CLASS`, `GRAD_GROUP`) still route to byte-identical-to-`deploy` components/forms.
- 3 `LinkType`s (`WEDDING`, `TRAVEL`, `FRIENDSHIP`) route to the new `TemplateEditShell` / `*V2` implementation.

Never "clean up" or "modernize" an unsuffixed (deploy-parity) file — verify
byte-identity with `git show deploy:<path> | diff - <path>` before touching
one. AGENTS.md's "Templates" and "Edit Page" sections explain exactly which
files pair up and why.

## Database safety

Development points at the **live Supabase Session pooler**
(`aws-1-ap-south-1.pooler.supabase.com`, project `llgblesxzhhmbfvfcfzr`), not
an isolated local database — it holds real customer links. Never switch
`LOCAL_POSTGRES_DOCKER` on or run destructive SQL without checking which
`.env*` profile (dev vs. production, different hosts) is active first.

## Deployment safety

Pushing to the test environment (`test.memorae.me`) and touching production
(`memorae.me`, `www.memorae.me`, the `deploy` branch) are different actions
against the *same* Vercel project — see AGENTS.md "Deployment (Vercel)" for
the exact alias workflow. Never run `vercel --prod`, `vercel promote`, or
alias anything onto the production domains unless explicitly asked to deploy
to production.
