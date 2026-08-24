# Project Context & Domain Glossary

A living glossary of domain terms and naming decisions, so terminology stays
consistent across code, docs, and conversation — including with an AI assistant
working on this repo. Add a term here the first time its meaning isn't obvious from
the name alone. Keep entries short.

## Domain terms (espresso)

- **Bean** — a batch/bag of coffee beans, identified by name, roaster, origin, and
  roast date. Represents a purchase, not a single physical bean.
- **Roast date** — when the beans were roasted, used to judge freshness. Not the
  purchase date.
- **Shot** — one espresso extraction, always linked to exactly one `Bean`.
- **Dose** — mass (grams) of ground coffee going into the portafilter.
- **Grind size** — the grinder's setting/dial position. A unitless number specific
  to the grinder used — not a physical unit, not comparable across grinders.
- **Grind time** — how long the grinder ran to produce the dose, in seconds.
  Distinct from `duration` (below).
- **Yield** — mass (grams) of liquid espresso collected out.
- **Ratio** — `yield ÷ dose` (e.g. 40g yield / 18g dose ≈ 1:2.2). Always derived
  from `dose` and `yield` — not stored as its own database column.
- **Duration** — total extraction time of the shot, in seconds, from pump-start to
  pump-stop. Distinct from `grind_time`.
- **Rating** — a numeric quality score (e.g. 1–10) capturing overall shot quality.

## Naming decisions

- **`rating`, not `taste`** — decided 2026-08-22. `rating` is more reusable if the
  app ever scores additional dimensions beyond one flavor axis.
- **`grind_time` added as its own field on `Shot`** — decided 2026-08-22. It's a
  real, independent variable when dialing in a grinder, and shouldn't be conflated
  with `duration`.

## Current `Shot` fields (for reference — source of truth is the actual model once written)

`id`, `bean_id`, `dose`, `grind_size`, `grind_time`, `yield`, `duration`, `rating`,
`notes`, `created_at`
