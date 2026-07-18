# Multiplayer setup

The website is a static GitHub Pages app backed by Supabase Auth, Postgres,
Realtime, and Row Level Security.

## Supabase

The project connection used by the browser is stored in `supabase-config.js`.
The publishable key in that file is intentionally public. Never put a Supabase
secret key, service-role key, or database password in the website.

The database schema is stored in:

`supabase/migrations/20260718110000_multiplayer.sql`

Anonymous sign-ins must be enabled in the Supabase dashboard under
Authentication settings. Before making the site broadly public, enable CAPTCHA
protection for anonymous sign-ins.

## How a game works

1. The DM opens `dungeon-dm.html` and creates a game.
2. The DM shares the six-character game code.
3. Each player builds a character, opens `dungeon-player.html`, and joins with
   the code and a display name.
4. Supabase assigns every player a separate authenticated identity and token.
5. The DM stores the authoritative dungeon and validates player actions.
6. Each player receives a separate fog-of-war map calculated from their own
   token, character vision, and light effects.

Players move by dragging their own token. The DM validates the path and movement
allowance before the new position is broadcast, while the player sees a fast
hex-by-hex movement animation. Vision uses the character's vision stat, and an
active torch can extend it to 40 feet. Normal and locked doors do not block
line-of-sight; walls and secret doors do. Explored tiles remain remembered,
while creatures outside the player's current line of sight are hidden.

Use a different browser profile or a private window when testing a second
player. The app intentionally uses separate DM and player authentication storage
keys, so the two views can also be tested in separate tabs on one browser.

## Local preview

From the project directory:

```powershell
node tools/dev-server.mjs 4173
```

Then open:

- `http://127.0.0.1:4173/dungeon-dm.html`
- `http://127.0.0.1:4173/dungeon-player.html`

## GitHub Pages

Push the repository to GitHub, then open repository **Settings → Pages**.
Choose **Deploy from a branch**, select `main`, choose `/ (root)`, and save.
