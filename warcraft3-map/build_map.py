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
MAP_NAME = "Pikasoo Coast"
AUTHOR = "WebPikasoo"
DESCRIPTION = ("A tropical island for up to 12 players. Beaches, a shallow lagoon in the "
               "middle, a tavern and goblin shops. Human players who pick Night Elf "
               "play as the Naga with Illidan, Medusa and a Royal Guard.")
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


_coast = [(random.randint(2, 9), random.uniform(0, 6.283), random.uniform(120, 330)) for _ in range(6)]


def coast_radius(theta):
    r = 10350.0 * S
    for k, ph, amp in _coast:
        r += amp * math.sin(k * theta + ph)
    return min(r, PMAX - 500)


# --------------------------------------------------------------------------
# Layout: bases, expansions, neutral buildings, creeps
# --------------------------------------------------------------------------
BASE_R = 7900.0 * S
EXP_R = 5300.0 * S
LAGOON_R = 1150.0 * S
C_R = 1950.0 * S                # ring of neutral buildings in the centre


def polar(r, deg):
    a = math.radians(deg)
    return (r * math.cos(a), r * math.sin(a))


def snap(v, g=64.0):
    return round(v / g) * g


starts, main_mines, exp_mines = [], [], []
for i in range(NPLAYERS):
    ang = 90.0 - i * 30.0
    sx, sy = polar(BASE_R, ang)
    sx, sy = snap(sx), snap(sy)
    starts.append((sx, sy))
    # gold mine: 660 units from the town hall, outward and a bit to the side
    mx, my = polar(660.0, ang + 38.0)
    main_mines.append((snap(sx + mx), snap(sy + my)))
    ex, ey = polar(EXP_R, ang - 15.0)
    exp_mines.append((snap(ex), snap(ey)))

neutral_buildings = [
    ('ntav', polar(C_R, 90)),     # Tavern
    ('ngme', polar(C_R, 210)),    # Goblin Merchant
    ('ngad', polar(C_R, 330)),    # Goblin Laboratory
    ('nfoh', polar(C_R, 30)),     # Fountain of Health
    ('nfoh', polar(C_R, 150)),    # Fountain of Health
    ('nmoo', polar(C_R, 270)),    # Fountain of Mana
]
neutral_buildings = [(u, (snap(x), snap(y))) for u, (x, y) in neutral_buildings]

CAMPS = [
    ['nmrl', 'nmrl', 'nmrr'],          # murlocs
    ['nlsn', 'nlsn', 'nltc'],          # makrura
    ['ntrh', 'ntrs', 'ntrh'],          # sea turtles
    ['ngno', 'ngno', 'ngnb'],          # gnolls
    ['nmcf', 'nmcf', 'nmsn'],          # mur'gul
    ['nfrl', 'nfrl', 'nfrs'],          # furbolgs
]
BIG_CAMPS = [
    ['ntrt', 'ntrs', 'ntrs'],
    ['nogm', 'nogr', 'nogr'],
    ['nmrv', 'nmtw', 'nmsn'],
]
creeps = []
for i, (ex, ey) in enumerate(exp_mines):
    # camp sits between the expansion mine and the island centre
    d = math.hypot(ex, ey)
    cx, cy = ex - ex / d * 520, ey - ey / d * 520
    face = math.degrees(math.atan2(ey - cy, ex - cx)) + 180
    for k, uid in enumerate(CAMPS[i % len(CAMPS)]):
        ox, oy = polar(110, k * 120 + 15)
        creeps.append((uid, cx + ox, cy + oy, face % 360))
for i in range(6):
    ang = 60.0 * i
    cx, cy = polar(3400 * S, ang)
    mx, my = polar(3400 * S + 520, ang)
    exp_mines.append((snap(mx), snap(my)))
    for k, uid in enumerate(BIG_CAMPS[i % len(BIG_CAMPS)]):
        ox, oy = polar(130, k * 120)
        creeps.append((uid, cx + ox, cy + oy, (ang + 180) % 360))


def seg_dist(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - ax - t * dx, py - ay - t * dy)


roads = [(sx, sy, 0.0, 0.0) for sx, sy in starts]


def road_dist(x, y):
    d = min(seg_dist(x, y, *r) for r in roads)
    r = math.hypot(x, y)
    return min(d, abs(r - EXP_R))     # ring road through the expansions


