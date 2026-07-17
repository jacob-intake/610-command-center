@shared/CLAUDE.md

# 610 Command Center

Next.js app (`pages/`, `lib/`) plus the vendored **Arcads skill pack** (from
[krusemediallc/arcads-claude-code](https://github.com/krusemediallc/arcads-claude-code))
for generating marketing creative.

# Arcads-specific session rules

- **API:** Arcads external API (`https://external-api.arcads.ai`).
- **Auth:** HTTP Basic via `ARCADS_BASIC_AUTH` or `ARCADS_API_KEY` — set as an environment variable (Claude Code environment settings) or in `.env` (never committed). Setup check: `./scripts/check-arcads-env.sh`.
- **Skill:** `.claude/skills/arcads-external-api/SKILL.md` for API calls, prompts, and polling.
- **YouTube thumbnails:** `.claude/skills/generate-youtube-thumbnail/SKILL.md` (uses the Nano Banana 2 image endpoint via Arcads).
- **Image-ad ecosystem (Meta image creatives):** read `shared/skills/image-ad-prompting/OVERVIEW.md` FIRST. Three skills (`chatgpt-image-ad`, `nano-banana-image-ad`, `image-ad-clone`) + a shared 37-template prompt library. The `image-ad-clone` skill asks which backend to validate against at Phase 1, so generic "clone this ad" prompts route correctly. Output is image files; Meta upload is the separate `meta-ad-builder` skill.
- **Cost disclosure:** Always present credit totals as **estimates** — Arcads has no billing endpoint. Tell the user to confirm exact pricing in the Arcads platform.
- **Logging:** Log every generation call to `logs/arcads-api.jsonl` (see `logs/README.md` for the schema).
- **Reference media** (face photos, product shots, style boards) goes in `references/` — local-only, never committed. The upstream pack repo also carries example reference media if needed.
- **First-time setup:** If neither `ARCADS_BASIC_AUTH`/`ARCADS_API_KEY` env vars nor `.env` are present, copy `.env.example` to `.env` and have the user fill in credentials. If `MASTER_CONTEXT.md` is missing, copy `MASTER_CONTEXT.template.md` to `MASTER_CONTEXT.md`.
