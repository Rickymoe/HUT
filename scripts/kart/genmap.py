"""Holmestrand sentrum – sketch map from real OSM geometry, rotated so Langgaten
runs left->right. HUT's ACTUAL building footprints (matched from geocoded
addresses) are filled; everything else is faint context."""
import json, math, html

import os
SP = os.path.dirname(os.path.abspath(__file__))
osm = json.load(open(f'{SP}/osm.json'))['elements']

# geocoded HUT address points  (gård-nr -> list of (lat,lon))
GA = {
 1:[(59.487393,10.317716),(59.487269,10.317940),(59.487128,10.318183),(59.486976,10.318319)],  # Kvartal Langgaten 36-42
 2:[(59.487895,10.316959)],                       # Frellumstadgården  L32
 3:[(59.488005,10.317170)],                       # Henningsengården   L29
 4:[(59.48865,10.31640),(59.48850,10.31648),(59.488032,10.316412)],  # Uni-Kvartalet L23/27 + T5
 5:[(59.488199,10.316905),(59.488260,10.317150)], # Ihlengården        T6/T8
 6:[(59.487854,10.317487)],                       # Stenstadgården     DG1
 7:[(59.487955,10.318075)],                       # Dr. Graaruds pl. 3 DG3
 8:[(59.488462,10.317890)],                       # Nordeagården       Hav7
 9:[(59.487600,10.317217)],                       # Apotekergården     L34
 10:[(59.488589,10.315645)],                      # Langgaten 24
 11:[(59.487341,10.318242)],                      # Langgaten 33
}
NAME = {1:'Kvartal Langgaten',2:'Frellumstadgården',3:'Henningsengården',4:'Uni-Kvartalet',5:'Ihlengården',
        6:'Stenstadgården',7:'Dr. Graaruds plass 3',8:'Nordeagården',9:'Apotekergården',
        10:'Langgaten 24',11:'Langgaten 33'}
KIND = {10:'moss'}
STASJ = (59.4901464, 10.3107247)
TORG  = (59.48896, 10.31612)
KIRKE = (59.48843, 10.31360)

lat0 = 59.4882
MLON = 111320.0 * math.cos(math.radians(lat0))
def to_m(lat, lon): return (lon-10.3160)*MLON, (lat0-lat)*111320.0
# rotation: align the principal axis of all HUT address points with the x-axis
_hp = [to_m(a,b) for adrs in [
    [(59.487393,10.317716),(59.487269,10.317940),(59.487128,10.318183),(59.486976,10.318319)],
    [(59.487895,10.316959)],[(59.488005,10.317170)],
    [(59.48865,10.31640),(59.48850,10.31648),(59.488032,10.316412)],
    [(59.488199,10.316905),(59.488260,10.317150)],[(59.487854,10.317487)],[(59.487955,10.318075)],
    [(59.488462,10.317890)],[(59.487600,10.317217)],[(59.488589,10.315645)],[(59.487341,10.318242)]]
    for a,b in adrs]
_mx = sum(p[0] for p in _hp)/len(_hp); _my = sum(p[1] for p in _hp)/len(_hp)
_sxx = sum((p[0]-_mx)**2 for p in _hp); _syy = sum((p[1]-_my)**2 for p in _hp)
_sxy = sum((p[0]-_mx)*(p[1]-_my) for p in _hp)
TH = -0.5*math.atan2(2*_sxy, _sxx-_syy)
ct,st = math.cos(TH), math.sin(TH)
def pr(lat, lon):
    x,y = to_m(lat, lon); return (x*ct - y*st, x*st + y*ct)
def dist(a,b): return math.hypot(a[0]-b[0], a[1]-b[1])
def centroid(pts): return (sum(p[0] for p in pts)/len(pts), sum(p[1] for p in pts)/len(pts))
def _plen(pts): return sum(dist(pts[i], pts[i+1]) for i in range(len(pts)-1))
def pip(pt, poly):
    x,y = pt; inside = False; n = len(poly)
    for i in range(n):
        x0,y0 = poly[i]; x1,y1 = poly[(i+1)%n]
        if ((y0 > y) != (y1 > y)) and (x < (x1-x0)*(y-y0)/(y1-y0)+x0): inside = not inside
    return inside

def inwin(lat, lon): return 59.4868 <= lat <= 59.4896 and 10.3138 <= lon <= 10.3193

# classify OSM
bld, streets, water, parks = [], [], [], []
SW = {'primary':3.6,'secondary':3.2,'tertiary':2.8,'residential':2.2,'unclassified':2.2,
      'living_street':2.5,'pedestrian':2.7,'primary_link':2.4,'secondary_link':2.2}
