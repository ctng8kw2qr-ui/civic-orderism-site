#!/usr/bin/env python3
"""
Generate the editorial cover SVG master for 《中国经济的未来在哪里？》
following the civic-editorial-illustration skill (concept work-sheet in
editorial-china-economic-future-concept.md).

Master: 5:2, 2000x800. Flat geometry, paper ground, charcoal brick wall,
four freed bricks standing independently in front (one in restrained gold).
"""
import os

W, H = 2000, 800
PAPER = "#faf8f5"
CHARCOAL = "#2e3031"
CHARCOAL_LIGHT = "#3a3c3e"
CHARCOAL_DARK = "#26282a"
SOCKET = "#141518"
GOLD = "#b3925a"
SHADOW = "#d8d1c4"

WALL_TOP = 500
BRICK_W, BRICK_H, GAP = 150, 56, 6
PITCH = BRICK_W + GAP  # 156
COLS = 13

rows = []  # (y, shift)
y = WALL_TOP + GAP
for r in range(5):
    rows.append((y, (PITCH // 2) if r % 2 == 1 else 0))
    y += BRICK_H + GAP

sockets = [(2, 2), (5, 2), (7, 1), (10, 2)]


def brick_rect(x, y, w, h, fill):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}"/>'


parts = [f'<rect width="{W}" height="{H}" fill="{PAPER}"/>']

# wall bricks
for r, (ry, shift) in enumerate(rows):
    for c in range(COLS):
        x = c * PITCH + shift
        if (c, r) in sockets:
            parts.append(brick_rect(x, ry, BRICK_W, BRICK_H, SOCKET))
            continue
        tone = CHARCOAL
        if (c + r) % 4 == 0:
            tone = CHARCOAL_LIGHT
        elif (c + r) % 7 == 0:
            tone = CHARCOAL_DARK
        parts.append(brick_rect(x, ry, BRICK_W, BRICK_H, tone))

# freed bricks standing in front of the wall (baseline y=712)
def freed(x, y, w, h, fill, shadow_dx=10, shadow_w=None, rotate=None):
    sw = shadow_w if shadow_w else w + 10
    s = (
        f'<rect x="{x + shadow_dx}" y="{y + h + 2}" width="{sw}" height="14" '
        f'fill="{SHADOW}"/>'
    )
    body = brick_rect(x, y, w, h, fill)
    if rotate is not None:
        cx, cy = rotate
        # librsvg-based rasterizers in this pipeline ignore <rect
        # transform="rotate(...)">, so emit the rotated rectangle as an
        # explicit polygon with pre-computed corner coordinates.
        cos45, sin45 = 0.7071067811865476, 0.7071067811865476
        pts = []
        for px, py in [(w / 2, h / 2), (w / 2, -h / 2), (-w / 2, -h / 2), (-w / 2, h / 2)]:
            rx = px * cos45 - py * sin45
            ry = px * sin45 + py * cos45
            pts.append(f"{cx + rx:.1f},{cy + ry:.1f}")
        body = (
            f'<polygon points="{" ".join(pts)}" fill="{fill}"/>'
        )
    return s + body


parts.append(freed(359, 562, 56, 150, CHARCOAL))               # upright
parts.append(freed(827, 562, 56, 150, GOLD))                   # gold upright
parts.append(freed(1170, 656, 150, 56, CHARCOAL_LIGHT))        # flat
parts.append(                                                  # diamond
    freed(1562, 611, 150, 56, CHARCOAL, shadow_dx=4, shadow_w=180,
          rotate=(1637, 639)),
)

svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">\n'
    + "\n".join(f"  {p}" for p in parts)
    + "\n</svg>\n"
)
out = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..",
    "quartz/static/assets/v6/editorial/source/editorial-china-economic-future.svg",
)
os.makedirs(os.path.dirname(out), exist_ok=True)
with open(out, "w", encoding="utf-8") as f:
    f.write(svg)
print("wrote", out)
