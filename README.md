# Nosh meal planner

A meal-planning web app for Nosh, a charity helping low-income households eat well on a budget.

- The client's brief: [`docs/brief/brief.md`](docs/brief/brief.md)
- What we're building, and how: [`docs/plan.md`](docs/plan.md)
- Questions for the Product Owner: [`docs/product-owner-notes.md`](docs/product-owner-notes.md)

## Run it

You need Node 22 and pnpm 12.

```bash
pnpm install
pnpm dev      # web on http://localhost:5174, API on http://localhost:3001
pnpm check    # lint, format check, typecheck and tests
pnpm db:reset # delete the database and seed it again from data/
```

The full README (setup, architecture and decisions) comes in the final pass.
