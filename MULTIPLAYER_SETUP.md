# Multiplayer setup

The website is a static GitHub Pages app backed by Supabase Auth, Postgres,
Realtime, and Row Level Security.

## Supabase

The project connection used by the browser is stored in `supabase-config.js`.
The publishable key in that file is intentionally public. Never put a Supabase
secret key, service-role key, or database password in the website.

The database schema is stored in:

- `supabase/migrations/20260718110000_multiplayer.sql`
- `supabase/migrations/20260718133000_direct_token_sync.sql`
- `supabase/migrations/20260718163000_character_lobby_rewards.sql`

Anonymous sign-ins must be enabled in the Supabase dashboard under
Authentication settings. Before making the site broadly public, enable CAPTCHA
protection for anonymous sign-ins.

## How a game works

1. Open `index.html` and choose Player or Dungeon Master.
2. The DM opens `dm-lobby.html`, creates a lobby, and shares the six-character
   game code.
3. A player opens `player-lobby.html`, enters the code and a display name, then
   creates or confirms a character.
4. Finishing character creation opens `future.html`, the synchronized character
   sheet and reward inbox.
5. The DM roster updates in realtime with every player's race, class, level, HP,
   abilities, reward count, and online status.
6. The DM can send a reward to one player. Only that player can open and claim
   it, after which the claimed reward is synchronized back to the DM.

The older dungeon-map flow remains in the repository, but it is no longer the
main entry path.

## Legacy VTT flow

1. The DM opens `dungeon-dm.html` and creates a game.
2. The DM shares the six-character game code.
3. Each player builds a character, opens `dungeon-player.html`, and joins with
   the code and a display name.
4. Supabase assigns every player a separate authenticated identity and token.
5. Supabase stores each player token in its own authoritative position row.
6. A secured database function validates token ownership, path adjacency,
   walkable tiles, movement allowance, and position revision.
7. Every DM and player page subscribes directly to token position changes.
8. Each player receives a separate fog-of-war map calculated from their own
   token, character vision, and light effects.

Players move by dragging their own token. The local page runs the same
hex-by-hex animation as the DM view while the database validates and commits the
move. The small position update is broadcast directly to every connected page;
it no longer needs to pass through the DM browser. Fog updates remain
personalized and cannot overwrite authoritative token coordinates.

Vision uses the character's vision stat, and an active torch can extend it to
40 feet. Normal and locked doors do not block vision; walls and secret doors
do. Explored tiles remain remembered, while creatures outside the player's
current sight are hidden.

Use a different browser profile or a private window when testing a second
player. The app intentionally uses separate DM and player authentication storage
keys, so the two views can also be tested in separate tabs on one browser.

## Local preview

From the project directory:

```powershell
node tools/dev-server.mjs 4173
```

Then open:

- `http://127.0.0.1:4173/index.html`
- `http://127.0.0.1:4173/dm-lobby.html`
- `http://127.0.0.1:4173/player-lobby.html`
- `http://127.0.0.1:4173/dungeon-dm.html`
- `http://127.0.0.1:4173/dungeon-player.html`

## GitHub Pages

Push the repository to GitHub, then open repository **Settings → Pages**.
Choose **Deploy from a branch**, select `main`, choose `/ (root)`, and save.
