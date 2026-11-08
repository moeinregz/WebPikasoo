#!/usr/bin/env python3
"""
Pikasoo Coast - a 12 player Warcraft III (1.26 / 1.27, The Frozen Throne) melee map.

Run:  python3 build_map.py            -> writes "(12)PikasooCoast.w3x" next to this script

Everything (terrain, pathing, trees, script, minimap, MPQ archive) is generated
from scratch by this file, no third party libraries are needed.

Special rule: a human (non computer) player that picks Night Elf becomes Naga:
Temple of Tides + 5 Mur'gul Slaves + Illidan + Medusa (renamed Naga Sea Witch)
+ a Naga Royal Guard.
"""
import math
import os
import random
import struct
import zlib

random.seed(1404)

# --------------------------------------------------------------------------
# Map geometry
# --------------------------------------------------------------------------
MAP_NAME = "Pikasoo Kingdoms"
AUTHOR = "WebPikasoo"
DESCRIPTION = ("A huge kingdom for up to 12 players: 12 walled castles with towers, a capital city, "
               "three towns, a harbour, a river with stone bridges, a lake and forests. "
               "Humans are Blood Elves (Kunkka, Arthas, Uther, Kael), Orcs are randomly Horde or red Fel Orcs, "
               "human Night Elf players become Naga with Illidan.")
TILES = 256                     # total map size in tiles (256 x 256 = biggest size 1.26 allows)
S = TILES / 192.0               # layout scale (the layout was designed for 192)
PTS = TILES + 1                 # terrain points per side
X0 = Y0 = -TILES * 64.0         # world coordinate of the bottom-left point
MARGIN = 6                      # boundary tiles on each side
PMIN = X0 + MARGIN * 128        # playable area: [PMIN, PMAX] on both axes
PMAX = -X0 - MARGIN * 128
NPLAYERS = 12

WATER_Z = -20.0                 # water surface height
SHALLOW_DEPTH = 55.0            # deeper than this = deep water (not walkable)


def wx(i):
    return X0 + i * 128.0


def wy(j):
    return Y0 + j * 128.0


# --------------------------------------------------------------------------
# Small noise helpers
# --------------------------------------------------------------------------
_waves = [(random.uniform(0.6, 1.4) / 1800.0, random.uniform(0, 6.283), random.uniform(0, 6.283),
           random.uniform(0, 6.283)) for _ in range(9)]


def noise(x, y, scale=1.0, seed=0):
    s = 0.0
    for k, (f, a, p, q) in enumerate(_waves):
        f2 = f * scale * (1 + 0.37 * ((k + seed) % 4))
        ang = a + seed * 1.7
        u = x * math.cos(ang) + y * math.sin(ang)
        v = -x * math.sin(ang) + y * math.cos(ang)
        s += math.sin(u * f2 + p + seed) * math.cos(v * f2 * 0.8 + q)
    return s / 3.0


def polar(r, deg):
    a = math.radians(deg)
    return (r * math.cos(a), r * math.sin(a))


def snap(v, g=64.0):
    return round(v / g) * g


def cheb(x, y, bx, by):
    return max(abs(x - bx), abs(y - by))


def seg_dist(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - ax - t * dx, py - ay - t * dy)


# ==========================================================================
# THE WORLD
#   * a walled capital city in the middle, crossed by two highways
#   * a square ring road around it
#   * 12 player castles (3 on every side) joined to the ring road
#   * 3 walled towns in the corners, a harbour town by the sea in the south east
#   * a river from the northern mountains to the sea, with stone bridges
#   * a lake, forests, expansions and creep camps
# ==========================================================================
RING = 7000.0                  # square ring road (Chebyshev distance from the centre)
BASE_D = 11500.0               # castles
CASTLE_H = 1150.0              # half size of a castle
CAPITAL_H = 2300.0             # half size of the capital walls
MOAT_IN, MOAT_OUT = 190.0, 560.0   # water moat outside every wall (distance from the wall)
TOWN_H = 1300.0                # half size of a corner town
GATE_HALF = 260.0              # half width of a gate opening
SEA_LINE = 23000.0             # x - y beyond this is sea (south east corner)
RIVER_HALF = 400.0             # half width of the river
LAKE = (-4500.0, -4500.0, 1150.0)

# player castles: 3 per side, clockwise starting top-left
starts, sides = [], []
for t in (-7200.0, 0.0, 7200.0):
    starts.append((t, BASE_D)); sides.append((0, 1))
for t in (7200.0, 0.0, -7200.0):
    starts.append((BASE_D, t)); sides.append((1, 0))
for t in (7200.0, 0.0, -7200.0):
    starts.append((t, -BASE_D)); sides.append((0, -1))
for t in (-7200.0, 0.0, 7200.0):
    starts.append((-BASE_D, t)); sides.append((-1, 0))

main_mines = []
for (sx, sy), (nx, ny) in zip(starts, sides):
    ang = math.degrees(math.atan2(ny, nx)) + 38.0           # outward and a bit to the side
    mx, my = polar(660.0, ang)
    main_mines.append((snap(sx + mx), snap(sy + my)))

towns = [(-13000.0, 13000.0), (13000.0, 13000.0), (-13000.0, -13000.0)]
HARBOR = (10500.0, -10500.0)
CAPITAL = (0.0, 0.0)

# river: from the north edge down, east, then south into the sea
river = [(3600.0, PMAX + 600), (3600.0, -3000.0), (14200.0, -3000.0), (14200.0, -14000.0)]

# roads (straight segments)
roads = [
    (0.0, -RING, 0.0, RING), (-RING, 0.0, RING, 0.0),                        # highways through the capital
    (-RING, -RING, RING, -RING), (RING, -RING, RING, RING),                   # ring road
    (RING, RING, -RING, RING), (-RING, RING, -RING, -RING),
]
for (sx, sy), (nx, ny) in zip(starts, sides):                                # castle -> ring road
    roads.append((sx, sy, sx - nx * (BASE_D - RING), sy - ny * (BASE_D - RING)))
for tx, ty in towns + [HARBOR]:                                              # towns -> ring corners
    roads.append((tx, ty, math.copysign(RING, tx), math.copysign(RING, ty)))


def road_dist(x, y):
    return min(seg_dist(x, y, *r) for r in roads)


def river_dist(x, y):
    return min(seg_dist(x, y, *river[k], *river[k + 1]) for k in range(len(river) - 1))


# bridges = places where a road crosses the river
bridges = []                   # (doodad id, x, y)
for rx0, ry0, rx1, ry1 in roads:
    for k in range(len(river) - 1):
        ax, ay = river[k]
        bx, by = river[k + 1]
        # both are axis aligned -> intersect a vertical with a horizontal segment
        if ax == bx and ry0 == ry1 and min(rx0, rx1) <= ax <= max(rx0, rx1) and min(ay, by) <= ry0 <= max(ay, by):
            bridges.append((b'LT10', ax, ry0))           # road runs east-west
        if ay == by and rx0 == rx1 and min(ry0, ry1) <= ay <= max(ry0, ry1) and min(ax, bx) <= rx0 <= max(ax, bx):
            bridges.append((b'LT08', rx0, ay))           # road runs north-south


def near_bridge(x, y, r=520.0):
    return any(math.hypot(x - bx, y - by) < r for _, bx, by in bridges)


# expansions
exp_mines = []
for side in ((0, 1), (1, 0), (0, -1), (-1, 0)):
    for t in (-4600.0, 4600.0):
        nx, ny = side
        x = nx * 9000.0 + (t if nx == 0 else 0.0)
        y = ny * 9000.0 + (t if ny == 0 else 0.0)
        exp_mines.append((snap(x), snap(y)))
rich_mines = [(snap(4500.0), snap(4500.0)), (snap(-4500.0), snap(4500.0)), (snap(4500.0), snap(-4500.0))]

CAMPS = [
    ['nmrl', 'nmrl', 'nmrr'], ['nlsn', 'nlsn', 'nltc'], ['ngno', 'ngno', 'ngnb'],
    ['nmcf', 'nmcf', 'nmsn'], ['nfrl', 'nfrl', 'nfrs'], ['nkob', 'nkob', 'nkog'],
]
BIG_CAMPS = [['ntrt', 'ntrs', 'ntrs'], ['nogm', 'nogr', 'nogr'], ['nmrv', 'nmtw', 'nmsn']]
creeps = []


def add_camp(cx, cy, units, face):
    for k, uid in enumerate(units):
        ox, oy = polar(120, k * 120 + 15)
        creeps.append((uid, cx + ox, cy + oy, face % 360))


for i, (ex, ey) in enumerate(exp_mines):
    d = math.hypot(ex, ey)
    cx, cy = ex - ex / d * 560, ey - ey / d * 560
    add_camp(cx, cy, CAMPS[i % len(CAMPS)], math.degrees(math.atan2(-ey, -ex)) + 180)
for i, (mx, my) in enumerate(rich_mines):
    d = math.hypot(mx, my)
    cx, cy = mx - mx / d * 600, my - my / d * 600
    add_camp(cx, cy, BIG_CAMPS[i % len(BIG_CAMPS)], math.degrees(math.atan2(-my, -mx)) + 180)
lx, ly, lr = LAKE
add_camp(lx + lr + 450, ly + 300, ['nmrl', 'nmrr', 'nmrl'], 180)              # murlocs at the lake
add_camp(lx - 300, ly + lr + 450, ['nmrl', 'nmrm', 'nmrl'], 270)
exp_mines += rich_mines

