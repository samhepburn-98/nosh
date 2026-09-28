# Nosh meal planner

A meal-planning web app for Nosh, a charity helping low-income households eat well on a budget. Users mostly have older, smaller phones and do one weekly shop.

**`docs/plan.md` is the spec.** Read the relevant section before building anything. §1 lists what the brief asks for and what we added. Features F1–F8 (§2) give the expected outputs, and those examples are the acceptance tests. The phases, each a few small PRs, are in §7. The original client brief is in `docs/brief/`; `brief.md` is a readable transcript.

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | API on :3002 and web on :5174 (Vite proxies `/api`) |
| `pnpm check` | lint + format check + typecheck + test. **Run before every commit** |
| `pnpm test` / `pnpm lint` / `pnpm typecheck` | Individually |
| `pnpm format` | Prettier, writing changes |
| `pnpm db:reset` | Delete and reseed the SQLite database |

## Workflow

- **Follow docs/plan.md §6, "How we work".** In short:
  - Phases follow the brief's features, and each ships as a few small PRs. One PR at a time, and only start one when asked.
  - Build it on a branch `<type>/<pr>-<name>` (e.g. `feat/1.2-recipe-search`), open the PR, and **stop**. The PR lists what you can now do, endpoints added or changed and what each does, tables, screens and components, what to review closely, and how to try it.
  - When the user asks a question, answer it and don't change code. Change code when asked.
  - Review fixes go in new commits on the same branch, never a force-push.
  - **Never merge until the user says so.** It's squash-merged, so the PR title is a Conventional Commit.
  - Keep PRs reviewable in one sitting (roughly 300–600 hand-written lines). If a PR grows past that, stop and suggest a split.
  - Flag anything not in the brief before building it.
  - Found a question only the client can answer (their data, brand or scope)? Add it to `docs/product-owner-notes.md` in the same PR.
  - When a decision changes the plan, update docs/plan.md in the same PR.
- **Nothing is added before it's used.** Constants, schemas, tables, endpoints, components and dependencies arrive in the PR that first uses them.
- **Show each visible change.** Run the app and check it at 360px and 1280px before opening the PR.
- **Conventional Commits always:** `feat(web): …`, `feat(api): …`, `fix(web): …`, `chore: …`, `docs: …`, `test(domain): …`. Keep commits small, with one concern each.
- **Domain code is written test-first.** Commit the tests (`test(domain): …`), then the code (`feat(domain): …`).
- **Never edit `data/project-nosh-sample-recipes.json`.** It's client data and is seeded exactly as supplied.
- **Pinned versions:** TypeScript `~6.0` (typescript-eslint supports <6.1), ESLint 10, pnpm 12.
- **pnpm install scripts:** pnpm blocks them by default. A dependency that needs one is listed under `allowBuilds` in `pnpm-workspace.yaml`, with a comment saying why.
- **pnpm release age:** pnpm refuses versions published in the last day. Never add a `minimumReleaseAgeExclude`; pin the previous version instead.

## Architecture

```
apps/api/src      domain/ (pure) · db/ · repositories/ · routes/ · http/ · app.ts · server.ts
apps/web/src      app/ · components/{ui,layout} · config/ · features/<name>/{api,components} · hooks/ · lib/ · utils/
packages/shared   zod schemas, inferred types, constants (DIETARY, MEAL_TYPES, DAYS, UNITS),
                  each added in the PR that first uses it
```

- **All TypeScript files and folders are kebab-case. No `index.ts` barrel files.** Import files directly.
- **Shared code:** `@nosh/shared` (`workspace:*`) exports its TS source, with no build step. zod schemas are written by hand, and types come from `z.infer`.

### API
- **Node runs the TypeScript directly** (no build step): relative imports end in `.ts`, and there are no enums or other non-erasable syntax (`erasableSyntaxOnly`).
- **`domain/` is pure:** no Express, Drizzle, `better-sqlite3` or `node:*` imports. All business rules live here, with unit tests.
- **`routes/` are thin:** validate with the shared zod schema, call repositories and domain code, respond. No business rules. They never import `db/`.
- **`repositories/`** map database rows to domain objects.
- **`createApp(db)`** builds the Express app, so tests can pass in an in-memory database. Route tests use `testing/create-test-app.ts` (a seeded in-memory database), so they never import `db/`.
- **The API port is `API_PORT`** (default 3002), not `PORT`, which dev runners often set for the web app.
- **Errors** are always `{ error: { code, message, fields? } }`. zod failures become a 400 with `fields`.
- **SQLite:** set `PRAGMA foreign_keys = ON` and `journal_mode = WAL` on every connection.

