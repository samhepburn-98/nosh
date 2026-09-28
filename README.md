# Nosh meal planner

A meal-planning web app for Nosh, a charity helping low-income households eat well on a budget. Most of its users have older, smaller phones and do one weekly shop.

- The client's brief: [`docs/brief/brief.md`](docs/brief/brief.md)
- The spec and plan, with every decision and its reason: [`docs/plan.md`](docs/plan.md)
- Questions for the Product Owner: [`docs/product-owner-notes.md`](docs/product-owner-notes.md)

## What you can do

| The brief asks for | In the app |
|---|---|
| **B1** Pick starter recipes, or add your own | **Recipes**: search by name, open a recipe, or add one with **New recipe** |
| **B2** Set a few dietary preferences | **Preferences** (the settings button): recipes that fit come first everywhere, and the rest are still listed |
| **B3** Plan recipes across the week | **Plan**: add meals to any day, from the day or from a recipe |
| **B4** A combined shopping list | **Shopping list**: one A–Z list, with amounts added up sensibly |
| **Our own feature** | **Recipes → From your kitchen**: pick what you have, and every recipe is ranked by how little you'd need to buy |

**Why "From your kitchen":** Nosh says planning is the biggest lever for cutting cost and waste. Cooking with what's already in the cupboard is the other half of that.

## Run it

You need Node 22 (22.22 or later) and pnpm 12.

```bash
pnpm install
pnpm dev      # web on http://localhost:5174, API on http://localhost:3002
```

| Command | What it does |
|---|---|
| `pnpm dev` | The API and the web app. Vite passes `/api` on to the API |
| `pnpm check` | Lint, format check, typecheck and tests. Run before every commit |
| `pnpm test` | Tests only |
| `pnpm build` | Typechecks and builds the web app into `apps/web/dist` |
| `pnpm db:reset` | Deletes the database and seeds it again from `data/`. Restart `pnpm dev` afterwards |

The database is SQLite, in `apps/api/.data/nosh.sqlite` (gitignored). The API creates and seeds it on first start from the client's `data/project-nosh-sample-recipes.json`, which is never edited. The API's port is `API_PORT` (default 3002).

## How it's built

A pnpm monorepo, all TypeScript:

```
apps/api/src      domain/ (the rules, pure) · db/ · repositories/ · routes/ · http/ · app.ts · server.ts
apps/web/src      app/ (routes) · components/ · config/ · features/<name>/{api,components} · hooks/ · lib/ · utils/
packages/shared   zod schemas and types, used by both the API and the web app
```

| Part | Stack |
|---|---|
| API | Node 22 running the TypeScript directly (no build step), Express 5, Drizzle, SQLite (better-sqlite3) |
| Web | React 19, Vite, React Router, TanStack Query, Tailwind 4, shadcn/ui (Base UI), react-hook-form (New recipe only) |
| Shared | zod schemas, so the browser and the API check input against the same rules |
| Tests | Vitest and supertest: 159 tests |

