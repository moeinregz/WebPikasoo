# Pikasoo Kingdoms — Warcraft III melee map (12 players)

- File: `(12)PikasooKingdoms.w3x` — Warcraft III 1.26 / 1.27 (The Frozen Throne)
- 256 x 256, the biggest size 1.26 allows. A whole mainland "world":
  - 12 walled castles (stone walls, 4 gates, pre-built towers and farms for every race)
  - a walled capital city in the middle (tavern, marketplace, goblin shops, fountain, houses, villagers)
  - 3 walled towns in the corners and a harbour town with a goblin shipyard on the south-east coast
  - a river from the north down to the sea with 3 stone bridges, a lake, forests, roads
  - 11 expansions + 3 rich mines guarded by creeps; trees never fall
- Humans are Blood Elves: Kunkka (free main hero), Arthas, Uther, Kael'thas, golden knights.
- Orcs are randomly Horde (normal) or Fel Orcs (Chaos Grunt/Raider/Kodo/Warlock, heroes:
  Chaos Blademaster, Grom, Azgalor, Magtheridon). Computer Fel Orcs keep normal peons and get a
  small attack script so they still fight.
- A human player who picks Night Elf becomes Naga: Illidan (horns + wings, toggle Metamorphosis
  with F, no time limit, from level 2, no mana), Medusa and a Naga Royal Guard.

## Install
Copy the `.w3x` into `Warcraft III\Maps\Download\`, then Single Player → Custom Game (or LAN).

## Rebuild
`python3 build_map.py` (no dependencies).
