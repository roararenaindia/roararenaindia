# Roar Arena Phase 4: Template-Based Post System

This phase adds the first real post-generation system without random AI image generation.

## New route

```txt
/studio
```

## What Studio does

- Choose a locked template:
  - Result
  - Fixtures
  - Preview
- Pull live matches from `/api/public/home`.
- Convert a live match into a post template.
- Edit headline, date, venue, teams, score, and fixtures.
- Generate a consistent 1080×1080 Roar Arena SVG.
- Download:
  - SVG
  - PNG from browser canvas

## New API

```txt
GET /api/templates/instagram
POST /api/templates/instagram
```

POST body example:

```json
{
  "kind": "result",
  "headline": "MATCH RESULT",
  "eyebrow": "FIFA WORLD CUP 2026",
  "date": "June 13, 2026",
  "home": {
    "name": "USA",
    "logo": "/assets/teams/fifa/usa.png",
    "score": 4,
    "tag": "WIN"
  },
  "away": {
    "name": "Paraguay",
    "logo": "/assets/teams/fifa/paraguay.png",
    "score": 1
  }
}
```

## Why this is better

- No random visuals.
- Same Roar Arena layout every time.
- Uses real project assets.
- Works with live match data.
- Outputs reusable graphics.
- Keeps automation stable before Instagram publishing automation.

## Next phase

Phase 5 can add:
- Save generated templates to Supabase.
- One-click “generate from selected match”.
- Approval queue.
- Later: publish to Instagram after approval.