LAB = {'Langgaten':2,'Tordenskjoldsgate':1,'Havnegaten':1,'Dr. Graaruds plass':1,
       'Bekkegaten':1,'Kirkegaten':1,'Rådhusgaten':1,'Bakgaten':1}
named = {}
for e in osm:
    g = e.get('geometry');  t = e.get('tags', {})
    if not g: continue
    inw = [n for n in g if inwin(n['lat'], n['lon'])]
    if not inw: continue
    pts = [pr(n['lat'], n['lon']) for n in g]
    if t.get('natural') == 'water': water.append(pts)
    elif 'leisure' in t or t.get('place') == 'square': parks.append(pts)
    elif 'building' in t: bld.append(pts)
    elif 'highway' in t:
        streets.append((pts, SW.get(t['highway'], 1.8)))
        nm = t.get('name')
        if nm in LAB:
            # keep the longest in-window run of this street for label placement
            ipts = [pr(n['lat'], n['lon']) for n in g if inwin(n['lat'], n['lon'])]
            if len(ipts) >= 2 and (nm not in named or _plen(ipts) > _plen(named[nm])):
                named[nm] = ipts

# match HUT addresses -> OSM building footprints
hut_polys = {}   # gnr -> list of polygons
used = set()
for gnr, adrs in GA.items():
    hut_polys[gnr] = []
    for lat,lon in adrs:
        p = pr(lat, lon)
        best, bd = None, 26
        for i,poly in enumerate(bld):
            if i in used: continue
            if pip(p, poly): best, bd = i, 0; break
            d = dist(p, centroid(poly))
            if d < bd: best, bd = i, d
        if best is not None:
            hut_polys[gnr].append(bld[best]); used.add(best)
ctx = [poly for i,poly in enumerate(bld) if i not in used]

# cluster centroid -> drop far-flung context buildings
hc = centroid([p for polys in hut_polys.values() for poly in polys for p in poly])
ctx = [poly for poly in ctx if dist(centroid(poly), hc) < 175]

hutp = [p for polys in hut_polys.values() for poly in polys for p in poly]
fx0,fx1 = min(p[0] for p in hutp), max(p[0] for p in hutp)
fy0,fy1 = min(p[1] for p in hutp), max(p[1] for p in hutp)
# a little context margin; keep y tight around the footprints
minx = fx0-44; maxx = fx1+40
miny = fy0-30; maxy = fy1+24
SCALE = 3.8
W = (maxx-minx)*SCALE; H = (maxy-miny)*SCALE
def S(p): return ((p[0]-minx)*SCALE, (p[1]-miny)*SCALE)
def poly_s(pts): return ' '.join(f'{S(p)[0]:.0f},{S(p)[1]:.0f}' for p in pts)
def path_s(pts): return 'M ' + ' L '.join(f'{S(p)[0]:.0f} {S(p)[1]:.0f}' for p in pts)

o = [f'<svg class="portefolje-kart" viewBox="0 0 {W:.0f} {H:.0f}" role="img" '
     f'aria-label="Kart over Holmestrand sentrum. Holmestrand Utvikling AS eier de fargede byggene.">',
     f'  <rect x="-30" y="-30" width="{W+60:.0f}" height="{H+60:.0f}" fill="var(--paper)"/>',
     f'  <path d="M-30 -30 H{W+30:.0f} V54 C {W*0.66:.0f} 74 {W*0.30:.0f} 40 -30 70 Z" fill="var(--mist)" opacity="0.5"/>',
     f'  <path d="M-30 {H+30:.0f} H{W+30:.0f} V{H-20:.0f} C {W*0.7:.0f} {H-32:.0f} {W*0.3:.0f} {H-8:.0f} -30 {H-24:.0f} Z" fill="#aeb87b" opacity="0.24"/>',
     f'  <text class="kart-fjell" x="14" y="{H-8:.0f}">Fjellet</text>']
