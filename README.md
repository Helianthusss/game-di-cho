# Chợ Bình An

Browser-based 3D Vietnamese market game with persistent profiles and a shared presence room.

## Play

- Click/tap the ground: walk to the point using obstacle-aware pathfinding. Drag rotates the camera.
- WASD / arrow keys: move relative to the camera and cancel the automatic route; Shift: run.
- Drag the scene to rotate; wheel to zoom; Q/R also rotate on desktop.
- E: interact with the nearest stall, recipient or personal business counter.
- Tap a shopping-list item to guide the gold marker to its stall.

The map follows design option 02 (`../thiet-ke-binh-an`): a 280 × 170 m town inside a ring road. The traditional market with four gates sits on the west by the river; three wholesale halls, a rear truck lane, truck yard and warehouse are to the north; a shophouse boulevard, the central restaurant and the clock-tower square are in the centre; old residential lanes and the boarding house are south-west; the lakeside gate leads east to the lake park, villas and apartments. An orange delivery route links boarding house, market, restaurant and lakeside gate. All positions come from `public/city-layout.js`, which the build also injects into the server. A minimap and M map panel provide waypoints; an overview camera shows the district. This is a fictional layout inspired by Vietnamese wholesale markets, not a measured replica of Thu Duc or Dong Xuan.

A separate transport job pays 35K and 25 XP for physically collecting a parcel at the warehouse and delivering it to Chi Ut. Collection has a two-minute cooldown and does not replace the three main orders required to own a stall.

Three order types rotate: family meal, ingredients for Chị Út, and a regular customer's fish order. Buy the required items, choose lots by price/quality, bargain at most twice per vendor, and deliver at the specified recipient. Fresh lots earn 4 extra XP per required item. Standard lots keep the existing economy. The first three standard orders yield level 3 and 264K; a new stall costs 200K and requires level 3, three completed jobs and at least 250K savings.

Owners can restock, set prices and serve one NPC order per 90-second window at the physical business counter. NPC customer groups have different quantities and per-bunch budgets (9K/12K/10K/15K); the database enforces the current offer. Player-to-player trades remain supported by the business panel. The first prototype displays up to 20 players through 1.5-second presence polling; this is not a WebSocket server.

## Source and build

- `public/world3d.js`: Three.js scene, camera, controls, collision and characters.
- `public/wholesale.js`: warehouse district, hall aisles, parking, traffic and region map.
- `public/online.js`: game interactions and server state.
- `worker/index.js`, `worker/missions.js`: authenticated API and mission rules.
- `drizzle/`: immutable, ordered SQLite/D1 migrations; do not rewrite applied files.
- `scripts/build.mjs`: embeds the game assets into `dist/server/index.js`.

Run `node scripts/build.mjs` to build and `node scripts/check-server.mjs` for economic and progression checks (requires Python 3 for a temporary SQLite database). `node scripts/dev-server.mjs` serves a local preview at `http://127.0.0.1:4177` with temporary test identities; that identity mock is not part of the production worker. Production uses Sites-provided authenticated user headers and the `DB` D1 binding.

## Dependencies

Three.js r160 is vendored as `public/three.module.min.js` from the official `mrdoob/three.js` repository, under the MIT license in `public/three-LICENSE.txt`. No runtime CDN is needed for 3D rendering. Models and materials are generated in code. The stylesheet uses an optional Google Font with a system-font fallback.

The living-market layer adds 30 local moving NPCs with shopper pauses, pushcarts and warehouse porters, plus hall vendors. These are separate from authenticated online players. A light-density setting and optional synthesized ambience are available; the setting is stored only as a local preference. See `UPGRADE-PLAN.md` for implemented items and proposed future work.
