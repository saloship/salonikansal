"""Proof bake: the keyboard, modelled at its real dimensions, rendered as line
art with true hidden-line removal.

The projection trick matters as much as the modelling. Our scene uses a CABINET
projection (depth receding up-and-right at 0.35 / 0.65), which is an oblique
shear — no camera can produce it, orthographic or otherwise. But shearing the
model by exactly that amount and then rendering a straight orthographic front
view IS the oblique projection. So baked art registers pixel-for-pixel with the
hand-authored scene, and Freestyle still computes visibility correctly because
the shear preserves depth order along the view axis.

  desk coords : x right, y up, z away      (same numbers as desk.mjs)
  blender     : X right, Y away,  Z up
"""
import bpy, addon_utils, sys, os, math
from mathutils import Matrix

OUT = sys.argv[sys.argv.index('--') + 1]

bpy.ops.wm.read_factory_settings(use_empty=True)
addon_utils.enable("render_freestyle_svg", default_set=True)
scn = bpy.context.scene

KZX, KZY = 0.35, 0.65

made = []


def dbox(x, y, z, w, h, dp, bevel=0.5, seg=2):
    """A bevelled solid, given in desk coordinates."""
    # size=2 spans -1..1, so scaling by half-extents gives the true size.
    # With size=1 every solid came out at half scale and the caps sat outside the case.
    bpy.ops.mesh.primitive_cube_add(size=2)
    ob = bpy.context.active_object
    ob.scale = (w / 2, dp / 2, h / 2)
    ob.location = (x + w / 2, z + dp / 2, y + h / 2)
    # Bake the scale into the mesh BEFORE bevelling. The modifier works in local
    # space, so on an unapplied 2-unit cube a width of 1.1 is 55% of the half
    # extent — every keycap came out as an ellipsoid rather than a rounded box.
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        m = ob.modifiers.new("bev", 'BEVEL')
        m.width = bevel
        m.segments = seg
        m.limit_method = 'ANGLE'
        m.angle_limit = math.radians(30)
    made.append(ob)
    return ob


# --- the keyboard, exactly the numbers desk.mjs uses ----------------------
X, Z, U, PITCH = 720, 190, 19, 19
KW, KD = 18.5 * U, 6 * PITCH          # 351.5 x 114
W, DP = KW + 13, KD + 15
CASE_H = 24

ROWS = [
    [1, -1, 1, 1, 1, 1, -0.5, 1, 1, 1, 1, -0.5, 1, 1, 1, 1, -0.5, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, -0.5, 1, 1, 1],
    [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, -0.5, 1, 1, 1],
    [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],
    [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75, -1.5, 1],
    [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25, -0.5, 1, 1, 1],
]

# case, with a wedge: a keyboard is not a flat slab, it tilts toward the user
dbox(X, 0, Z, W, CASE_H, DP, bevel=2.2, seg=3)

# keycaps: 8mm proud of the case, each bevelled, real widths per row
ncaps = 0
for r, row in enumerate(ROWS):
    rz = Z + 7 + r * PITCH
    cx = X + 6
    for kw in row:
        if kw < 0:
            cx += -kw * U
            continue
        dbox(cx + 1.6, CASE_H - 3, rz + 1.6, kw * U - 3.2, 11, PITCH - 3.2,
             bevel=1.1, seg=2)
        ncaps += 1
        cx += kw * U
print("CAPS:", ncaps)

# rear feet, which is why the wedge exists
dbox(X + 24, -6, Z + DP - 18, 40, 8, 12, bevel=1.0)
dbox(X + W - 64, -6, Z + DP - 18, 40, 8, 12, bevel=1.0)

# --- shear everything, then look at it straight on ------------------------
shear = Matrix(((1, KZX, 0, 0), (0, 1, 0, 0), (0, KZY, 1, 0), (0, 0, 0, 1)))
for ob in made:
    ob.matrix_world = shear @ ob.matrix_world

cam_data = bpy.data.cameras.new("cam")
cam_data.type = 'ORTHO'
cam_data.ortho_scale = 470
cam_data.clip_start = 1
cam_data.clip_end = 40000
cam = bpy.data.objects.new("cam", cam_data)
scn.collection.objects.link(cam)
# centre of the sheared keyboard, viewed along +Y
cxw = X + W / 2 + KZX * (Z + DP / 2)
czw = CASE_H / 2 + KZY * (Z + DP / 2)
cam.location = (cxw, -8000, czw)
cam.rotation_euler = (math.radians(90), 0, 0)
scn.camera = cam

scn.render.engine = 'BLENDER_EEVEE'
scn.render.resolution_x = 1800
scn.render.resolution_y = 1150
scn.render.filepath = os.path.join(OUT, "kbd")
scn.render.image_settings.file_format = 'PNG'
wd = bpy.data.worlds.new("w")
wd.use_nodes = False          # otherwise .color is ignored and the ground stays grey
wd.color = (1, 1, 1)
scn.world = wd

# --- Freestyle: real hidden-line removal ---------------------------------
scn.render.use_freestyle = True
vl = scn.view_layers[0]
vl.use_freestyle = True
fs = vl.freestyle_settings
fs.mode = 'EDITOR'
fs.crease_angle = math.radians(28)
if not fs.linesets:
    fs.linesets.new("visible")
ls = fs.linesets[0]
if ls.linestyle is None:
    ls.linestyle = bpy.data.linestyles.new("stroke")
ls.select_silhouette = True
ls.select_border = True
ls.select_crease = True
ls.select_contour = True
ls.visibility = 'VISIBLE'            # <- the whole point
ls.linestyle.thickness = 1.5
ls.linestyle.color = (0.05, 0.11, 0.20)

scn.svg_export.use_svg_export = True
scn.svg_export.mode = 'ANIMATION'
scn.svg_export.split_at_invisible = True
scn.svg_export.line_join_type = 'MITER'      # a drawing has corners, not fillets
scn.frame_start = scn.frame_end = 1

bpy.ops.render.render(animation=True)
print("FILES:", sorted(os.listdir(OUT)))
