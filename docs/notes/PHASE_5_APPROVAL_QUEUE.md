# Roar Arena Phase 5: Generated Post Approval Queue

This phase adds the missing workflow between template generation and public website content.

## New workflow

```txt
/studio
  → generate template post
  → Save Queue

/admin
  → Queue tab
  → approve / reject / publish
```

## New database table

```txt
roar_generated_posts
```

Stores:
- title
- caption
- template kind
- generated SVG
- template payload
- status: draft / approved / rejected / published

## New API routes

```txt
GET    /api/admin/generated-posts
POST   /api/admin/generated-posts
PATCH  /api/admin/generated-posts
POST   /api/admin/generated-posts/publish
```

## What publish does

When you click Publish in admin:
- generated SVG is converted to a data URI
- a post is created in `roar_posts`
- it appears in Latest from Arena
- the generated queue item becomes `published`

## Important note

This phase still does not auto-publish to Instagram. That should remain approval-based.
Phase 6 can add Supabase Storage so generated PNG/SVG assets get permanent public URLs instead of data URIs.