# --------------------------------------------------------------------------
# Walls (castles, capital, towns) -- generic square wall with 4 gates
# --------------------------------------------------------------------------
castle_walls = []          # (doodad id, x, y)
castle_blockers = []       # invisible path blockers that make the walls solid
castle_towers = []         # per player: list of (x, y)
castle_farms = []          # per player: list of (x, y)


def build_wall(cx, cy, H, corner=None, wall_h=b'ZTw0', wall_v=b'ZTw2'):
    """square wall with a gate in the middle of every side (and optionally an open corner)"""
    def open_at(e, t):
        if abs(t) < GATE_HALF + 100:
            return True
        if corner:
            ex, ey = corner                      # signs of the open corner, e.g. (1, -1)
            if e in 'bt' and (ey < 0) == (e == 'b') and abs(t - ex * H) < 520:
                return True
            if e in 'lr' and (ex < 0) == (e == 'l') and abs(t - ey * H) < 520:
                return True
        return False

    edges = {'b': (lambda t: (cx + t, cy - H), wall_h), 't': (lambda t: (cx + t, cy + H), wall_h),
             'l': (lambda t: (cx - H, cy + t), wall_v), 'r': (lambda t: (cx + H, cy + t), wall_v)}
    for e, (pos, did) in edges.items():
        t = -H
        while t <= H + 1:
            if not open_at(e, t):
                castle_walls.append((did,) + pos(t))
            t += 192.0
        t = -H
        while t <= H + 1:
            if not open_at(e, t - 36 if t > 0 else t + 36):
                castle_blockers.append(pos(t))
            t += 128.0


for pi, (sx, sy) in enumerate(starts):
    H = CASTLE_H
    build_wall(sx, sy, H)
    towers = [(sx + H - 220, sy + H - 220), (sx - H + 220, sy + H - 220),
              (sx - H + 220, sy - H + 220), (sx + H - 220, sy - H + 220)]
    castle_towers.append([(snap(x), snap(y)) for x, y in towers])
    mx, my = main_mines[pi]
    back = math.degrees(math.atan2(sy - my, sx - mx))
    farms = []
    for da in (-55, 0, 55):
        r = 720.0
        while True:
            fx, fy = sx + r * math.cos(math.radians(back + da)), sy + r * math.sin(math.radians(back + da))
            if all(math.hypot(fx - tx, fy - ty) > 300 for tx, ty in towers) and cheb(fx, fy, sx, sy) < H - 200 \
                    and abs(fx - sx) > 180 and abs(fy - sy) > 180 or r < 400:
                break
            r -= 60
        farms.append((snap(fx), snap(fy)))
    castle_farms.append(farms)

build_wall(CAPITAL[0], CAPITAL[1], CAPITAL_H)
build_wall(CAPITAL[0], CAPITAL[1], 640.0)          # inner keep of the capital
for tx, ty in towns:
    build_wall(tx, ty, TOWN_H, corner=(-math.copysign(1, tx), -math.copysign(1, ty)))   # open towards the road

# --------------------------------------------------------------------------
# Neutral buildings and villagers (cities)
# --------------------------------------------------------------------------
neutral_buildings = []
CITY_BIG = ['ncbc', 'ncbd', 'ncbe', 'ncbf']
CITY_SMALL = ['ncb0', 'ncb1', 'ncb2', 'ncb3', 'ncb4', 'ncb5', 'ncb6', 'ncb7', 'ncb8', 'ncb9', 'ncba', 'ncbb']


def nb(uid, x, y):
    neutral_buildings.append((uid, (snap(x), snap(y))))


def city_block(cx, cy, H, shops, n_houses, seed, shop_off=640.0, inner=1000.0):
    rnd = random.Random(seed)
    # shops on the four inner corners of the cross shaped streets
    for (uid, (qx, qy)) in zip(shops, [(1, 1), (-1, 1), (-1, -1), (1, -1), (0, 0)]):
        if qx == 0:
            nb(uid, cx, cy)
        else:
            nb(uid, cx + qx * shop_off, cy + qy * shop_off)
    # houses filling the rest of the city (keep the streets free)
    spots = []
    g = -H + 320
    while g <= H - 320:
        h = -H + 320
        while h <= H - 320:
            if abs(g) > 380 and abs(h) > 380 and not (abs(g) < inner and abs(h) < inner) \
                    and min(math.hypot(abs(g) - shop_off, abs(h) - shop_off), 9e9) > 420:
                spots.append((cx + g, cy + h))
            h += 300
        g += 300
    rnd.shuffle(spots)
    for x, y in spots[:n_houses]:
        nb(rnd.choice(CITY_SMALL if rnd.random() < 0.7 else CITY_BIG), x, y)
    for k in range(10):                     # villagers walking on the streets
        u = rnd.uniform(-H + 250, H - 250)
        v = rnd.choice([-1, 1]) * rnd.uniform(120, 220)
        x, y = (cx + u, cy + v) if k % 2 else (cx + v, cy + u)
        nb(rnd.choice(['nvil', 'nvlw', 'nvl2']), x, y)


city_block(0.0, 0.0, CAPITAL_H, ['nmrk', 'ngme', 'ngad', 'ntav', 'nfoh'], 60, 1, shop_off=1150.0, inner=820.0)
city_block(towns[0][0], towns[0][1], TOWN_H, ['ngme', 'ngwr', 'npgf', 'nfoh'], 12, 2)
city_block(towns[1][0], towns[1][1], TOWN_H, ['nmrk', 'ngwr', 'npgf', 'nmoo'], 12, 3)
city_block(towns[2][0], towns[2][1], TOWN_H, ['ngad', 'ngwr', 'npgf', 'nfoh'], 12, 4)
# harbour town: shipyard on the shore, fishing village houses, villagers
hx, hy = HARBOR
nb('nshp', hx + 1100, hy - 1100)
for k, uid in enumerate(['nfv0', 'nfv1', 'nfv2', 'nfv3', 'nfv4', 'nfv1']):
    a = 200 + k * 42
    nb(uid, hx + 700 * math.cos(math.radians(a)), hy + 700 * math.sin(math.radians(a)))
nb('nmoo', hx, hy)
for k in range(5):
    nb(['nvil', 'nvlw', 'nvl2'][k % 3], hx + 300 + k * 90, hy - 250 + k * 40)

TOWN_AREAS = [(0.0, 0.0, CAPITAL_H)] + [(tx, ty, TOWN_H) for tx, ty in towns] + [(hx, hy, 1100.0)]


def in_castle(x, y, extra=0.0):
    return any(cheb(x, y, bx, by) < CASTLE_H + extra for bx, by in starts)


def in_town(x, y, extra=0.0):
    return any(cheb(x, y, tx, ty) < h + extra for tx, ty, h in TOWN_AREAS)


# --------------------------------------------------------------------------
# Terrain (heights + textures)
# --------------------------------------------------------------------------
TEX = [b'Lgrs', b'Lgrd', b'Ldrt', b'Ldro', b'Zsan', b'Zbks', b'Nsnw', b'Ndrt',
       b'Agrs', b'Alvd', b'Bdsr', b'Bgrr', b'Fgrs', b'Fgrd', b'Zvin', b'Ztil']
(T_GRASS, T_LUSH, T_DIRT, T_ROUGH, T_SAND, T_BRICK, T_SNOW, T_SNOWDIRT,
 T_AGRS, T_LEAVES, T_DESERT, T_DGRASS, T_FGRS, T_FGRD, T_VINES, T_TILES) = range(16)
T_STONE = T_TILES

# regions of the world: (main texture, second texture, rough texture, tree, tree density)
BIOMES = {
    'summer': (T_GRASS, T_LUSH, T_ROUGH, b'LTlt', 1.0),        # green heartland around the capital
    'snow':   (T_SNOW, T_SNOWDIRT, T_SNOWDIRT, b'NTtw', 1.0),  # snowy north
    'autumn': (T_AGRS, T_LEAVES, T_ROUGH, b'ATtr', 1.1),       # Ashenvale-like west
    'desert': (T_DESERT, T_DGRASS, T_ROUGH, b'BTtw', 0.45),    # barren south
    'fall':   (T_FGRS, T_FGRD, T_ROUGH, b'FTtw', 1.0),         # golden autumn east
    'coast':  (T_SAND, T_VINES, T_SAND, b'ZTtw', 0.8),         # tropical south-east coast
}
TREE_VARS = {b'ATtr': 5}


def sea_s(x, y):
    """>0 on land, distance (roughly) to the sea coast"""
    return (SEA_LINE + 500 * noise(x, y, 1.5, 21) - (x - y)) / 1.4142


def biome(x, y):
    if sea_s(x, y) < 2600 + 600 * noise(x, y, 2.0, 41):
        return 'coast'
    nx = x + 1600 * noise(x, y, 1.2, 31)
    ny = y + 1600 * noise(x, y, 1.2, 37)
    if max(abs(nx), abs(ny)) < 5200:
        return 'summer'
    if ny >= abs(nx):
        return 'snow'
    if ny <= -abs(nx):
        return 'desert'
    return 'autumn' if nx < 0 else 'fall'


# every wall has a water moat around it (with land causeways at the gates)
MOATS = [(sx, sy, CASTLE_H, None) for sx, sy in starts] + [(0.0, 0.0, CAPITAL_H, None)] + \
        [(tx, ty, TOWN_H, (-math.copysign(1, tx), -math.copysign(1, ty))) for tx, ty in towns]