for pts in parks: o.append(f'  <polygon points="{poly_s(pts)}" fill="#aeb87b" opacity="0.28"/>')
o.append('  <g class="kart-bygg">')
for pts in ctx: o.append(f'    <polygon points="{poly_s(pts)}"/>')
o.append('  </g>')
o.append('  <g class="kart-gater">')
for pts,w in sorted(streets, key=lambda s:s[1]): o.append(f'    <path class="gate-kant" d="{path_s(pts)}" stroke-width="{w+3.6:.1f}"/>')
for pts,w in sorted(streets, key=lambda s:s[1]): o.append(f'    <path d="{path_s(pts)}" stroke-width="{w:.1f}"/>')
o.append('  </g>')
# HUT footprints
o.append('  <g class="kart-hut">')
for gnr, polys in hut_polys.items():
    fill = 'var(--ember)' if KIND.get(gnr) == 'moss' else 'var(--fjord)'
    cen = centroid([p for poly in polys for p in poly]) if polys else pr(*GA[gnr][0])
    cx, cy = S(cen)
    o.append(f'    <g class="kart-gaard" data-g="{gnr}" tabindex="0" role="listitem" aria-label="{gnr}. {html.escape(NAME[gnr])}">')
    for poly in polys:
        o.append(f'      <polygon class="hut-fp" points="{poly_s(poly)}" fill="{fill}"/>')
    o.append(f'      <circle class="hut-nr-bg" cx="{cx:.1f}" cy="{cy:.1f}" r="10"/>')
    o.append(f'      <text class="kart-nr" x="{cx:.1f}" y="{cy+3.6:.1f}" text-anchor="middle">{gnr}</text>')
    o.append(f'      <title>{gnr}. {html.escape(NAME[gnr])}</title>')
    o.append('    </g>')
o.append('  </g>')
# street labels, rotated to follow the street
hcent = [centroid([p for poly in polys for p in poly]) for polys in hut_polys.values() if polys]
def near_hut(pt, r=15): return any(dist(pt, c) < r for c in hcent)
for nm, ipts in named.items():
    sp = [S(p) for p in ipts]
    # pick the mid segment, walking out if it's on a footprint
    order = sorted(range(len(sp)-1), key=lambda i: abs(i - (len(sp)-1)/2))
    seg = None
    for i in order:
        mid = ((sp[i][0]+sp[i+1][0])/2, (sp[i][1]+sp[i+1][1])/2)
        if not near_hut(mid): seg = (sp[i], sp[i+1], mid); break
    if seg is None:
        i = order[0]; seg = (sp[i], sp[i+1], ((sp[i][0]+sp[i+1][0])/2, (sp[i][1]+sp[i+1][1])/2))
    (x0,y0),(x1,y1),(mx,my) = seg
    ang = math.degrees(math.atan2(y1-y0, x1-x0))
    if ang > 90: ang -= 180
    if ang < -90: ang += 180
    lvl = LAB[nm]
    cls = 'kart-gatenavn kart-gatenavn--hoved' if lvl==2 else 'kart-gatenavn'
    txt = html.escape(nm.upper() if lvl==2 else nm)
    o.append(f'  <text class="{cls}" x="{mx:.0f}" y="{my:.0f}" dy="-4" text-anchor="middle" '
             f'transform="rotate({ang:.1f} {mx:.0f} {my:.0f})">{txt}</text>')
o.append(f'  <text class="kart-vann" x="{W-12:.0f}" y="20">Oslofjorden</text>')
# landmark points
for (lat,lon),lab,dx in [(STASJ,'Holmestrand stasjon',8),(TORG,'Torvet',8),(KIRKE,'Holmestrand kirke',8)]:
    x,y = S(pr(lat,lon))
    if not (0 < x < W and 0 < y < H): continue
    o.append(f'  <circle class="kart-punkt" cx="{x:.0f}" cy="{y:.0f}" r="3"/>')
    o.append(f'  <text class="kart-poi" x="{x+dx:.0f}" y="{y+3.5:.0f}">{lab}</text>')
o += [f'  <g class="kart-gaard" data-g="12" tabindex="0" role="listitem" aria-label="12. Våleveien Næringspark" transform="translate({W-168:.0f} {H-14:.0f})">',
      '    <circle class="kg-halo" r="11"/>', '    <path d="M0 -6 L5.5 3.5 L-5.5 3.5 Z" fill="var(--fjord)"/>',
      '    <text class="kart-poi" x="12" y="3.5">12 · Våleveien 29 — 2 km sør</text>',
      '    <title>12. Våleveien Næringspark</title>', '  </g>']
cx, cy = W-22, 34
o += [f'  <g class="kart-kompass" transform="rotate({math.degrees(TH):.1f} {cx} {cy})">',
      f'    <line x1="{cx}" y1="{cy+9}" x2="{cx}" y2="{cy-8}"/>',
      f'    <path d="M{cx} {cy-12} l3.2 6.4 l-6.4 0 Z"/>',
      f'    <text x="{cx}" y="{cy+18}" text-anchor="middle">N</text>', '  </g>', '</svg>']

open(f'{SP}/hut-kart.svg', 'w').write('\n'.join(o))
matched = {g: len(p) for g,p in hut_polys.items()}
print(f'viewBox 0 0 {W:.0f} {H:.0f}  ratio {W/H:.2f}  ctx {len(ctx)}  matched {matched}  labels {list(named)}')
