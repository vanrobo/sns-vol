# One Supabase on work org (SNS)

## Target (work email / SNS GitHub)

| Item | Value |
|------|--------|
| Org | **SNS** (`owiwkpfjtnivmaogvhyj`) |
| **Single project** | **SNS Project** → `dprvfkytknejqvaydnut` |
| URL | `https://dprvfkytknejqvaydnut.supabase.co` |
| Has | Centre + Events (`profiles`, `events`, …) after 021 + cutover |

## Leave behind (personal)

| Item | Value |
|------|--------|
| Org | personal (`gkvaacuspzlwixlwrrum`) |
| Project | **sns-vol** `hyjqsfxqfgnckuwkkwwi` — **do not use as prod** |

## 021 + cutover status

**021 applied + profile sync done.**  
**Events data cutover done** (12 events, publications, awards) via `scripts/cutover-events-to-work.mjs`.  
Internship seed: `scripts/seed-internship-senior.mjs` (senior + junior demo batches).

Synced Centre accounts into `profiles` (admin, coordinators, mentor).

## App env

`sns-frontend/.env.local` points at `dprvfkytknejqvaydnut`. Do not point prod at personal `hyjqsfxqfgnckuwkkwwi`.

## Auth

Middleware resolves `profiles` first, then falls back to `mentor_user_profiles`.

## Deploy

Production Vercel project name: **sns-platform** (work Supabase env).  
Canonical URL target: `https://sns-platform.vercel.app`
