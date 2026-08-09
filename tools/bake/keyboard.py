"""Bake the keyboard: ANSI tenkeyless, 351.5 x 114mm, exactly desk.mjs's numbers.

  blender -b -P tools/bake/keyboard.py -- <outdir>
"""
import bpy, sys, os, math

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import desklib as D

OUT = sys.argv[sys.argv.index('--') + 1]
D.reset()

X, Z, U, PITCH = 720, 190, 19, 19
KW, KD = 18.5 * U, 6 * PITCH
W, DP = KW + 13, KD + 15
CASE_H, FLOOR, WALL = 26, 15, 6.5

ROWS = [
    [1, -1, 1, 1, 1, 1, -0.5, 1, 1, 1, 1, -0.5, 1, 1, 1, 1, -0.5, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, -0.5, 1, 1, 1],
    [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, -0.5, 1, 1, 1],
    [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],
    [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75, -1.5, 1],
    [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25, -0.5, 1, 1, 1],
]

# case as a well, not a slab — the caps need a floor to stand on and a rim to
# stand inside, or hidden-line removal leaves them hovering over nothing
D.well(X, 0, Z, W, CASE_H, DP, wall=WALL, floor=FLOOR)

# keycaps: seated on the well floor, standing 7mm proud of the rim, with a
# slight top taper because a keycap is dished, not a brick
caps = 0
for r, row in enumerate(ROWS):
    rz = Z + WALL + 2 + r * PITCH
    cx = X + WALL + 2
    for kw in row:
        if kw < 0:
            cx += -kw * U
            continue
        ob = D.dbox(cx + 1.5, FLOOR, rz + 1.5, kw * U - 3.0, 18, PITCH - 3.0,
                    bevel=0.9, seg=2, angle=25)
        caps += 1
        cx += kw * U
print("CAPS:", caps)

# lock indicators on the back rim, and the cable leaving the case
for i in range(3):
    D.dbox(X + W - 46 + i * 13, CASE_H - 1.5, Z + 1.5, 7, 2, 3.5, bevel=0.4)
D.dbox(X + W - 30, 3, Z + DP - 2, 9, 9, 26, bevel=2.5, seg=3)

# rear feet: why the case sits at a tilt
D.dbox(X + 22, -7, Z + DP - 20, 42, 8, 13, bevel=1.2)
D.dbox(X + W - 64, -7, Z + DP - 20, 42, 8, 13, bevel=1.2)

D.shear_all()
reg = D.camera(X + W / 2, CASE_H / 2, Z + DP / 2, view_w=470)
D.freestyle(crease_angle=18)
D.render(OUT, "keyboard")

print("REGISTRATION:", reg)
print("FILES:", sorted(os.listdir(OUT)))
