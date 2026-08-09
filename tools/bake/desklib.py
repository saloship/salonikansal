"""Shared rig for baking desk objects to blueprint line art.

Two things here are the whole reason this pipeline beats hand-authoring:

  1. `visibility` line sets. Freestyle can tell us which edges are OCCLUDED, so
     hidden detail can be drawn dashed instead of guessed at or left out. That is
     the actual signature of a blueprint, and it is the one thing that cannot be
     faked reliably by hand across a crowded desk.

  2. The shear. The scene uses a cabinet projection - depth receding up-and-right
     at 0.35 / 0.65 - which is an oblique shear no camera can produce. Shearing
     the model by that exact amount and rendering a straight orthographic view IS
     the oblique projection, and because the shear preserves depth order along
     the view axis, Freestyle still resolves visibility correctly. So a bake
     lands in the existing coordinate space with one transform.

Coordinates match desk.mjs exactly:  x right, y up, z away, millimetres.
Blender's axes are X right, Y away, Z up, so (x, y, z) -> (x, z, y).
"""
import bpy, addon_utils, math, os
from mathutils import Matrix

KZX, KZY = 0.35, 0.65          # must match desk.mjs
SC, OX, OY = 0.72, 40, 1150    # ditto - used to report the registration transform

_made = []


HIDCOL = None


def reset():
    """Factory reset FIRST - it wipes enabled addons, so enabling before is moot."""
    global HIDCOL
    bpy.ops.wm.read_factory_settings(use_empty=True)
    addon_utils.enable("render_freestyle_svg", default_set=True)
    _made.clear()
    # Parts whose hidden edges are worth dashing. Only these feed the `hid` line
    # set: dashing what is behind all 87 keycaps turns a drawing into mush, and a
    # real sheet shows hidden detail where it carries information.
    HIDCOL = bpy.data.collections.new("hid_src")
    bpy.context.scene.collection.children.link(HIDCOL)


def mark_hidden(obs):
    for ob in (obs if isinstance(obs, list) else [obs]):
        if ob.name not in HIDCOL.objects:
            HIDCOL.objects.link(ob)


def _finish(ob, bevel, seg, angle):
    # Bake scale into the mesh BEFORE bevelling: the modifier works in local
    # space, so on an unapplied 2-unit cube a width of 1.1 is 55% of the half
    # extent and a keycap comes out as an ellipsoid.
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        m = ob.modifiers.new("bev", 'BEVEL')
        m.width = bevel
        m.segments = seg
        m.limit_method = 'ANGLE'
        m.angle_limit = math.radians(angle)
    _made.append(ob)
    return ob


def dbox(x, y, z, w, h, dp, bevel=0.5, seg=2, angle=30):
    """Bevelled solid, given in desk coordinates."""
    bpy.ops.mesh.primitive_cube_add(size=2)
    ob = bpy.context.active_object
    ob.scale = (w / 2, dp / 2, h / 2)
    ob.location = (x + w / 2, z + dp / 2, y + h / 2)
    return _finish(ob, bevel, seg, angle)


def dcyl(cx, cz, r, h, y0=0, axis='y', verts=48, bevel=0.4, seg=2, angle=30):
    """Cylinder. axis 'y' is upright (mugs, bottles, pen cups); 'z' runs away from
    the viewer (cable stubs, barrels); 'x' runs along the desk."""
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=1, depth=2)
    ob = bpy.context.active_object
    ob.scale = (r, r, h / 2)
    if axis == 'z':
        ob.rotation_euler = (math.radians(90), 0, 0)
        ob.location = (cx, cz + h / 2, y0)
    elif axis == 'x':
        ob.rotation_euler = (0, math.radians(90), 0)
        ob.location = (cx + h / 2, cz, y0)
    else:
        ob.location = (cx, cz, y0 + h / 2)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    return _finish(ob, bevel, seg, angle)


def well(x, y, z, w, h, dp, wall=8, floor=16):
    """A recessed well: base plate plus four rim walls.

    A solid slab has a flat top face, so hidden-line removal correctly draws no
    line there and anything standing on it appears to float. Real cases have a
    well, and the well is what gives the caps something to sit in.
    """
    return [
        dbox(x, y, z, w, floor, dp, bevel=1.6, seg=2),
        dbox(x, y + floor, z, w, h - floor, wall, bevel=1.0),                 # front rim
        dbox(x, y + floor, z + dp - wall, w, h - floor, wall, bevel=1.0),     # back rim
        dbox(x, y + floor, z + wall, wall, h - floor, dp - 2 * wall, bevel=1.0),
        dbox(x + w - wall, y + floor, z + wall, wall, h - floor, dp - 2 * wall, bevel=1.0),
    ]


