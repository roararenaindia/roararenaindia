# Roar Arena Instagram Auto-Sync Setup

This app can show your Instagram posts inside the website feed, but it cannot use your Instagram password directly. It must use Meta's official Instagram API.

## What you get after setup

```txt
You post on Instagram
-> /api/sync/instagram fetches recent media
-> media is copied into Supabase Storage when possible
-> post data is saved into roar_posts
-> /api/public/home shows it on the homepage
-> Latest from the arena updates automatically
```

## What the app needs

Add these values in local `.env.local` and in Vercel environment variables:

```txt
INSTAGRAM_USER_ID=your_numeric_instagram_user_id
INSTAGRAM_ACCESS_TOKEN=your_long_lived_instagram_access_token
INSTAGRAM_SYNC_LIMIT=18
INSTAGRAM_STORAGE_BUCKET=roar-instagram
```

The Instagram profile URL and password are not enough. The token must come from Meta Developer tools.

## Account requirement

The Roar Arena Instagram account must be a professional account:

```txt
Instagram app -> Settings and activity -> Account type and tools -> Switch to professional account
```

Choose Business or Creator. Meta's Instagram API is for professional accounts.

## Token setup steps

1. Open [Meta for Developers](https://developers.facebook.com/).
2. Create or open a Meta app for Roar Arena.
3. Add the Instagram product.
4. Use Instagram API with Instagram Login or Instagram API with Facebook Login.
5. Log in as the Roar Arena Instagram account owner.
6. Grant media/profile permissions.
7. Get the numeric Instagram user ID.
8. Get a long-lived access token.
9. Put both values in Vercel:

```txt
INSTAGRAM_USER_ID=
INSTAGRAM_ACCESS_TOKEN=
```

10. Redeploy the app.

## Verify inside Roar Arena

Open:

```txt
/admin
```

Then run:

- Instagram Check
- Sync IG
- Final Check

If Instagram Check says `Account valid` and `Media readable`, the connection is working.

## Token expiry

Long-lived Instagram tokens expire. Meta currently documents long-lived token refresh behavior as 60-day based, so treat this as maintenance:

```txt
Refresh the Instagram access token before it expires.
```

If the token expires, Instagram sync will stop until a new token is added.

## Useful official docs

- [Instagram API with Instagram Login](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/)
- [Instagram media reference](https://developers.facebook.com/docs/instagram-platform/reference/instagram-media/)
- [Instagram access token reference](https://developers.facebook.com/docs/instagram-platform/reference/access_token/)
- [Refresh access token](https://developers.facebook.com/docs/instagram-platform/reference/refresh_access_token/)

