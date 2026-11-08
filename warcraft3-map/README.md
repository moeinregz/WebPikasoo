# Pikasoo Coast — Warcraft III melee map (12 players)

- File: `(12)PikasooCoast.w3x` — for Warcraft III 1.26 / 1.27 (The Frozen Throne)
- Size 256 x 256 (the biggest size 1.26 allows). Trees never fall: you can harvest lumber from them forever.
- Tropical island: beaches, sea all around, a shallow lagoon in the middle,
  tavern, goblin shops and fountains, 12 bases with a 12,500-gold mine each,
  18 expansions guarded by coastal creeps (murlocs, makrura, sea turtles, ...).
- **Naga rule:** a human player (not a computer) who picks **Night Elf** starts as **Naga**:
  Temple of Tides, 5 Mur'gul Slaves, **Illidan** (the Naga-era Illidan with horns and wings; his Metamorphosis is a toggle with no time limit — press F to turn into the demon, F again to turn back), **Medusa** (renamed Naga Sea Witch) and a **Naga Royal Guard**.

## Install
Copy `(12)PikasooCoast.w3x` into `Warcraft III\Maps\Download\` (or any folder under `Maps`),
then pick Single Player → Custom Game (or LAN) and set the other 11 slots to computers or players.

## Rebuild
`python3 build_map.py` regenerates the map (no dependencies).
