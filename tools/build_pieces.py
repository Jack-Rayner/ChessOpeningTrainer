"""Build the Art Nouveau / Gaudí piece set as SVG files.

Each piece is a list of primitive shapes (circles, ellipses, rounded rects and a few
paths) merged into one silhouette, drawn in layers:
  1. every shape stroked at double width in the outline colour (only the outer half
     shows, so the merged silhouette gets one clean outline with no inner seams)
  2. every shape in the shadow tone
  3. every shape in the body tone, nudged up-left and clipped to the silhouette,
     leaving a flat shadow band on the lower-right edges
  4. a small highlight on shapes marked "hl"
  5. a few interior lines

Usage (from the repository root):  python3 tools/build_pieces.py
Writes img/chesspieces/nouveau/{wK,wQ,...,bP}.svg
"""
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "img" / "chesspieces" / "nouveau"

OUTLINE_W = 3
PALETTE = {
    "w": {"body": "#f9f7f2", "shadow": "#d6d0c4", "highlight": "#ffffff", "outline": "#46423d"},
    "b": {"body": "#56514c", "shadow": "#433f3b", "highlight": "#7a746d", "outline": "#262321"},
}

# Shared base: a flat rounded foot, a parabolic dome and an elliptical Batlló knuckle.
BASE = [
    {"r": (21, 79, 58, 10, 5)},
    {"p": "M26 80 C30 72, 40 70, 50 70 C60 70, 70 72, 74 80 Z"},
    {"e": (50, 66, 13, 4.5)},
]

PIECES = {
    # Stems are Batlló bones: pinched at the waist with a knuckle partway down.
    "P": {"shapes": BASE + [
        {"p": "M41 52 C44 55, 45 58, 43 61 C42 63, 42 65, 40 66 L60 66 C58 65, 58 63, 57 61 C55 58, 56 55, 59 52 Z"},
        {"e": (50, 61, 8.5, 2.6)},
        {"e": (50, 51, 13, 3.8)},
        {"c": (50, 36, 12), "hl": True},
    ]},
    # Rook: the crenellations become three swelling lobes, like a Casa Milà roofline.
    "R": {"shapes": BASE + [
        {"p": "M35 37 C37 46, 37 56, 39 66 L61 66 C63 56, 63 46, 65 37 Z"},
        {"e": (50, 54, 14.5, 3)},
        {"p": "M27 35 V24 C27 16, 38 15, 39 27 C41 12, 59 12, 61 27 C62 15, 73 16, 73 24 "
              "V35 Q73 37 71 37 H29 Q27 37 27 35 Z", "hl": True},
    ], "details": [{"d": "M31 37 H69"}]},
    # Bishop: a catenary mitre rising to a point, crowned with a knob.
    "B": {"shapes": BASE + [
        {"p": "M42 56 C44 59, 44 62, 41 66 L59 66 C56 62, 56 59, 58 56 Z"},
        {"e": (50, 55, 11, 3)},
        {"p": "M36 44 C36 32, 44 22, 50 18 C56 22, 64 32, 64 44 C64 50, 58 53, 50 53 "
              "C42 53, 36 50, 36 44 Z", "hl": True},
        {"c": (50, 12.5, 5.2)},
    ], "details": [{"d": "M57 27.5 C52 31, 48 36, 47 44", "w": 3}]},  # slit curving round the mitre
    # Queen: the crown's points bow inwards like flames or Sagrada Família spires.
    "Q": {"shapes": BASE + [
        {"p": "M40 50 C43 55, 44 58, 42 61 C41 63, 42 65, 41 66 L59 66 C58 65, 59 63, 58 61 "
              "C56 58, 57 55, 60 50 Z"},
        {"e": (50, 60, 9.5, 2.6)},
        {"e": (50, 48, 16, 4)},
        {"p": "M24 28 Q30 40 34 47 L66 47 Q70 40 76 28 Q68 27 63 32 Q65 24 64 18 Q58 23 56 28 "
              "Q54 20 50 14 Q46 20 44 28 Q42 23 36 18 Q35 24 37 32 Q32 27 24 28 Z", "hl": True},
        {"c": (50, 12, 4.2)}, {"c": (36, 16, 4)}, {"c": (64, 16, 4)}, {"c": (23, 25, 3.8)}, {"c": (77, 25, 3.8)},
    ]},
    # King: Gaudí's knobbed cross (as on Park Güell and Casa Batlló) over the dome.
    "K": {"scale": 0.945, "shapes": BASE + [
        {"p": "M40 51 C43 56, 44 58, 42 61 C41 63, 42 65, 41 66 L59 66 C58 65, 59 63, 58 61 "
              "C56 58, 57 56, 60 51 Z"},
        {"e": (50, 60.5, 9.5, 2.6)},
        {"e": (50, 50, 15, 3.8)},
        {"e": (50, 35, 25, 14), "hl": True},
        {"e": (50, 21, 6, 2.5)},
        {"r": (47, 5, 6, 15, 3)},
        {"r": (42, 9.5, 16, 5.5, 2.75)},
        {"c": (50, 5, 4.3)}, {"c": (41.5, 12.2, 3.9)}, {"c": (58.5, 12.2, 3.9)},
    ], "details": [{"d": "M30 41 Q50 47 70 41"}]},
    # Knight: a slender, bowed head on a swan neck, with the mane as its own whiplash
    # ribbon that flicks out into a curl at the foot.
    "N": {"scale": 0.945, "shapes": BASE + [
        {"p": "M43 8 C54 5, 67 12, 71 24 C75 35, 73 46, 69 54 C67 58, 64 58, 62 56 "
              "C60 48, 62 40, 60 30 C58 20, 52 14, 44 13 Z"},
        {"c": (69, 58.5, 4.2)},
        {"p": "M41 67 C39 60, 37 55, 37.5 48 C37.7 46, 36 44.6, 33 44.2 C32 44.1, 31 44, 30 44 C26 45, 21 48, 17 49.5 "
              "C14 50.5, 11.5 48.5, 12 45.5 C12.5 42, 15 38, 18 33 C21 27, 25 21, 30 16 "
              "C32 13, 34 10, 36 6 C37 4, 39 2.5, 41 3 C42 6, 42.5 9, 44 11 "
              "C53 12, 60 20, 61 31 C62 41, 58 50, 58 58 C58 62, 59 65, 59 67 Z", "hl": True},
    ], "details": [
        {"d": "M27 25 C29.5 22, 33 21.5, 35.5 23 C33 25.5, 30 26.5, 27 25 Z", "fill": True},  # eye
        {"d": "M26 20.5 C29 17.5, 34 17, 37 19"},                                               # brow
        {"d": "M14.5 43 C16.5 42, 18.5 43, 19 45"},                                             # nostril
        {"d": "M29 44.2 C34 42.6, 39 41.5, 41.5 37.5 C43.5 34, 42.5 30.5, 40 28.5"},  # jaw: runs on past the throat, over the neck
        {"d": "M44 11 C53 12, 60 20, 61 31 C62 41, 58 50, 58 58"},                              # neck / mane seam
        {"d": "M58.0 18.0 Q60.5 16.5 61.7 13.9", "w": 1.7},
        {"d": "M61.6 25.8 Q65.4 24.6 68.2 21.9", "w": 1.7},
        {"d": "M62.7 34.2 Q67.1 33.9 71.1 31.9", "w": 1.7},
        {"d": "M61.9 42.7 Q66.5 43.4 70.9 42.4", "w": 1.7},
        {"d": "M66 57.5 C66.5 55, 71 55, 71.5 58 C72 60.5, 69 61.5, 68 59.5", "w": 1.7},  # curl
    ]},
}


