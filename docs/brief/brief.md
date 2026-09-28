# Project Nosh: client brief (transcript)

A text transcript of [`Project Nosh - Candidate_Pack.pptx`](Project%20Nosh%20-%20Candidate_Pack.pptx), the original brief supplied by Enablis. The `.pptx` is the source of truth. This copy exists so the brief can be read on GitHub and by tools.

> © 2026 Enablis. All rights reserved. Nosh is a fictional client created for the Enablis engineering challenge.
>
> Slide text is reproduced as written. Headings and table layout are added for readability. The starter recipes it mentions are kept unchanged in [`data/`](../../data/project-nosh-sample-recipes.json).

---

## 1. Client background: Meet Nosh

Nosh is a charity that helps people on low incomes eat well without overspending. They've asked Enablis to prove out a meal-planning web site that takes the faff out of mealtimes - tasty and nutritional recipes, a weekly plan, and a shopping list that respects a tight budget.

**Our mission:** “No one should have to choose between eating well and making ends meet.”

- **Who they serve:** Households on tight budgets — busy parents, shift workers, students. Many use older phones and shop once a week with a fixed amount to spend.
- **What they do:** Free budget-friendly recipes, community cooking sessions and practical meal-planning support, delivered through local food hubs across the UK.
- **Why this app:** Planning the week ahead is the biggest lever for cutting food cost and waste. Nosh wants that to feel effortless — never like homework.

| Founded | Community food hubs | Households supported |
|---|---|---|
| 2019 | 40+ | 12k |

## 2. The brief: your task

Prepare a working demo you can show to the client's Product Owner and Engineering Manager. One is focused on the product and its users, the other on how you built it, so be ready to talk about both aspects.

**What we would like you to build.** A working web app that lets someone:

1. Pick from a set of built-in starter recipes or add their own, each with ingredients and a method
2. Set a few basic dietary preferences, such as vegetarian or dairy-free, so the recipes on offer suit them
3. Plan recipes across the days of the week
4. Generate a combined shopping list from that plan, with the same ingredient pulled from several recipes and quantities added up sensibly

**Baseline plus one.** Treat that list as the baseline. The rest of the shape is yours, and we would like you to add a feature of your own that you think makes it a stronger solution.

## 3. Ground rules

- This is an AI-assisted challenge, so use whatever AI tooling you like.
- Build it in your own time and bring it along to a session where you will demo it and talk us through how you built it.
- Manage the code as a git repo and bring the history with you.
- We may ask you to add a small feature during the session, so be ready to extend it live.
- Build it as a layered web app you can run locally, with a client UI and a separate API layer behind it. Use whatever languages you like (e.g. TypeScript, Go, Java, .NET, Node, Python).
- How you store data is your call. This is a demo, so feel free to use local storage solutions e.g. sqlite.
- We are providing a set of starter recipes as a JSON file (project-nosh-sample-recipes.json).
- Assume a single user, so there is no need for logins or authentication.
- Please do not pour days into this, around 2 to 3 hours is plenty.

**There is no single right answer here.** Build it the way you would for a client, and come ready to walk us through your decisions and how you worked. We are interested in your judgement, not a checklist.

## 4. Visual identity: brand essentials

**Logo** (supplied as images in the `.pptx`)
- Use on Nosh Charcoal or white backgrounds.
- Keep clear space around the mark — at least the width of the “O”.
- Never recolour, stretch, rotate or add effects.

**Colour**

| Name | Hex | Role |
|---|---|---|
| Nosh Green | `#62CC9B` | primary |
| Deep Teal | `#3AA58F` | secondary |
| Nosh Charcoal | `#2E373E` | backgrounds / text |
| Flame Coral | `#F3764B` | accent |
| Leaf | `#D5C52D` | accent |
| Cloud Grey | `#B7BFC0` | muted text on dark |

Nosh Green leads. Teal and charcoal support. Flame and leaf are small accents — highlights, badges, warnings.

**Typography**
- Nunito — rounded, friendly, free on Google Fonts
- Headings: Nunito Bold (fallback Arial)
- Body: Nunito Sans or system sans

**Voice and accessibility**
- Warm and practical — never preachy or judgemental about budgets.
- Plain language: short words, no jargon, no guilt.
- WCAG AA contrast minimum; must work well on older, smaller phones.