- **The rules live in `apps/api/src/domain`,** with no Express or database code, and were written test-first: adding up amounts, grouping ingredients, preferences, and the kitchen ranking. The examples in [plan §2](docs/plan.md#2-features) are the acceptance tests.
- **Routes are thin:** they check input with the shared schema, call the repositories and the rules, and respond. Every error has the same shape, `{ error: { code, message, fields? } }`, and the form shows `fields` next to the right inputs.
- **Route tests run against an in-memory database** seeded with the starter recipes (`createApp(db)`).
- **The web app follows [bulletproof-react](https://github.com/alan2207/bulletproof-react):** features never import each other (ESLint enforces it), and routes combine them. For example, the Plan page puts the recipes feature's picker in the plan's sheet.
- **One file per endpoint** in `features/<name>/api`, with all query keys in `lib/query-keys.ts`. The endpoints and what each change refreshes are in [plan §4 and §5](docs/plan.md#4-data-and-api).
- **Only the Plan page is in the first download.** Every other page, sheet and dialog loads when first opened.

## Decisions

The full reasoning is in [`docs/plan.md`](docs/plan.md). The ones most worth talking about:

**Shopping list**
- **Ingredients are stored exactly as the client wrote them.** The list groups them by singular form when it's worked out, so "carrot" and "carrots" add up to "carrots 3". Only exact matches merge: "pepper", "red pepper" and "salt and pepper" stay apart.
- **Units convert within their kind, never between kinds.** 500 ml + 2 tbsp is 530 ml, but chicken breast is "600 g + 2": turning two breasts into grams would be a guess.
- **Rounding happens after adding up,** so half an onion twice is 1 onion, not 2.
- **No staples list.** Which ingredients count as staples would be our guess, not Nosh's. Salt and pepper is listed, with no amount.

**Preferences**
- **Recipes that don't fit are never hidden,** only listed after the ones that do. Vegans have 2 recipes, so hiding the rest would leave the page nearly empty.
- **Tags are never guessed from ingredients.** A recipe fits only if it's tagged. Vegan counts as vegetarian and dairy-free. An allergy note says the tags may be incomplete (Product Owner note 1).

**From your kitchen**
- **Ranked by what you'd buy:** fewest to buy, then most you have, then A–Z. Recipes you have nothing for go last, so a short recipe with nothing in common can't come top.
- **Everything counts,** oil and salt and pepper included. You tick them if you have them.

**Design and accessibility**
- **Phone first, at 360px.** A bottom tab bar for the three places (Plan, Recipes, Shopping list), with Preferences behind the settings button because you set them once.
- **Nosh Green with Charcoal text,** never white (1.98:1). Deep Teal fails AA for text, so it's only the focus ring. Every colour pair was measured ([plan §5](docs/plan.md#theme-contrast-measured)).
- **The voice is warm and plain,** with no guilt about money: "Buy 2 more", not "Missing 2 ingredients".
- **shadcn's components are kept exactly as upstream wrote them,** so they stay easy to update. The two known issues below come from that.

**Engineering**
- **Node runs the TypeScript itself,** so the API has no build step and no `tsx`.
- **Drizzle rather than plain SQL:** typed queries, real migrations and parameterised queries, for little extra code.

## Left out

The brief suggests 2 to 3 hours, so these were planned and then cut. Each is a small follow-up.

| Left out | Why it could come back |
|---|---|
| Deleting your own recipe | Lets people undo their own mistakes |
| A "Your recipes only" switch | Makes your own recipes easy to find among the starter ones |
| Scaling amounts to household size | Recipes serve 1 to 6, and the list buys each as written (Product Owner note 6) |
| A download budget and Lighthouse targets | Pages are lazy-loaded. Lighthouse was run once, below |
| Logins and more than one user | The brief asks for a single user |

## Known issues

- **The unit dropdown uses 14px text,** so iPhones zoom in when it's tapped. It's shadcn's `NativeSelect` as supplied. Fixing it means changing that component, or using a different one.
- **Inactive tab labels are 3.49:1,** under AA's 4.5:1. That's shadcn's `Tabs` as supplied, on the Recipes page.
- **New ingredient names are stored as typed,** so "Leeks" keeps its capital next to the client's lowercase names. The shopping list capitalises every name on screen, so it shows only on recipe pages and in the ingredient pickers.
- **A–Z can differ for names with accents.** All recipes sorts in SQLite, and From your kitchen sorts in JavaScript. None of the starter recipes is affected.
- **The web app has no automated tests.** Its behaviour was checked by hand at 360px and 1280px in every PR, and every §2 example was run through on a fresh database in the final pass.
- **One API route test failed once** and couldn't be made to fail again in 37 runs.
- **`pluralize` hasn't had a release since 2019.** It's small and does what's needed, with overrides for the words it gets wrong.

## Lighthouse

Mobile, on the production build (`vite preview` with the API), in the final pass:

| Page | Performance | Accessibility | Best practices | Largest paint |
|---|---|---|---|---|
| Plan | 97 | 97 | 100 | 2.3 s |
| Recipes | 91 | 97 | 100 | 3.1 s |
| Shopping list | 95 | 100 | 100 | 2.5 s |

- **Recipes, accessibility:** the inactive tab contrast above.
- **Plan, accessibility:** Saturday's "Add" button sits under the sticky tab bar when the page first loads, which Lighthouse counts as too small a target. Scrolling brings it clear.
- **SEO scores 83:** there's no meta description or `robots.txt`, which a local demo doesn't need.

## How we worked

- **Plan first.** [`docs/plan.md`](docs/plan.md) was written before any code, from the brief and the client's data, and kept up to date as decisions changed.
- **One small PR at a time,** each reviewed before the next was started: 14, squash-merged, from the app shell to this final pass. Each commit inside a PR is a small Conventional Commit, and they're visible on GitHub.
- **Rules test-first:** the tests were committed, failing, before the code.
- **AI-assisted,** as the brief allows: Claude Code wrote the code to the plan and the rules in [`CLAUDE.md`](CLAUDE.md), and every PR was reviewed before it was merged.
- **Final pass:** a code review of the whole app (six fixes), and a run-through of every §2 example on a fresh database, which found one more bug (Escape emptied the kitchen).

## Product Owner notes

Things only Nosh can answer, mostly about their data. Details, and what the app does meanwhile, are in [`docs/product-owner-notes.md`](docs/product-owner-notes.md).

1. **Some dietary tags look wrong,** including Shepherd's Pie tagged gluten-free with beef stock cubes.
2. **Content gaps:** no vegan breakfast, and no gluten-free or dairy-free breakfast.
3. **The same ingredient in different units,** such as chicken breast in grams and as a count.
4. **Ingredients only in the method,** such as "a little oil".
5. **Near-duplicate ingredients,** such as porridge oats and rolled oats.
6. **Servings range from 1 to 6.** Should the list scale to household size?
7. **No prices, pack sizes, nutrition or cook times.**
8. **The logo:** is there a horizontal version, or is our side-by-side arrangement right? Also the mark alone as a favicon, and clear space in the top bar.
9. **Brand colours that fail accessibility:** Nosh Green needs Charcoal text, and Deep Teal, Flame Coral, Leaf and Cloud Grey are all under AA on white. Are there accessible versions?
