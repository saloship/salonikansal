"""Build an object from its spec. The spec decides everything; this file only obeys.

    blender -b -P tools/bake/build.py -- <object-id> <outdir>

Nothing here picks a dimension. If the drawing is wrong, the spec is wrong — which
is the point: there is one place to look, and it is readable without reading code.
Every assertion below exists because the spec claims something, and a claim that
is not checked is just a comment.
"""
import bpy, sys, os, json, math

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import desklib as D

argv = sys.argv[sys.argv.index('--') + 1:]
OBJ, OUT = argv[0], argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(HERE, "specs", f"{OBJ}.json"), encoding="utf-8") as fh:
    spec = json.load(fh)

print(f"SPEC: {spec['id']} — {spec['name']}")

DX, DY, DZ = spec["datum"]["x"], spec["datum"]["y"], spec["datum"]["z"]
ENV = spec["envelope"]

D.reset()

# --- extent tracking, so the envelope claim is actually enforced ------------
ext = {"x0": 1e9, "x1": -1e9, "y0": 1e9, "y1": -1e9, "z0": 1e9, "z1": -1e9}


def note(x, y, z, w, h, dp):
    ext["x0"] = min(ext["x0"], x); ext["x1"] = max(ext["x1"], x + w)
    ext["y0"] = min(ext["y0"], y); ext["y1"] = max(ext["y1"], y + h)
    ext["z0"] = min(ext["z0"], z); ext["z1"] = max(ext["z1"], z + dp)


def box(p, x, y, z, w, h, dp):
    note(x, y, z, w, h, dp)
    return D.dbox(DX + x, DY + y, DZ + z, w, h, dp,
                  bevel=p.get("fillet", 0.5), seg=p.get("seg", 2))


def cyl(p, x, y, z):
    r, h, axis = p["r"], p["h"], p.get("axis", "y")
    if axis == "y":
        note(x - r, y, z - r, 2 * r, h, 2 * r)
    elif axis == "z":
        note(x - r, y - r, z, 2 * r, 2 * r, h)
    else:
        note(x, y - r, z - r, h, 2 * r, 2 * r)
    return D.dcyl(DX + x, DZ + z, r, h, DY + y, axis=axis, bevel=p.get("fillet", 0.4))


def well(p, x, y, z):
    w, h, dp = p["w"], p["h"], p["d"]
    note(x, y, z, w, h, dp)
    return D.well(DX + x, DY + y, DZ + z, w, h, dp, wall=p["wall"], floor=p["floor"])


def keymap(p, x, y, z):
    """Key field from unit widths. Negative entries are gaps."""
    u, pitch, cap = p["u"], p["pitch"], p["cap"]
    made = 0
    widest = 0
    for r, row in enumerate(p["rows"]):
        rz = z + r * pitch
        cx = x
        for kw in row:
            if kw < 0:
                cx += -kw * u
                continue
            # the cap is narrower than its unit cell; the difference is the gap
            inset = (u * kw - cap["w"] * kw - (kw - 1) * (u - cap["w"])) / 2
            cw = kw * u - (u - cap["w"])
            cd = cap["d"]
            off = (pitch - cd) / 2
            note(cx + inset, y, rz + off, cw, cap["h"], cd)
            D.dcap(DX + cx + inset, DY + y, DZ + rz + off, cw, cd, cap["h"],
                   taper=cap.get("taper", 0.78), bevel=cap.get("fillet", 0.5))
            made += 1
            cx += kw * u
        widest = max(widest, (cx - x) / u)

    chk = p.get("check", {})
    if "keys" in chk:
        assert made == chk["keys"], f"keymap: built {made} keys, spec says {chk['keys']}"
    if "rowSum" in chk:
        assert abs(widest - chk["rowSum"]) < 0.01, \
            f"keymap: widest row is {widest}u, spec says {chk['rowSum']}u"
    print(f"  keyfield: {made} keys, {widest}u wide")


KINDS = {"box": box, "cyl": cyl, "well": well, "keymap": keymap}


def place(p, kind_fn, x, y, z):
    made = box(p, x, y, z, p["w"], p["h"], p["d"]) if kind_fn is box \
        else kind_fn(p, x, y, z)
    # `hidden` opts a part into the dashed occluded-edge line set. Off by default:
    # dashing what sits behind every keycap turns the drawing to mush, so only
    # parts whose interior actually carries information ask for it.
    if p.get("hidden") and made:
        D.mark_hidden(made)
    return made


for p in spec["parts"]:
    place(p, KINDS[p["kind"]], p["x"], p["y"], p["z"])
    print(f"  part {p['id']:10s} {p['kind']:8s} hidden={bool(p.get('hidden'))}")

for fdef in spec.get("features", []):
    spots = fdef.get("at") or [{"x": fdef["x"], "y": fdef["y"], "z": fdef["z"]}]
    assert len(spots) == fdef.get("count", len(spots)), \
        f"{fdef['id']}: count says {fdef.get('count')} but {len(spots)} positions given"
    for s in spots:
        place(fdef, KINDS[fdef["kind"]], s["x"], s["y"], s["z"])
    print(f"  feature {fdef['id']:8s} x{len(spots)}")

# --- the envelope is a claim; check it -------------------------------------
built = {"w": ext["x1"] - ext["x0"], "h": ext["y1"] - ext["y0"], "d": ext["z1"] - ext["z0"]}
print(f"ENVELOPE spec {ENV['w']}x{ENV['h']}x{ENV['d']} "
      f"built {built['w']:.1f}x{built['h']:.1f}x{built['d']:.1f}")
for k in ("w", "h", "d"):
    # Exact, to 0.5mm. An assertion with slack in it is not an assertion — the
    # first version of this allowed 30mm and quietly hid the fact that the spec
    # was declaring the case size while the build measured the whole assembly.
    assert abs(built[k] - ENV[k]) < 0.5, \
        f"envelope {k}: built {built[k]:.1f}, spec says {ENV[k]}"

D.shear_all()
pad = 1.28
reg = D.camera(DX + ext["x0"] + built["w"] / 2,
               DY + ext["y0"] + built["h"] / 2,
               DZ + ext["z0"] + built["d"] / 2,
               view_w=built["w"] * pad)
D.freestyle(crease_angle=spec.get("creaseAngle", 18))
D.render(OUT, spec["id"])

print("REGISTRATION:", reg)