def moat_t(x, y):
    for cx, cy, H, corner in MOATS:
        dx, dy = x - cx, y - cy
        d = max(abs(dx), abs(dy))
        if H + MOAT_IN < d < H + MOAT_OUT:
            along = dy if abs(dx) >= abs(dy) else dx
            if abs(along) < GATE_HALF + 90:
                return None                            # causeway in front of a gate
            if corner and math.copysign(1, dx) == corner[0] and math.copysign(1, dy) == corner[1] \
                    and abs(dx) > H - 560 and abs(dy) > H - 560:
                return None                            # open corner of a town
            return (d - H - MOAT_IN) / (MOAT_OUT - MOAT_IN)
    return None


def ground_z(x, y):
    s = sea_s(x, y)
    if s < 0:                                          # sea
        return max(-12.0 + s * 0.16, -320.0)
    rd = river_dist(x, y)
    if rd < RIVER_HALF:                                # river
        if near_bridge(x, y, 450):
            return -50.0 + 30.0 * (rd / RIVER_HALF)    # shallow ford under the bridges
        if rd < RIVER_HALF * 0.55:
            return -150.0
        return -12.0 - 138.0 * (1 - (rd - RIVER_HALF * 0.55) / (RIVER_HALF * 0.45))
    ld = math.hypot(x - LAKE[0], y - LAKE[1]) - LAKE[2]
    if ld < 0:                                         # lake: deep in the middle
        return max(-12.0 + ld * 0.25, -200.0)
    mt = moat_t(x, y)
    if mt is not None:                                 # castle moat: deep water
        return -160.0 if 0.15 < mt < 0.85 else -45.0
    b = biome(x, y)
    amp = {'snow': 70.0, 'autumn': 45.0, 'fall': 40.0, 'desert': 30.0}.get(b, 28.0)
    hz = noise(x, y, 0.7, 1) * amp
    flat = 1.0
    for (bx, by) in starts:
        dd = cheb(x, y, bx, by)
        if dd < CASTLE_H + 1000:
            flat = min(flat, max(0.0, (dd - CASTLE_H - MOAT_OUT - 100) / 400.0))
    for (tx, ty, h) in TOWN_AREAS:
        dd = cheb(x, y, tx, ty)
        if dd < h + 1000:
            flat = min(flat, max(0.0, (dd - h - MOAT_OUT - 100) / 400.0))
    for (mx, my) in exp_mines:
        dd = math.hypot(x - mx, y - my)
        if dd < 1300:
            flat = min(flat, max(0.0, (dd - 800) / 500.0))
    hz = max(hz, 0.0) * flat
    if city_at(x, y)[0] is not None:                  # city districts are nearly flat
        hz *= 0.15
    # banks slope down into water
    shore = min(s, rd - RIVER_HALF, ld)
    if shore < 400:
        return -12.0 + (hz + 12.0) * (shore / 400.0)
    return hz


# --------------------------------------------------------------------------
# City districts: the whole land between the castles is built up with streets and
# houses, in the style of the region it is in
# --------------------------------------------------------------------------
BLOCK = 1400.0
CITY_DENSITY = {'summer': 0.9, 'fall': 0.8, 'snow': 0.7, 'autumn': 0.7, 'desert': 0.55, 'coast': 0.6}
CITY_STYLE = {
    'summer': (['ncb0', 'ncb3', 'ncb6', 'ncb9', 'ncb1', 'ncb4', 'ncb7', 'ncba'], ['ncbc', 'ncbd', 'ncbe', 'ncbf']),
    'snow':   (['ncb2', 'ncb5', 'ncb8', 'ncbb', 'ncb0', 'ncb3'], ['ncbc', 'ncbe', 'ngwr']),
    'autumn': (['nef0', 'nef1', 'nef2', 'nef3', 'nef4', 'nef5', 'nef6', 'nef7'], ['nefm', 'negt']),
    'fall':   (['ncb1', 'ncb4', 'ncb7', 'ncba', 'npgf'], ['ngwr', 'npgf', 'ncbd']),
    'desert': (['nvr0', 'nvr1', 'nvr2', 'ncb2', 'ncb8'], ['ngwr', 'ncbf']),
    'coast':  (['nfv0', 'nfv1', 'nfv2', 'nfv3', 'nfv4'], ['nfv1', 'nfv3']),
}


def block_free(cx, cy):
    """can a city block stand here without blocking a castle, mine, road or water?"""
    if max(abs(cx), abs(cy)) > BASE_D + 1600:            # the forests at the edge of the world stay
        return False
    for bx, by in starts:
        if cheb(cx, cy, bx, by) < CASTLE_H + MOAT_OUT + 950:
            return False
    for tx, ty, h in TOWN_AREAS:
        if cheb(cx, cy, tx, ty) < h + MOAT_OUT + 650:
            return False
    for mx, my in main_mines + exp_mines:
        if math.hypot(cx - mx, cy - my) < 1350:
            return False
    for _, x, y, _ in creeps:
        if math.hypot(cx - x, cy - y) < 800:
            return False
    if road_dist(cx, cy) < 680:
        return False
    if sea_s(cx, cy) < 1300 or river_dist(cx, cy) < RIVER_HALF + 750:
        return False
    if math.hypot(cx - LAKE[0], cy - LAKE[1]) < LAKE[2] + 900:
        return False
    return True