def shape_svg(s, extra=""):
    if "c" in s:
        cx, cy, r = s["c"]
        return f'<circle cx="{cx}" cy="{cy}" r="{r}"{extra}/>'
    if "e" in s:
        cx, cy, rx, ry = s["e"]
        return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}"{extra}/>'
    if "r" in s:
        x, y, w, h, rx = s["r"]
        return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}"{extra}/>'
    return f'<path d="{s["p"]}"{extra}/>'


def render(piece, color):
    p = PALETTE[color]
    shapes = piece["shapes"]
    union = "".join(shape_svg(s) for s in shapes)
    # Tall pieces shrink slightly about the base line (y 92) so their outline stays
    # inside the square while every base still sits at the same height.
    s = piece.get("scale", 1)
    fit = f'<g transform="translate(50 92) scale({s}) translate(-50 -92)">' if s != 1 else "<g>"
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">', fit,
           f'<defs><clipPath id="u">{union}</clipPath></defs>',
           f'<g fill="{p["outline"]}" stroke="{p["outline"]}" stroke-width="{OUTLINE_W * 2}" stroke-linejoin="round">{union}</g>',
           f'<g fill="{p["shadow"]}">{union}</g>',
           f'<g clip-path="url(#u)" fill="{p["body"]}"><g transform="translate(-3.5 -2.5)">{union}</g></g>']
    for i, s in enumerate(shapes):
        if not s.get("hl"):
            continue
        highlight = shape_svg(s, ' fill="%s"' % p["highlight"])
        cover = shape_svg(s, ' fill="%s"' % p["body"])
        out.append(f'<defs><clipPath id="h{i}">{shape_svg(s)}</clipPath></defs>')
        out.append(f'<g clip-path="url(#h{i})">{highlight}'
                   f'<g transform="translate(2.2 2.2)">{cover}</g></g>')
    for d in piece.get("details", []):
        if d.get("fill"):
            out.append(f'<path d="{d["d"]}" fill="{p["outline"]}"/>')
        else:
            w = d.get("w", OUTLINE_W * 0.7)
            out.append(f'<path d="{d["d"]}" fill="none" stroke="{p["outline"]}" stroke-width="{w}" '
                       f'stroke-linecap="round" stroke-linejoin="round"/>')
    out.append("</g></svg>")
    return "".join(out) + "\n"


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for color in ("w", "b"):
        for name, piece in PIECES.items():
            (OUT / f"{color}{name}.svg").write_text(render(piece, color), encoding="utf-8")
    print(f"Wrote 12 pieces to {OUT}")


if __name__ == "__main__":
    main()