# --------------------------------------------------------------------------
# Terrain (heights + textures)
# --------------------------------------------------------------------------
TEX = [b'Zgrs', b'Zvin', b'Zdrt', b'Zdtr', b'Zsan', b'Zbks']
T_GRASS, T_LUSH, T_DIRT, T_ROUGH, T_SAND, T_BRICK = range(6)


def ground_z(x, y):
    """height of the ground in world units"""
    d = math.hypot(x, y)
    theta = math.atan2(y, x)
    s = coast_radius(theta) - d                    # >0 inland of the coastline
    if s < 0:                                      # sea
        z = -12.0 + s * 0.16
        return max(z, -320.0)
    if d < LAGOON_R:                               # shallow lagoon in the middle
        return max(-12.0 - (LAGOON_R - d) * 0.06, WATER_Z - 40.0)   # always shallow
    if s < 750:                                    # beach slope
        return -12.0 + 12.0 * (s / 750.0) + max(0.0, noise(x, y, 2.0, 3)) * 6 * (s / 750.0)
    if d < LAGOON_R + 350:
        return -12.0 + 12.0 * ((d - LAGOON_R) / 350.0)
    hz = noise(x, y, 0.8, 1) * 22.0
    # keep bases, expansions and the centre flat
    for (bx, by) in starts + exp_mines:
        dd = math.hypot(x - bx, y - by)
        if dd < 1500:
            hz *= max(0.0, (dd - 1000) / 500.0)
    if d < C_R + 750:
        hz *= max(0.0, (d - C_R - 350) / 400.0)
    return max(hz, 0.0) + min(1.0, (s - 750) / 300.0) * 2.0


def ground_tex(x, y, z):
    d = math.hypot(x, y)
    s = coast_radius(math.atan2(y, x)) - d
    if s < 750 or d < LAGOON_R + 380 or z < WATER_Z + 5:
        return T_SAND
    if C_R - 500 < d < C_R + 500:
        return T_BRICK if (road_dist(x, y) < 260 or C_R - 250 < d < C_R + 250) else T_SAND
    if road_dist(x, y) < 190 + 40 * noise(x, y, 4, 7):
        return T_DIRT
    for (bx, by) in starts:
        if math.hypot(x - bx, y - by) < 520 + 60 * noise(x, y, 5, 2):
            return T_DIRT
    n = noise(x, y, 1.6, 5)
    if n > 0.45:
        return T_LUSH
    if n < -0.55:
        return T_ROUGH
    if s < 1000:
        return T_SAND if noise(x, y, 6, 9) > 0 else T_GRASS
    return T_GRASS


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
    d = math.hypot(x, y)
    s = coast_radius(math.atan2(y, x)) - d
    if s < 900 or d < C_R + 750:
        return False
    if road_dist(x, y) < 330:
        return False
    for (bx, by) in starts:
        if math.hypot(x - bx, y - by) < 1150:
            return False
    for (mx, my) in main_mines:
        if math.hypot(x - mx, y - my) < 520:
            return False
    for (mx, my) in exp_mines:
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
            d = math.hypot(gx, gy)
            s = coast_radius(math.atan2(gy, gx)) - d
            ang = math.degrees(math.atan2(gy, gx))
            near_mid = min(abs(((ang - 90 + 15) % 30) - 15), 15)   # 0 = halfway between two bases
            p = 0.0
            if d > BASE_R + 700 and s > 900:          # forest belt behind the bases
                p = 0.88
            elif d > 6500 * S and near_mid < 5.5:         # walls between neighbours
                p = 0.8
            elif noise(gx, gy, 2.2, 11) > 0.5:        # random groves
                p = 0.75
            if random.random() < p:
                trees.append((gx, gy))
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
    out = bytearray(b'W3do' + struct.pack('<ii', 8, 11) + struct.pack('<i', len(trees)))
    for n, (x, y) in enumerate(trees):
        sc = random.uniform(0.9, 1.15)
        out += b'ZTtw' + struct.pack('<i', random.randint(0, 9))
        out += struct.pack('<fff', x, y, height_at(x, y))
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
ILLIDAN_SKILLS = "AEmb,AEim,AEev," + META_ID