city_blocks = {}
crnd = random.Random(77)
n_cells = int(PMAX // BLOCK) + 1
for bi in range(-n_cells, n_cells):
    for bj in range(-n_cells, n_cells):
        cx, cy = (bi + 0.5) * BLOCK, (bj + 0.5) * BLOCK
        if block_free(cx, cy):
            b = biome(cx, cy)
            if crnd.random() < CITY_DENSITY[b]:
                city_blocks[(bi, bj)] = b
for (bi, bj), b in sorted(city_blocks.items()):
    cx, cy = (bi + 0.5) * BLOCK, (bj + 0.5) * BLOCK
    small, big = CITY_STYLE[b]
    if crnd.random() < 0.3:
        nb(crnd.choice(big), cx, cy)                        # one big building
    else:
        for ox, oy in ((-260, -230), (260, 230), (-260, 230), (260, -230)):
            if crnd.random() < 0.8:
                nb(crnd.choice(small), cx + ox, cy + oy)
    if crnd.random() < 0.3:                                 # people on the streets
        nb(crnd.choice(['nvil', 'nvlw', 'nvl2']), cx + BLOCK / 2 - 110, cy + crnd.uniform(-300, 300))


def city_at(x, y):
    bi, bj = math.floor(x / BLOCK), math.floor(y / BLOCK)
    b = city_blocks.get((bi, bj))
    if b is None:
        return None, False
    u, v = x - bi * BLOCK, y - bj * BLOCK
    street = min(u, v, BLOCK - u, BLOCK - v) < 230
    return b, street


def ground_tex(x, y, z):
    s = sea_s(x, y)
    rd = river_dist(x, y)
    ld = math.hypot(x - LAKE[0], y - LAKE[1]) - LAKE[2]
    b = biome(x, y)
    main, alt, rough = BIOMES[b][:3]
    if z < WATER_Z + 5 or moat_t(x, y) is not None:
        return T_SAND if b != 'snow' else T_SNOWDIRT
    if s < 900 or rd < RIVER_HALF + 150 or ld < 200:
        return T_SAND if b != 'snow' else T_SNOWDIRT
    for i, (bx, by) in enumerate(starts):
        d = cheb(x, y, bx, by)
        if d < CASTLE_H + 60:                          # paved castle courtyard
            mx, my = main_mines[i]
            if math.hypot(x - mx, y - my) < 380:
                return T_DIRT
            return T_TILES if d < 420 else T_BRICK
    if cheb(x, y, 0, 0) < 700:
        return T_TILES                                 # capital keep
    if in_town(x, y, 60):
        return T_BRICK if (abs(x) % 900 > 120 and abs(y) % 900 > 120) else T_TILES
    cb, street = city_at(x, y)
    if cb is not None:
        if street:
            return T_BRICK
        return T_TILES if cb in ('summer', 'fall') else main
    if road_dist(x, y) < 210 + 40 * noise(x, y, 4, 7):
        return T_DIRT if b != 'snow' else T_SNOWDIRT
    n = noise(x, y, 1.6, 5)
    if n > 0.45:
        return alt
    if n < -0.55:
        return rough
    return main


heights = [[0.0] * PTS for _ in range(PTS)]
for j in range(PTS):
    for i in range(PTS):
        heights[j][i] = ground_z(wx(i), wy(j))


def in_playable_pt(i, j):
    return MARGIN <= i <= TILES - MARGIN and MARGIN <= j <= TILES - MARGIN


def build_w3e():
    out = bytearray()
    out += b'W3E!' + struct.pack('<i', 11) + b'Z' + struct.pack('<i', 1)
    out += struct.pack('<i', len(TEX)) + b''.join(TEX)
    out += struct.pack('<i', 1) + b'CLdi'
    out += struct.pack('<iiff', PTS, PTS, X0, Y0)
    water_level = int(0x2000 + (WATER_Z + 89.6) * 4)
    for j in range(PTS):
        for i in range(PTS):
            x, y = wx(i), wy(j)
            z = heights[j][i]
            gh = int(round(0x2000 + z * 4))
            wl = water_level | (0 if in_playable_pt(i, j) else 0x4000)
            flags = 0x40 if z < WATER_Z else 0
            tex = ground_tex(x, y, z)
            var = 0 if random.random() < 0.6 else random.randint(1, 15)
            if tex == T_BRICK:
                var = random.randint(0, 3)
            out += struct.pack('<HHBBB', gh, wl, flags | tex, var, 0x02)
    return bytes(out)


# --------------------------------------------------------------------------
# Trees (war3map.doo)
# --------------------------------------------------------------------------
def tree_ok(x, y):
    if not (PMIN + 256 < x < PMAX - 256 and PMIN + 256 < y < PMAX - 256):
        return False
    if sea_s(x, y) < 900 or river_dist(x, y) < RIVER_HALF + 250:
        return False
    if math.hypot(x - LAKE[0], y - LAKE[1]) < LAKE[2] + 300:
        return False
    if road_dist(x, y) < 340:
        return False
    if city_at(x, y)[0] is not None or city_at(x + 200, y)[0] is not None or city_at(x - 200, y)[0] is not None \
            or city_at(x, y + 200)[0] is not None or city_at(x, y - 200)[0] is not None:
        return False
    if in_castle(x, y, MOAT_OUT + 250) or in_town(x, y, MOAT_OUT + 250):
        return False
    for (mx, my) in main_mines + exp_mines:
        if math.hypot(x - mx, y - my) < 800:
            return False
    for (_, cx, cy, _) in creeps:
        if math.hypot(x - cx, y - cy) < 380:
            return False
    return True


trees = []
step = 128.0
gy = PMIN + 192
while gy < PMAX - 192:
    gx = PMIN + 192
    while gx < PMAX - 192:
        if tree_ok(gx, gy):
            c = max(abs(gx), abs(gy))
            p = 0.0
            if c > BASE_D + 1500:                       # deep forest along the edge of the world
                p = 0.9
            elif noise(gx, gy, 2.0, 11) > 0.42:          # woods
                p = 0.8
            elif noise(gx, gy, 5.0, 13) > 0.85:          # small groves
                p = 0.6
            bt = BIOMES[biome(gx, gy)]
            if random.random() < p * bt[4]:
                trees.append((bt[3], gx, gy))
        gx += step
    gy += step


def height_at(x, y):
    fi = (x - X0) / 128.0
    fj = (y - Y0) / 128.0
    i = max(0, min(PTS - 2, int(fi)))
    j = max(0, min(PTS - 2, int(fj)))
    tx, ty = fi - i, fj - j
    h00, h10 = heights[j][i], heights[j][i + 1]
    h01, h11 = heights[j + 1][i], heights[j + 1][i + 1]
    return (h00 * (1 - tx) + h10 * tx) * (1 - ty) + (h01 * (1 - tx) + h11 * tx) * ty


def build_doo():
    items = [(t, random.randint(0, TREE_VARS.get(t, 10) - 1), x, y, random.uniform(0.9, 1.15)) for t, x, y in trees]
    items += [(did, random.randint(0, 4), x, y, 1.0) for did, x, y in castle_walls]
    items += [(b'YTpc', 0, x, y, 1.0) for x, y in castle_blockers]
    items += [(did, 0, x, y, 1.0) for did, x, y in bridges]
    bridge_set = set((x, y) for _, x, y in bridges)
    out = bytearray(b'W3do' + struct.pack('<ii', 8, 11) + struct.pack('<i', len(items)))
    for n, (did, var, x, y, sc) in enumerate(items):
        out += did + struct.pack('<i', var)
        z = 0.0 if (x, y) in bridge_set else height_at(x, y)      # bridges sit at bank level
        out += struct.pack('<fff', x, y, z)
        out += struct.pack('<f', math.radians(270))
        out += struct.pack('<fff', sc, sc, sc)
        out += struct.pack('<BB', 2, 100)              # visible + solid, 100% life
        out += struct.pack('<ii', -1, 0)               # no item table, no dropped items
        out += struct.pack('<i', n)
    out += struct.pack('<ii', 0, 0)                    # special doodads
    return bytes(out)


# --------------------------------------------------------------------------
# Pathing (war3map.wpm) and shadows (war3map.shd)
# --------------------------------------------------------------------------
PW = TILES * 4


def build_wpm():
    out = bytearray(b'MP3W' + struct.pack('<iii', 0, PW, PW))
    cells = bytearray(PW * PW)
    for cj in range(PW):
        y = Y0 + cj * 32 + 16
        for ci in range(PW):
            x = X0 + ci * 32 + 16
            if not (PMIN <= x <= PMAX and PMIN <= y <= PMAX):
                v = 0x02 | 0x04 | 0x08
            else:
                z = height_at(x, y)
                if z >= WATER_Z:
                    v = 0x40                                   # plain ground
                elif WATER_Z - z <= SHALLOW_DEPTH:
                    v = 0x08                                   # shallow: walk, no build
                else:
                    v = 0x02 | 0x08                            # deep water
            cells[cj * PW + ci] = v
    return bytes(out + cells)


def build_shd():
    return bytes(PW * PW)


# --------------------------------------------------------------------------
# Map info (war3map.w3i), object data (war3map.w3u)
# --------------------------------------------------------------------------
def cstr(s):
    return s.encode('utf-8') + b'\0'


PLAYER_RGB = [(255, 3, 3), (0, 66, 255), (28, 230, 185), (84, 0, 129), (255, 252, 1), (254, 138, 14),
              (32, 192, 0), (229, 91, 176), (149, 150, 151), (126, 191, 241), (16, 98, 70), (78, 42, 4)]
MAP_FLAGS = 0x0004 | 0x0010 | 0x0400 | 0x0800 | 0x1000   # melee, partial mask, waves on shores


def build_w3i():
    o = bytearray()
    o += struct.pack('<iii', 25, 1, 6059)
    o += cstr(MAP_NAME) + cstr(AUTHOR) + cstr(DESCRIPTION) + cstr("1-12")
    o += struct.pack('<8f', PMIN, PMIN, PMAX, PMAX, PMIN, PMAX, PMAX, PMIN)
    o += struct.pack('<4i', MARGIN, MARGIN, MARGIN, MARGIN)
    o += struct.pack('<ii', TILES - 2 * MARGIN, TILES - 2 * MARGIN)
    o += struct.pack('<i', MAP_FLAGS)
    o += b'Z'
    o += struct.pack('<i', -1) + cstr("") + cstr("") + cstr("") + cstr("")
    o += struct.pack('<i', 0) + cstr("") + cstr("") + cstr("") + cstr("")
    o += struct.pack('<ifff', 0, 3000.0, 5000.0, 0.5) + bytes([0, 0, 0, 255])
    o += struct.pack('<i', 0) + cstr("") + b'\0' + bytes([255, 255, 255, 255])
    o += struct.pack('<i', NPLAYERS)
    for i, (sx, sy) in enumerate(starts):
        o += struct.pack('<iiii', i, 1, 1, 0) + cstr("Player %d" % (i + 1))
        o += struct.pack('<ffii', sx, sy, 0, 0)
    o += struct.pack('<i', 1)
    o += struct.pack('<ii', 0, (1 << NPLAYERS) - 1) + cstr("Force 1")
    o += struct.pack('<iiii', 0, 0, 0, 0)       # upgrades, tech, unit tables, item tables
    return bytes(o)


META_ID = 'A000'          # custom toggle Metamorphosis for Illidan
KUNKKA_SKILLS = [
    ('AOsh', 'A001', "Torrent", 3, "Kunkka calls a torrent of sea water that sweeps across the battlefield, damaging every enemy in its path."),
    ('ANca', 'A002', "Tidebringer", 3, "Kunkka's sword is charged by the tide: every attack cleaves and hits all enemies around the target."),
    ('AHtb', 'A003', "X Marks the Spot", 3, "Kunkka marks an enemy with an X, hitting and stunning it."),
    ('ANto', 'A004', "Ghost Ship", 1, "Kunkka summons the storm that follows the Ghost Ship, tossing enemies and buildings around it."),
]
KUNKKA_IDS = ",".join(k[1] for k in KUNKKA_SKILLS)
ILLIDAN_SKILLS = "AEmb,AEim,AEev," + META_ID


def build_w3u():
    """Unit changes: Naga Sea Witch -> Medusa, Illidan gets the toggle Metamorphosis"""
    M = lambda m: m + '.mdl'
    I = lambda i: 'ReplaceableTextures\\CommandButtons\\' + i + '.blp'
    tower = [(b'umdl', M('buildings\\other\\ElvenGuardTower\\ElvenGuardTower')), (b'uico', I('BTNElvenGuardTower'))]
    mods = [
        (b'Nngs', [(b'unam', "Medusa"), (b'upro', "Medusa")]),
        (b'Eevi', [(b'uhab', ILLIDAN_SKILLS)]),     # Illidan (Naga era: horns + wings)
        (b'Eevm', [(b'uhab', ILLIDAN_SKILLS), (b'usca', 1.7), (b'ussc', 1.7)]),   # bigger demon form
        # ---- Humans become Blood Elves (same unit types, so the computer AI still works) ----
        (b'hpea', [(b'umdl', M('units\\critters\\HighElfPeasant\\HighElfPeasant')), (b'unam', "Blood Elf Worker"),
                   (b'uico', I('BTNBloodElfPeasant'))]),
        (b'hfoo', [(b'umdl', M('units\\human\\TheCaptain\\TheCaptain')), (b'usca', 0.9),
                   (b'unam', "Blood Elf Swordsman"), (b'uico', I('BTNTheCaptain'))]),
        (b'hrif', [(b'umdl', M('units\\creeps\\HighElfArcher\\HighElfArcher')), (b'unam', "Blood Elf Archer"),
                   (b'uico', I('BTNHighElvenArcher')), (b'ua1m', 'Abilities\\Weapons\\Arrow\\ArrowMissile.mdl')]),
        (b'hkni', [(b'umdl', M('units\\creeps\\LordGarithos\\LordGarithos')), (b'usca', 1.0),
                   (b'unam', "Golden Knight"), (b'uico', I('BTNGarithos'))]),
        (b'Hamg', [(b'umdl', M('units\\other\\Proudmoore\\Proudmoore')), (b'usca', 1.1),
                   (b'unam', "Admiral"), (b'upro', "Kunkka"), (b'uhab', KUNKKA_IDS)]),
        (b'Hpal', [(b'umdl', M('units\\human\\Arthas\\Arthas')), (b'usca', 1.1),
                   (b'upro', "Arthas"), (b'uico', I('BTNArthas'))]),
        (b'Hmkg', [(b'umdl', M('units\\human\\Uther\\Uther')), (b'usca', 1.1),
                   (b'unam', "Golden Paladin"), (b'upro', "Uther"), (b'uico', I('BTNHeroPaladin'))]),
        (b'Hblm', [(b'umdl', M('units\\human\\Kael\\Kael')), (b'upro', "Kael'thas"), (b'uico', I('BTNBloodMage2'))]),
        (b'hhou', [(b'umdl', M('buildings\\other\\ElvenFarm\\ElvenFarm')), (b'unam', "Elven Farm"),
                   (b'uico', I('BTNElvenFarm'))]),
        (b'hwtw', tower), (b'hgtw', tower), (b'hctw', tower), (b'hatw', tower),
    ]
    o = bytearray(struct.pack('<ii', 2, len(mods)))
    for uid, fields in mods:
        o += uid + b'\0\0\0\0' + struct.pack('<i', len(fields))
        for field, val in fields:
            if isinstance(val, float):
                o += field + struct.pack('<if', 1, val) + b'\0\0\0\0'
            else:
                o += field + struct.pack('<i', 3) + cstr(val) + b'\0\0\0\0'
    o += struct.pack('<i', 0)
    return bytes(o)


def build_w3b():
    """Trees never fall: give the island tree a huge amount of life, so
    harvesting lumber (which takes life from the tree) never cuts it down."""
    ids = sorted(set(b[3] for b in BIOMES.values())) + [b'ZTw0', b'ZTw2']   # trees and castle walls
    o = bytearray(struct.pack('<ii', 2, len(ids)))
    for did in ids:
        o += did + b'\0\0\0\0' + struct.pack('<i', 1)
        o += b'bhps' + struct.pack('<i', 2) + struct.pack('<f', 1000000.0) + b'\0\0\0\0'
    o += struct.pack('<i', 0)
    return bytes(o)


def build_w3a():
    """Custom hero ability based on Bear Form: Illidan turns into the demon with
    no time limit and turns back whenever the button is pressed again."""
    INT, REAL, UNREAL, STR = 0, 1, 2, 3
    hk = "|cffffcc00F|r"
    fields = [
        # id, type, level, data column, value
        (b'anam', STR, 0, 0, "Metamorphosis"),
        (b'aher', INT, 0, 0, 1),
        (b'alev', INT, 0, 0, 1),
        (b'arlv', INT, 0, 0, 2),
        (b'achd', INT, 0, 0, 0),
        (b'areq', STR, 0, 0, ""),
        (b'arqa', STR, 0, 0, ""),
        (b'aart', STR, 0, 0, "ReplaceableTextures\\CommandButtons\\BTNMetamorphosis.blp"),
        (b'arar', STR, 0, 0, "ReplaceableTextures\\CommandButtons\\BTNMetamorphosis.blp"),
        (b'auar', STR, 0, 0, "ReplaceableTextures\\CommandButtons\\BTNHeroDemonHunter.blp"),
        (b'abpx', INT, 0, 0, 3), (b'abpy', INT, 0, 0, 2),
        (b'aubx', INT, 0, 0, 3), (b'auby', INT, 0, 0, 2),
        (b'arpx', INT, 0, 0, 3), (b'arpy', INT, 0, 0, 0),
        (b'ahky', STR, 0, 0, "F"), (b'auhk', STR, 0, 0, "F"), (b'arhk', STR, 0, 0, "F"),
        (b'aret', STR, 0, 0, "Learn Metamorphosis (" + hk + ")"),
        (b'arut', STR, 0, 0, "Illidan transforms into a powerful demon with a ranged chaos attack and bonus hit points. "
                             "The demon form has NO time limit - press the button again to turn back. Free (no mana). Requires hero level 2."),
        (b'atp1', STR, 1, 0, "Metamorphosis (" + hk + ")"),
        (b'aub1', STR, 1, 0, "Transform into a demon. Lasts until you turn it off."),
        (b'aut1', STR, 1, 0, "Normal Form (" + hk + ")"),
        (b'auu1', STR, 1, 0, "Turn back into Illidan's normal form."),
        (b'Eme1', STR, 1, 1, "Eevi"),           # normal form unit
        (b'Emeu', STR, 1, 0, "Eevm"),           # demon form unit
        (b'Eme2', INT, 1, 2, 1),                # morph flags (same as Illidan's original)
        (b'adur', UNREAL, 1, 0, 0.0),           # transformation animation time only
        (b'ahdu', UNREAL, 1, 0, 0.0),           # 0 = no time limit on heroes
        (b'acdn', UNREAL, 1, 0, 0.0),
        (b'amcs', INT, 1, 0, 0),
    ]
    customs = [(b'Abrf', META_ID.encode(), fields)]
    # Kunkka's own skills, built on the closest abilities 1.26 has
    for base, new, name, levels, desc in KUNKKA_SKILLS:
        kf = [(b'anam', STR, 0, 0, name),
              (b'aret', STR, 0, 0, "Learn " + name + " - [|cffffcc00Level %d|r]"),
              (b'arut', STR, 0, 0, desc)]
        for lv in range(1, levels + 1):
            kf.append((b'atp1', STR, lv, 0, name + " - [|cffffcc00Level %d|r]" % lv))
            kf.append((b'aub1', STR, lv, 0, desc))
        customs.append((base.encode(), new.encode(), kf))
    o = bytearray(struct.pack('<ii', 2, 0))          # no changed standard abilities
    o += struct.pack('<i', len(customs))
    for base, new, flds in customs:
        o += base + new + struct.pack('<i', len(flds))
        for fid, t, lvl, dat, val in flds:
            o += fid + struct.pack('<iii', t, lvl, dat)
            if t == INT:
                o += struct.pack('<i', val)
            elif t in (REAL, UNREAL):
                o += struct.pack('<f', val)
            else:
                o += cstr(val)
            o += b'\0\0\0\0'
    return bytes(o)


# --------------------------------------------------------------------------
# Script (war3map.j)
# --------------------------------------------------------------------------
def f(v):
    return "%.1f" % v


def build_j():
    L = []
    a = L.append
    a("//===========================================================================")
    a("// %s - generated by build_map.py" % MAP_NAME)
    a("//===========================================================================")
    a("globals")
    a("    boolean array pikaRedOrc")
    a("    integer pikaTicks = 0")
    a("endglobals")
    a("")
    a("function CreateNeutralPassiveBuildings takes nothing returns nothing")
    a("    local player p = Player(PLAYER_NEUTRAL_PASSIVE)")
    a("    local unit u")
    for (x, y) in main_mines:
        a("    set u = CreateUnit(p, 'ngol', %s, %s, 270.0)" % (f(x), f(y)))
        a("    call SetResourceAmount(u, 12500)")
    for (x, y) in exp_mines:
        a("    set u = CreateUnit(p, 'ngol', %s, %s, 270.0)" % (f(x), f(y)))
        a("    call SetResourceAmount(u, 10000)")
    for uid, (x, y) in neutral_buildings:
        a("    set u = CreateUnit(p, '%s', %s, %s, 270.0)" % (uid, f(x), f(y)))
    a("endfunction")
    a("")
    a("function CreateNeutralHostile takes nothing returns nothing")
    a("    local player p = Player(PLAYER_NEUTRAL_AGGRESSIVE)")
    a("    local unit u")
    for uid, x, y, face in creeps:
        a("    set u = CreateUnit(p, '%s', %s, %s, %s)" % (uid, f(x), f(y), f(face)))
    a("endfunction")
    a("")
    a("//===========================================================================")
    a("// Naga: a human player that picked Night Elf starts as Naga instead")
    a("//===========================================================================")
    a("function PikaIsNagaPlayer takes player p returns boolean")
    a("    return GetPlayerRace(p) == RACE_NIGHTELF and GetPlayerController(p) == MAP_CONTROL_USER")
    a("endfunction")
    a("")
    a("function PikaStartingUnitsNaga takes player whichPlayer, location startLoc returns nothing")
    a("    local real unitSpacing = 64.00")
    a("    local unit nearestMine")
    a("    local location nearMineLoc")
    a("    local location heroLoc")
    a("    local real peonX")
    a("    local real peonY")
    a("    local real heroX")
    a("    local real heroY")
    a("    local unit hero")
    a("    call CreateUnitAtLoc(whichPlayer, 'nntt', startLoc, bj_UNIT_FACING)")
    a("    set nearestMine = MeleeFindNearestMine(startLoc, bj_MELEE_MINE_SEARCH_RADIUS)")
    a("    if (nearestMine != null) then")
    a("        set nearMineLoc = MeleeGetProjectedLoc(GetUnitLoc(nearestMine), startLoc, 320, 0)")
    a("        set heroLoc = MeleeGetProjectedLoc(GetUnitLoc(nearestMine), startLoc, 384, 45)")
    a("    else")
    a("        set nearMineLoc = Location(GetLocationX(startLoc), GetLocationY(startLoc) - 224.00)")
    a("        set heroLoc = Location(GetLocationX(startLoc), GetLocationY(startLoc) - 352.00)")
    a("    endif")
    a("    set peonX = GetLocationX(nearMineLoc)")
    a("    set peonY = GetLocationY(nearMineLoc)")
    a("    call CreateUnit(whichPlayer, 'nmpe', peonX + 0.00 * unitSpacing, peonY + 1.00 * unitSpacing, bj_UNIT_FACING)")
    a("    call CreateUnit(whichPlayer, 'nmpe', peonX + 1.00 * unitSpacing, peonY + 0.15 * unitSpacing, bj_UNIT_FACING)")
    a("    call CreateUnit(whichPlayer, 'nmpe', peonX - 1.00 * unitSpacing, peonY + 0.15 * unitSpacing, bj_UNIT_FACING)")
    a("    call CreateUnit(whichPlayer, 'nmpe', peonX + 0.60 * unitSpacing, peonY - 1.00 * unitSpacing, bj_UNIT_FACING)")
    a("    call CreateUnit(whichPlayer, 'nmpe', peonX - 0.60 * unitSpacing, peonY - 1.00 * unitSpacing, bj_UNIT_FACING)")
    a("    set heroX = GetLocationX(heroLoc)")
    a("    set heroY = GetLocationY(heroLoc)")
    a("    set hero = CreateUnit(whichPlayer, 'Eevi', heroX, heroY, bj_UNIT_FACING)")
    a("    call CreateUnit(whichPlayer, 'Nngs', heroX + 110.00, heroY - 90.00, bj_UNIT_FACING)")
    a("    call CreateUnit(whichPlayer, 'nnrg', heroX - 110.00, heroY - 90.00, bj_UNIT_FACING)")
    a("    if (GetLocalPlayer() == whichPlayer) then")
    a("        call ClearSelection()")
    a("        call SelectUnit(hero, true)")
    a("    endif")
    a("    call SetCameraPositionForPlayer(whichPlayer, peonX, peonY)")
    a("    call SetCameraQuickPositionForPlayer(whichPlayer, peonX, peonY)")
    a("    call DisplayTimedTextToPlayer(whichPlayer, 0, 0, 15.00, \"|cff00ccffYou rule the Naga!|r Illidan, Medusa and the Royal Guard are at your command. At level 2 Illidan learns Metamorphosis: press F to become a demon, press F again to turn back.\")")
    a("endfunction")
    a("")
    # ---- castle towers and farms ----
    a("function PikaCastle takes player p, integer towerId, integer farmId returns nothing")
    a("    // use the castle the player really starts in (the lobby can shuffle start positions)")
    a("    local integer i = GetPlayerStartLocation(p)")
    for pi in range(NPLAYERS):
        a("    %s i == %d then" % ("if" if pi == 0 else "elseif", pi))
        for x, y in castle_towers[pi]:
            a("        call CreateUnit(p, towerId, %s, %s, 270.0)" % (f(x), f(y)))
        for x, y in castle_farms[pi]:
            a("        call CreateUnit(p, farmId, %s, %s, 270.0)" % (f(x), f(y)))
    a("    endif")
    a("endfunction")
    a("")
    # ---- Blood Elves: free Kunkka ----
    # ---- Orcs: random normal / red (fel) ----
    a("function PikaFelType takes integer id returns integer")
    for a_, b_ in [('opeo', 'ncpn'), ('ogru', 'nchg'), ('orai', 'nchr'), ('okod', 'nckb'), ('oshm', 'nchw'),
                   ('Obla', 'Nbbc'), ('Ofar', 'Nplh'), ('Otch', 'Opgh'), ('Oshd', 'Nmag')]:
        a("    if id == '%s' then" % a_)
        a("        return '%s'" % b_)
        a("    endif")
    a("    return 0")
    a("endfunction")
    a("")
    a("function PikaLearnSkills takes unit h returns nothing")
    a("    local integer id = GetUnitTypeId(h)")
    a("    local integer k = 0")
    a("    loop")
    a("        exitwhen k == 3")
    a("        if id == 'Nbbc' or id == 'Opgh' then")
    a("            call SelectHeroSkill(h, 'AOww')")
    a("            call SelectHeroSkill(h, 'AOcr')")
    a("            call SelectHeroSkill(h, 'AOwk')")
    a("            call SelectHeroSkill(h, 'AOmi')")
    a("        elseif id == 'Hamg' then")
    a("            call SelectHeroSkill(h, 'A004')")
    a("            call SelectHeroSkill(h, 'A002')")
    a("            call SelectHeroSkill(h, 'A001')")
    a("            call SelectHeroSkill(h, 'A003')")
    a("        elseif id == 'Nplh' or id == 'Nmag' then")
    a("            call SelectHeroSkill(h, 'ANdo')")
    a("            call SelectHeroSkill(h, 'ANrf')")
    a("            call SelectHeroSkill(h, 'ANca')")
    a("            call SelectHeroSkill(h, 'ANht')")
    a("        endif")
    a("        set k = k + 1")
    a("    endloop")
    a("endfunction")
    a("")
    a("function PikaOnHeroLevel takes nothing returns nothing")
    a("    call PikaLearnSkills(GetTriggerUnit())")
    a("endfunction")
    a("")
    a("function PikaApplyRedOrc takes unit u returns nothing")
    a("    local player p = GetOwningPlayer(u)")
    a("    local integer i = GetPlayerId(p)")
    a("    local integer newId")
    a("    local real x")
    a("    local real y")
    a("    local real face")
    a("    local unit n")
    a("    if i >= bj_MAX_PLAYERS then")
    a("        return")
    a("    endif")
    a("    if not pikaRedOrc[i] then")
    a("        return")
    a("    endif")
    a("    set newId = PikaFelType(GetUnitTypeId(u))")
    a("    // the computer keeps normal peons, so its economy AI keeps working")
    a("    if newId == 'ncpn' and GetPlayerController(p) != MAP_CONTROL_USER then")
    a("        set newId = 0")
    a("    endif")
    a("    if newId != 0 then")
    a("        set x = GetUnitX(u)")
    a("        set y = GetUnitY(u)")
    a("        set face = GetUnitFacing(u)")
    a("        call RemoveUnit(u)")
    a("        set n = CreateUnit(p, newId, x, y, face)")
    a("        if IsUnitType(n, UNIT_TYPE_HERO) and GetPlayerController(p) == MAP_CONTROL_COMPUTER then")
    a("            call PikaLearnSkills(n)")
    a("        endif")
    a("    endif")
    a("endfunction")
    a("")
    a("function PikaIsFelArmy takes unit u returns boolean")
    a("    local integer id = GetUnitTypeId(u)")
    a("    if GetUnitState(u, UNIT_STATE_LIFE) <= 0.405 then")
    a("        return false")
    a("    endif")
    a("    return id == 'nchg' or id == 'nchr' or id == 'nckb' or id == 'nchw' or id == 'Nbbc' or id == 'Opgh' or id == 'Nplh' or id == 'Nmag'")
    a("endfunction")
    a("")
    a("// The computer's AI does not know the Fel Orc unit types, so this sends them to war")
    a("function PikaRedOrcAttack takes nothing returns nothing")
    a("    local integer i = 0")
    a("    local integer j")
    a("    local integer k")
    a("    local integer count")
    a("    local player p")
    a("    local player e")
    a("    local player target")
    a("    local group g = CreateGroup()")
    a("    local group army = CreateGroup()")
    a("    local unit u")
    a("    local location loc")
    a("    set pikaTicks = pikaTicks + 1")
    a("    loop")
    a("        exitwhen i == bj_MAX_PLAYERS")
    a("        set p = Player(i)")
    a("        if pikaRedOrc[i] and GetPlayerController(p) == MAP_CONTROL_COMPUTER and GetPlayerSlotState(p) == PLAYER_SLOT_STATE_PLAYING then")
    a("            call GroupClear(army)")
    a("            call GroupEnumUnitsOfPlayer(g, p, null)")
    a("            set count = 0")
    a("            loop")
    a("                set u = FirstOfGroup(g)")
    a("                exitwhen u == null")
    a("                call GroupRemoveUnit(g, u)")
    a("                if PikaIsFelArmy(u) then")
    a("                    call GroupAddUnit(army, u)")
    a("                    set count = count + 1")
    a("                endif")
    a("            endloop")
    a("            if pikaTicks >= 8 and (count >= 10 or (pikaTicks >= 20 and count >= 5)) then")
    a("                set target = null")
    a("                set j = GetRandomInt(0, bj_MAX_PLAYERS - 1)")
    a("                set k = 0")
    a("                loop")
    a("                    exitwhen k == bj_MAX_PLAYERS or target != null")
    a("                    set e = Player(ModuloInteger(j + k, bj_MAX_PLAYERS))")
    a("                    if e != p and GetPlayerSlotState(e) == PLAYER_SLOT_STATE_PLAYING and IsPlayerEnemy(p, e) then")
    a("                        set target = e")
    a("                    endif")
    a("                    set k = k + 1")
    a("                endloop")
    a("                if target != null then")
    a("                    set loc = GetStartLocationLoc(GetPlayerStartLocation(target))")
    a("                    loop")
    a("                        set u = FirstOfGroup(army)")
    a("                        exitwhen u == null")
    a("                        call GroupRemoveUnit(army, u)")
    a("                        call IssuePointOrderLoc(u, \"attack\", loc)")
    a("                    endloop")
    a("                    call RemoveLocation(loc)")
    a("                endif")
    a("            endif")
    a("        endif")
    a("        set i = i + 1")
    a("    endloop")
    a("    call DestroyGroup(g)")
    a("    call DestroyGroup(army)")
    a("endfunction")
    a("")
    a("function PikaOnEnter takes nothing returns nothing")
    a("    call PikaApplyRedOrc(GetTriggerUnit())")
    a("endfunction")
    a("")
    a("function PikaGiveKunkka takes player p, location startLoc returns nothing")
    a("    local real x = GetLocationX(startLoc)")
    a("    local real y = GetLocationY(startLoc)")
    a("    local real d = SquareRoot(x * x + y * y)")
    a("    local unit h")
    a("    if d < 1.0 then")
    a("        set d = 1.0")
    a("    endif")
    a("    set h = CreateUnit(p, 'Hamg', x - x / d * 480.0, y - y / d * 480.0, bj_UNIT_FACING)")
    a("    if GetPlayerController(p) == MAP_CONTROL_COMPUTER then")
    a("        call PikaLearnSkills(h)")
    a("    endif")
    a("    call DisplayTimedTextToPlayer(p, 0, 0, 15.00, \"|cffffcc00Blood Elves!|r Your main hero Kunkka is waiting at the gate of your castle.\")")
    a("endfunction")
    a("")
    a("function PikaSetupOrcs takes nothing returns nothing")
    a("    local integer i = 0")
    a("    local player p")
    a("    local trigger t = CreateTrigger()")
    a("    loop")
    a("        exitwhen i == bj_MAX_PLAYERS")
    a("        set p = Player(i)")
    a("        set pikaRedOrc[i] = false")
    a("        if GetPlayerSlotState(p) == PLAYER_SLOT_STATE_PLAYING and GetPlayerRace(p) == RACE_ORC then")
    a("            if GetRandomInt(0, 1) == 1 then")
    a("                set pikaRedOrc[i] = true")
    a("                call DisplayTimedTextToPlayer(p, 0, 0, 15.00, \"|cffff3030Fel Orcs!|r The Blackrock clan answers your call: Fel Orcs (Chaos Grunts, Raiders, Kodos, Warlocks) with their own heroes: Chaos Blademaster, Grom, Azgalor, Magtheridon.\")")
    a("            else")
    a("                call DisplayTimedTextToPlayer(p, 0, 0, 15.00, \"|cff40ff40Horde Orcs!|r You lead the normal orcs of the Horde.\")")
    a("            endif")
    a("        endif")
    a("        set i = i + 1")
    a("    endloop")
    a("    call TriggerRegisterEnterRectSimple(t, GetWorldBounds())")
    a("    set t = CreateTrigger()")
    a("    set i = 0")
    a("    loop")
    a("        exitwhen i == bj_MAX_PLAYERS")
    a("        if GetPlayerController(Player(i)) == MAP_CONTROL_COMPUTER then")
    a("            call TriggerRegisterPlayerUnitEvent(t, Player(i), EVENT_PLAYER_HERO_LEVEL, null)")
    a("        endif")
    a("        set i = i + 1")
    a("    endloop")
    a("    call TriggerAddAction(t, function PikaOnHeroLevel)")
    a("    call TimerStart(CreateTimer(), 40.00, true, function PikaRedOrcAttack)")
    a("    call TriggerAddAction(t, function PikaOnEnter)")
    a("endfunction")
    a("")
    a("function PikaRedOrcStartingUnits takes player p returns nothing")
    a("    local group g = CreateGroup()")
    a("    local unit u")
    a("    call GroupEnumUnitsOfPlayer(g, p, null)")
    a("    loop")
    a("        set u = FirstOfGroup(g)")
    a("        exitwhen u == null")
    a("        call GroupRemoveUnit(g, u)")
    a("        call PikaApplyRedOrc(u)")
    a("    endloop")
    a("    call DestroyGroup(g)")
    a("endfunction")
    a("")
    a("function PikaMeleeStartingUnits takes nothing returns nothing")
    a("    local integer index")
    a("    local player indexPlayer")
    a("    local location indexStartLoc")
    a("    local race indexRace")
    a("    call Preloader(\"scripts\\\\SharedMelee.pld\")")
    a("    set index = 0")
    a("    loop")
    a("        set indexPlayer = Player(index)")
    a("        if (GetPlayerSlotState(indexPlayer) == PLAYER_SLOT_STATE_PLAYING) then")
    a("            set indexStartLoc = GetStartLocationLoc(GetPlayerStartLocation(indexPlayer))")
    a("            set indexRace = GetPlayerRace(indexPlayer)")
    a("            if PikaIsNagaPlayer(indexPlayer) then")
    a("                call PikaStartingUnitsNaga(indexPlayer, indexStartLoc)")
    a("                call PikaCastle(indexPlayer, 'nntg', 'nnfm')")
    a("            elseif (indexRace == RACE_HUMAN) then")
    a("                call MeleeStartingUnitsHuman(indexPlayer, indexStartLoc, true, true, true)")
    a("                call PikaGiveKunkka(indexPlayer, indexStartLoc)")
    a("                call PikaCastle(indexPlayer, 'hgtw', 'hhou')")
    a("            elseif (indexRace == RACE_ORC) then")
    a("                call MeleeStartingUnitsOrc(indexPlayer, indexStartLoc, true, true, true)")
    a("                call PikaCastle(indexPlayer, 'owtw', 'otrb')")
    a("                call PikaRedOrcStartingUnits(indexPlayer)")
    a("            elseif (indexRace == RACE_UNDEAD) then")
    a("                call MeleeStartingUnitsUndead(indexPlayer, indexStartLoc, true, true, true)")
    a("                call SetBlight(indexPlayer, GetLocationX(indexStartLoc), GetLocationY(indexStartLoc), %s, true)" % f(CASTLE_H + 200))
    a("                call PikaCastle(indexPlayer, 'uzg1', 'uzig')")
    a("            elseif (indexRace == RACE_NIGHTELF) then")
    a("                call MeleeStartingUnitsNightElf(indexPlayer, indexStartLoc, true, true, true)")
    a("                call PikaCastle(indexPlayer, 'etrp', 'emow')")
    a("            else")
    a("                call MeleeStartingUnitsUnknownRace(indexPlayer, indexStartLoc, true, true, true)")
    a("            endif")
    a("        endif")
    a("        set index = index + 1")
    a("        exitwhen index == bj_MAX_PLAYERS")
    a("    endloop")
    a("endfunction")
    a("")
    a("function PikaMeleeInitialization takes nothing returns nothing")
    a("    call MeleeStartingVisibility()")
    a("    call MeleeStartingHeroLimit()")
    a("    call MeleeGrantHeroItems()")
    a("    call MeleeStartingResources()")
    a("    call MeleeClearExcessUnits()")
    a("    call PikaSetupOrcs()")
    a("    call PikaMeleeStartingUnits()")
    a("    call MeleeStartingAI()")
    a("    call MeleeInitVictoryDefeat()")
    a("endfunction")
    a("")
    a("//===========================================================================")
    a("function main takes nothing returns nothing")
    a("    call SetCameraBounds(%s + GetCameraMargin(CAMERA_MARGIN_LEFT), %s + GetCameraMargin(CAMERA_MARGIN_BOTTOM), "
      "%s - GetCameraMargin(CAMERA_MARGIN_RIGHT), %s - GetCameraMargin(CAMERA_MARGIN_TOP), "
      "%s + GetCameraMargin(CAMERA_MARGIN_LEFT), %s - GetCameraMargin(CAMERA_MARGIN_TOP), "
      "%s - GetCameraMargin(CAMERA_MARGIN_RIGHT), %s + GetCameraMargin(CAMERA_MARGIN_BOTTOM))"
      % (f(PMIN), f(PMIN), f(PMAX), f(PMAX), f(PMIN), f(PMAX), f(PMAX), f(PMIN)))
    a("    call SetDayNightModels(\"Environment\\\\DNC\\\\DNCLordaeron\\\\DNCLordaeronTerrain\\\\DNCLordaeronTerrain.mdl\", "
      "\"Environment\\\\DNC\\\\DNCLordaeron\\\\DNCLordaeronUnit\\\\DNCLordaeronUnit.mdl\")")
    a("    call NewSoundEnvironment(\"Default\")")
    a("    call SetAmbientDaySound(\"SunkenRuinsDay\")")
    a("    call SetAmbientNightSound(\"SunkenRuinsNight\")")
    a("    call SetMapMusic(\"Music\", true, 0)")
    a("    call CreateNeutralPassiveBuildings()")
    a("    call CreateNeutralHostile()")
    a("    call InitBlizzard()")
    a("    call PikaMeleeInitialization()")
    a("endfunction")
    a("")
    a("//===========================================================================")
    a("function InitCustomPlayerSlots takes nothing returns nothing")
    for i in range(NPLAYERS):
        a("    call SetPlayerStartLocation(Player(%d), %d)" % (i, i))
        a("    call SetPlayerColor(Player(%d), ConvertPlayerColor(%d))" % (i, i))
        a("    call SetPlayerRacePreference(Player(%d), RACE_PREF_HUMAN)" % i)
        a("    call SetPlayerRaceSelectable(Player(%d), true)" % i)
        a("    call SetPlayerController(Player(%d), MAP_CONTROL_USER)" % i)
    a("endfunction")
    a("")
    a("function config takes nothing returns nothing")
    a("    call SetMapName(\"%s\")" % MAP_NAME)
    a("    call SetMapDescription(\"%s\")" % DESCRIPTION)
    a("    call SetPlayers(%d)" % NPLAYERS)
    a("    call SetTeams(%d)" % NPLAYERS)
    a("    call SetGamePlacement(MAP_PLACEMENT_TEAMS_TOGETHER)")
    for i, (x, y) in enumerate(starts):
        a("    call DefineStartLocation(%d, %s, %s)" % (i, f(x), f(y)))
    a("    call InitCustomPlayerSlots()")
    for i in range(NPLAYERS):
        a("    call SetPlayerSlotAvailable(Player(%d), MAP_CONTROL_USER)" % i)
    a("    call InitGenericPlayerSlots()")
    a("endfunction")
    a("")
    return ("\r\n".join(L)).encode('utf-8')


# --------------------------------------------------------------------------
# Minimap (war3mapMap.blp, war3map.mmp)
# --------------------------------------------------------------------------
PALETTE = [
    (8, 18, 40),       # 0 out of map
    (72, 128, 50),     # 1 grass
    (52, 108, 40),     # 2 lush
    (128, 102, 62),    # 3 dirt
    (112, 92, 64),     # 4 rough
    (222, 204, 142),   # 5 sand
    (150, 142, 124),   # 6 bricks
    (70, 150, 185),    # 7 shallow water
    (24, 66, 130),     # 8 deep water
    (22, 72, 28),      # 9 trees
    (255, 215, 0),     # 10 gold
    (58, 52, 48),      # 11 castle walls
    (235, 240, 245),   # 12 snow
    (150, 140, 130),   # 13 snowy dirt
    (60, 110, 70),     # 14 ashenvale grass
    (150, 90, 40),     # 15 leaves
    (200, 160, 100),   # 16 desert
    (150, 140, 70),    # 17 barrens grass
    (170, 150, 50),    # 18 fall grass
    (140, 110, 40),    # 19 fall dark grass
    (185, 180, 170),   # 20 tiles
]
TEX_COLOR = {T_GRASS: 1, T_LUSH: 2, T_DIRT: 3, T_ROUGH: 4, T_SAND: 5, T_BRICK: 6, T_SNOW: 12, T_SNOWDIRT: 13,
             T_AGRS: 14, T_LEAVES: 15, T_DESERT: 16, T_DGRASS: 17, T_FGRS: 18, T_FGRD: 19, T_VINES: 2, T_TILES: 20}
MM = 256


def build_minimap():
    tree_cells = set((int((x - PMIN) / (PMAX - PMIN) * MM), int((y - PMIN) / (PMAX - PMIN) * MM)) for _, x, y in trees)
    wall_cells = set((int((x - PMIN) / (PMAX - PMIN) * MM), int((y - PMIN) / (PMAX - PMIN) * MM)) for x, y in castle_blockers)
    img = bytearray(MM * MM)
    for py in range(MM):
        y = PMAX - (py + 0.5) / MM * (PMAX - PMIN)
        for px in range(MM):
            x = PMIN + (px + 0.5) / MM * (PMAX - PMIN)
            z = height_at(x, y)
            if z < WATER_Z:
                c = 7 if WATER_Z - z <= SHALLOW_DEPTH else 8
            elif (px, MM - 1 - py) in wall_cells:
                c = 11
            elif any((px - dx, MM - 1 - py - dy) in tree_cells for dx in (0, 1) for dy in (0, 1)):
                c = 9
            else:
                c = TEX_COLOR[ground_tex(x, y, z)]
            img[py * MM + px] = c
    # header + palette + full mip chain (nearest neighbour)
    mips = [bytes(img)]
    size = MM
    while size > 1:
        prev, ps = mips[-1], size
        size //= 2
        m = bytearray(size * size)
        for yy in range(size):
            for xx in range(size):
                m[yy * size + xx] = prev[(yy * 2) * ps + xx * 2]
        mips.append(bytes(m))
    header_size = 4 + 4 * 6 + 16 * 4 * 2
    pal = bytearray()
    for k in range(256):
        r, g, b = PALETTE[k] if k < len(PALETTE) else (0, 0, 0)
        pal += bytes([b, g, r, 0])
    offs, sizes, pos = [], [], header_size + 1024
    for m in mips:
        offs.append(pos)
        sizes.append(len(m))
        pos += len(m)
    offs += [0] * (16 - len(offs))
    sizes += [0] * (16 - len(sizes))
    blp = b'BLP1' + struct.pack('<6I', 1, 0, MM, MM, 5, 1)
    blp += struct.pack('<16I', *offs) + struct.pack('<16I', *sizes) + bytes(pal) + b''.join(mips)

    def mm(x, y):
        return (int((x - PMIN) / (PMAX - PMIN) * 255), int((PMAX - y) / (PMAX - PMIN) * 255))

    icons = []
    for (x, y) in main_mines + exp_mines:
        icons.append((0, mm(x, y), (255, 255, 255)))
    for i, (x, y) in enumerate(starts):
        icons.append((2, mm(x, y), PLAYER_RGB[i]))
    mmp = struct.pack('<ii', 0, len(icons))
    for t, (x, y), (r, g, b) in icons:
        mmp += struct.pack('<iii', t, x, y) + bytes([b, g, r, 255])
    return blp, mmp


# --------------------------------------------------------------------------
# MPQ (v1) writer
# --------------------------------------------------------------------------
def _crypt_table():
    t = [0] * 0x500
    seed = 0x00100001
    for i1 in range(0x100):
        i2 = i1
        for _ in range(5):
            seed = (seed * 125 + 3) % 0x2AAAAB
            t1 = (seed & 0xFFFF) << 0x10
            seed = (seed * 125 + 3) % 0x2AAAAB
            t[i2] = t1 | (seed & 0xFFFF)
            i2 += 0x100
    return t


CRYPT = _crypt_table()


def mpq_hash(s, htype):
    s1, s2 = 0x7FED7FED, 0xEEEEEEEE
    for ch in s.upper().replace('/', '\\').encode('ascii'):
        s1 = (CRYPT[(htype << 8) + ch] ^ (s1 + s2)) & 0xFFFFFFFF
        s2 = (ch + s1 + s2 + (s2 << 5) + 3) & 0xFFFFFFFF
    return s1


def mpq_encrypt(data, key):
    out = bytearray()
    s2 = 0xEEEEEEEE
    for (v,) in struct.iter_unpack('<I', data):
        s2 = (s2 + CRYPT[0x400 + (key & 0xFF)]) & 0xFFFFFFFF
        out += struct.pack('<I', v ^ ((key + s2) & 0xFFFFFFFF))
        key = ((((~key) << 0x15) + 0x11111111) | (key >> 0x0B)) & 0xFFFFFFFF
        s2 = (v + s2 + (s2 << 5) + 3) & 0xFFFFFFFF
    return bytes(out)


SECTOR = 4096


def mpq_pack_file(data):
    sectors = [data[k:k + SECTOR] for k in range(0, len(data), SECTOR)] or [b'']
    blobs = []
    for s in sectors:
        c = zlib.compress(s, 9)
        blobs.append(b'\x02' + c if len(c) + 1 < len(s) else s)
    table_len = 4 * (len(blobs) + 1)
    offs, pos = [], table_len
    for b in blobs:
        offs.append(pos)
        pos += len(b)
    offs.append(pos)
    return struct.pack('<%dI' % len(offs), *offs) + b''.join(blobs)


def build_mpq(files):
    names = list(files) + ['(listfile)']
    files = dict(files)
    files['(listfile)'] = ('\r\n'.join(names[:-1]) + '\r\n').encode('ascii')
    hsize = 1
    while hsize < len(names) * 2:
        hsize *= 2
    body = bytearray()
    blocks = []
    pos = 32
    for n in names:
        packed = mpq_pack_file(files[n])
        blocks.append((pos, len(packed), len(files[n]), 0x80000200))
        body += packed
        pos += len(packed)
    htab = [(0xFFFFFFFF, 0xFFFFFFFF, 0xFFFF, 0xFFFF, 0xFFFFFFFF)] * hsize
    for bi, n in enumerate(names):
        k = mpq_hash(n, 0) & (hsize - 1)
        while htab[k][4] != 0xFFFFFFFF:
            k = (k + 1) & (hsize - 1)
        htab[k] = (mpq_hash(n, 1), mpq_hash(n, 2), 0, 0, bi)
    hraw = b''.join(struct.pack('<IIHHI', *e) for e in htab)
    braw = b''.join(struct.pack('<IIII', *b) for b in blocks)
    henc = mpq_encrypt(hraw, mpq_hash('(hash table)', 3))
    benc = mpq_encrypt(braw, mpq_hash('(block table)', 3))
    hpos = pos
    bpos = hpos + len(henc)
    total = bpos + len(benc)
    header = b'MPQ\x1a' + struct.pack('<IIHHIIII', 32, total, 0, 3, hpos, bpos, hsize, len(blocks))
    return header + bytes(body) + henc + benc


def build_w3x(mpq):
    hdr = b'HM3W' + struct.pack('<i', 0) + cstr(MAP_NAME) + struct.pack('<ii', MAP_FLAGS, NPLAYERS)
    hdr += b'\0' * (512 - len(hdr))
    return hdr + mpq


def main():
    blp, mmp = build_minimap()
    files = {
        'war3map.j': build_j(),
        'war3map.w3i': build_w3i(),
        'war3map.w3e': build_w3e(),
        'war3map.wpm': build_wpm(),
        'war3map.doo': build_doo(),
        'war3map.shd': build_shd(),
        'war3map.w3u': build_w3u(),
        'war3map.w3a': build_w3a(),
        'war3map.w3b': build_w3b(),
        'war3mapMap.blp': blp,
        'war3map.mmp': mmp,
    }
    data = build_w3x(build_mpq(files))
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '(12)PikasooKingdoms.w3x')
    with open(out, 'wb') as fh:
        fh.write(data)
    print("wrote %s (%d bytes, %d trees, %d creeps)" % (out, len(data), len(trees), len(creeps)))


if __name__ == '__main__':
    main()