### Web ([bulletproof-react](https://github.com/alan2207/bulletproof-react))
- **Imports flow one way:** shared (`components`, `config`, `hooks`, `lib`, `utils`) → `features` → `app`.
- **Route paths live in `config/paths.ts`.** Links and the router both use them.
- **Features never import other features.** Combine them in `app/routes`.
- **Adding a feature folder?** Add its name to `webFeatures` in `eslint.config.js`.
- **One file per endpoint** in `features/<name>/api/`, exporting:
  - a fetcher
  - `…QueryOptions` (for queries)
  - a `use…` hook that accepts `queryConfig` or `mutationConfig`
- **All query keys live in `lib/query-keys.ts`.** Mutations invalidate by these keys, per the table in docs/plan.md §5.
- **`lib/api-client.ts`** is a thin `fetch` wrapper that throws `ApiError`. No axios.

```ts
export const getPlan = (): Promise<Plan> => api.get('/plan');
export const getPlanQueryOptions = () => queryOptions({ queryKey: queryKeys.plan, queryFn: getPlan });
export const usePlan = ({ queryConfig }: { queryConfig?: QueryConfig<typeof getPlanQueryOptions> } = {}) =>
  useQuery({ ...getPlanQueryOptions(), ...queryConfig });
```

## Domain rules (docs/plan.md §3)

- **Ingredients are imported exactly as written,** one record per distinct name. Never rename, merge or correct client data when storing it.
- **The shopping list and matching group ingredients by singular form**, worked out at calculation time and never stored:
  - lowercase and trim the name
  - make the last word singular with `pluralize`, plus the override list
  - only exact matches merge: "pepper" ≠ "red pepper", "rice" ≠ "basmati rice"
- **Units:**
  - Weight (g, kg) and volume (ml, l, tsp = 5 ml, tbsp = 15 ml) convert within their own kind.
  - **Never convert between kinds.** Different kinds share a line: `600 g + 2`.
  - Named units (tin, clove, slice…) add up only with the same unit.
  - If every amount shares a unit, keep it: 1 tbsp + 2 tbsp = 3 tbsp.
- **Rounding happens after adding up:** counts and named units round up to whole numbers, g and ml to the nearest whole number, tsp and tbsp to the nearest 0.5.
- **One A–Z list.** An ingredient with no quantity (salt and pepper) is listed with no amount. No staples list: which ingredients are staples would be our guess, not the client's.
- **Cook from what you have counts every ingredient,** salt and pepper and oil included. No staples list there either: you tick them if you have them.
- **Dietary:**
  - A recipe must meet every selected preference to fit.
  - Recipes that don't fit are never hidden: they're listed after the ones that do, under "These don't quite fit your preferences".
  - Vegan counts as vegetarian and dairy-free.
  - **Never guess tags from ingredients.** Untagged doesn't match.

## UI rules

- **Mobile first** at 360px. Use Tailwind's default breakpoints only.
  - Below `md`: a bottom tab bar.
  - `md` and up: navigation in the top bar.
  - Both are drawn from `components/layout/nav-items.ts`.
- **Every page uses the shell's width** (`max-w-5xl`, set once in the layout). Pages never add their own `max-w-*` or `mx-auto`, so layouts line up across tabs. Use grid columns on wide screens instead of narrowing a page.
- **Tailwind defaults only:** default spacing, sizes, breakpoints and `max-w-*` containers.
  - **No arbitrary values** (`w-[372px]`, `bg-[#…]`). If one is really needed, add a theme token or a named `@utility` in `index.css`.
  - Colours only through theme tokens (`bg-primary`, `text-muted-foreground`).
- **shadcn (Base UI, lucide):**
  - Use an existing component before writing custom markup: `Empty`, `Skeleton`, `Badge`, `Alert`, `Separator`, `sonner`.
  - Forms use `FieldGroup` / `Field` / `FieldSet`, with `data-invalid` + `aria-invalid`.
  - `className` is for layout only.
  - Use `gap-*`, never `space-y-*`.
  - Every `Sheet` and `AlertDialog` has a title.
  - **Use shadcn's defaults.** Leave generated files in `components/ui` exactly as upstream wrote them: no variant or size changes, and pass `className` only for layout.
- **Theme** (contrast measured, docs/plan.md §5):
  - Primary is Nosh Green `#62CC9B` **with Charcoal `#2E373E` text**. Never white text on green.
  - `--ring` is Deep Teal. `--muted-foreground` is `#5F6B73`. `--destructive` is `#A33D17`.
  - Cloud Grey only on Charcoal. Flame Coral only for icons and borders.
- **Accessibility:**
  - Tap targets meet WCAG 2.2 AA (at least 24px). shadcn components keep their default sizes; our own markup (the navigation) is 44px. shadcn's inputs are 16px on phones, so they don't zoom.
  - Real buttons and labels.
  - Colour is never the only signal.
  - WCAG AA contrast.
- **Voice:** warm, plain, no guilt about money. Say "Buy 2 more", not "Missing 2 ingredients".