def shear_all():
    """Apply the projection shear to everything built so far."""
    m = Matrix(((1, KZX, 0, 0), (0, 1, 0, 0), (0, KZY, 1, 0), (0, 0, 0, 1)))
    for ob in _made:
        ob.matrix_world = m @ ob.matrix_world


def camera(cx, cy, cz, view_w, res_x=1800):
    """Orthographic camera looking along +Y at a point given in DESK coords.

    Returns the registration transform for the exported SVG, which maps its pixel
    space into the scene's viewBox - print it and paste it into the merge.
    """
    scn = bpy.context.scene
    x_ = cx + KZX * cz
    z_ = cy + KZY * cz
    cam_data = bpy.data.cameras.new("cam")
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = view_w
    cam_data.clip_start = 1
    cam_data.clip_end = 60000
    cam = bpy.data.objects.new("cam", cam_data)
    scn.collection.objects.link(cam)
    cam.location = (x_, -20000, z_)
    cam.rotation_euler = (math.radians(90), 0, 0)
    scn.camera = cam

    res_y = int(round(res_x * 0.6389))
    scn.render.resolution_x = res_x
    scn.render.resolution_y = res_y
    px = res_x / view_w                       # pixels per mm
    scale = SC / px
    tx = OX + (x_ - view_w / 2) * SC
    ty = OY - (z_ + (res_y / px) / 2) * SC
    return f"translate({tx:.3f} {ty:.3f}) scale({scale:.6f})"


# --- line sets -------------------------------------------------------------
# One per drawing weight. The exporter emits a <g> per line set labelled with its
# name, so the merge can class them .ol / .vis / .hid and let CSS own the styling
# (including the dashes) exactly as the hand-authored art does.
# `ol` uses EXTERNAL CONTOUR — the outer boundary of the whole assembly, not each
# part's own silhouette. That is what a drafter weights heaviest, and per-object
# silhouettes at 2.6 gave 87 equally loud keycaps and no readable shape.
#
# `hid` deliberately omits creases. Dashing every occluded bevel behind 87 caps
# buried the drawing; hidden SILHOUETTES are the informative ones.
SETS = [
    ("ol",  dict(ext=True,  sil=False, border=False, crease=False), 'VISIBLE', 2.4),
    ("vis", dict(ext=False, sil=True,  border=True,  crease=True),  'VISIBLE', 1.4),
    ("hid", dict(ext=False, sil=True,  border=True,  crease=False), 'HIDDEN',  1.0),
]


def freestyle(crease_angle=20):
    scn = bpy.context.scene
    scn.render.engine = 'BLENDER_EEVEE'
    scn.render.use_freestyle = True
    wd = bpy.data.worlds.new("w")
    wd.use_nodes = False           # otherwise .color is ignored and it renders grey
    wd.color = (1, 1, 1)
    scn.world = wd

    vl = scn.view_layers[0]
    vl.use_freestyle = True
    fs = vl.freestyle_settings
    fs.mode = 'EDITOR'
    fs.crease_angle = math.radians(crease_angle)
    while fs.linesets:
        fs.linesets.remove(fs.linesets[0])

    for name, sel, vis, th in SETS:
        ls = fs.linesets.new(name)
        if ls.linestyle is None:
            ls.linestyle = bpy.data.linestyles.new(name)
        ls.select_silhouette = sel["sil"]
        ls.select_border = sel["border"]
        ls.select_crease = sel["crease"]
        ls.select_external_contour = sel["ext"]
        ls.select_contour = False
        ls.select_edge_mark = True
        ls.visibility = vis
        if vis == 'HIDDEN':
            ls.select_by_collection = True
            ls.collection = HIDCOL
        ls.linestyle.thickness = th
        ls.linestyle.color = (0.05, 0.11, 0.20)
        ls.linestyle.use_chaining = True

    scn.svg_export.use_svg_export = True
    scn.svg_export.mode = 'ANIMATION'      # a still render closes the file too early
    scn.svg_export.split_at_invisible = False
    scn.svg_export.line_join_type = 'MITER'
    scn.frame_start = scn.frame_end = 1


def render(outdir, name):
    scn = bpy.context.scene
    scn.render.filepath = os.path.join(outdir, name)
    scn.render.image_settings.file_format = 'PNG'
    bpy.ops.render.render(animation=True)