def build_w3u():
    """Unit changes: Naga Sea Witch -> Medusa, Illidan gets the toggle Metamorphosis"""
    mods = [
        (b'Nngs', [(b'unam', "Medusa"), (b'upro', "Medusa")]),
        (b'Eevi', [(b'uhab', ILLIDAN_SKILLS)]),     # Illidan (Naga era: horns + wings)
        (b'Eevm', [(b'uhab', ILLIDAN_SKILLS)]),     # his demon form
    ]
    o = bytearray(struct.pack('<ii', 2, len(mods)))
    for uid, fields in mods:
        o += uid + b'\0\0\0\0' + struct.pack('<i', len(fields))
        for field, val in fields:
            o += field + struct.pack('<i', 3) + cstr(val) + b'\0\0\0\0'
    o += struct.pack('<i', 0)
    return bytes(o)


def build_w3b():
    """Trees never fall: give the island tree a huge amount of life, so
    harvesting lumber (which takes life from the tree) never cuts it down."""
    o = bytearray(struct.pack('<ii', 2, 1))
    o += b'ZTtw' + b'\0\0\0\0' + struct.pack('<i', 1)
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
        (b'arlv', INT, 0, 0, 6),
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
                             "The demon form has NO time limit - press the button again to turn back. Requires hero level 6."),
        (b'atp1', STR, 1, 0, "Metamorphosis (" + hk + ")"),
        (b'aub1', STR, 1, 0, "Transform into a demon. Lasts until you turn it off."),
        (b'aut1', STR, 1, 0, "Normal Form (" + hk + ")"),
        (b'auu1', STR, 1, 0, "Turn back into Illidan's normal form."),
        (b'Eme1', STR, 1, 1, "Eevi"),           # normal form unit
        (b'Emeu', STR, 1, 0, "Eevm"),           # demon form unit
        (b'Eme2', INT, 1, 2, 1),                # morph flags (same as Illidan's original)
        (b'adur', UNREAL, 1, 0, 1.5),           # transformation animation time only
        (b'ahdu', UNREAL, 1, 0, 1.5),
        (b'acdn', UNREAL, 1, 0, 0.0),
        (b'amcs', INT, 1, 0, 0),
    ]
    o = bytearray(struct.pack('<ii', 2, 0))          # no changed standard abilities
    o += struct.pack('<i', 1) + b'Abrf' + META_ID.encode() + struct.pack('<i', len(fields))
    for fid, t, lvl, dat, val in fields:
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
    a("    call DisplayTimedTextToPlayer(whichPlayer, 0, 0, 15.00, \"|cff00ccffYou rule the Naga!|r Illidan, Medusa and the Royal Guard are at your command. At level 6 Illidan learns Metamorphosis: press F to become a demon, press F again to turn back.\")")
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
    a("            elseif (indexRace == RACE_HUMAN) then")
    a("                call MeleeStartingUnitsHuman(indexPlayer, indexStartLoc, true, true, true)")
    a("            elseif (indexRace == RACE_ORC) then")
    a("                call MeleeStartingUnitsOrc(indexPlayer, indexStartLoc, true, true, true)")
    a("            elseif (indexRace == RACE_UNDEAD) then")
    a("                call MeleeStartingUnitsUndead(indexPlayer, indexStartLoc, true, true, true)")
    a("            elseif (indexRace == RACE_NIGHTELF) then")
    a("                call MeleeStartingUnitsNightElf(indexPlayer, indexStartLoc, true, true, true)")
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
]
TEX_COLOR = {T_GRASS: 1, T_LUSH: 2, T_DIRT: 3, T_ROUGH: 4, T_SAND: 5, T_BRICK: 6}
MM = 256


def build_minimap():
    tree_cells = set((int((x - PMIN) / (PMAX - PMIN) * MM), int((y - PMIN) / (PMAX - PMIN) * MM)) for x, y in trees)
    img = bytearray(MM * MM)
    for py in range(MM):
        y = PMAX - (py + 0.5) / MM * (PMAX - PMIN)
        for px in range(MM):
            x = PMIN + (px + 0.5) / MM * (PMAX - PMIN)
            z = height_at(x, y)
            if z < WATER_Z:
                c = 7 if WATER_Z - z <= SHALLOW_DEPTH else 8
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
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '(12)PikasooCoast.w3x')
    with open(out, 'wb') as fh:
        fh.write(data)
    print("wrote %s (%d bytes, %d trees, %d creeps)" % (out, len(data), len(trees), len(creeps)))


if __name__ == '__main__':
    main()
