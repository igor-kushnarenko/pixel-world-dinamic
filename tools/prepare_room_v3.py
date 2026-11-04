"""Technical preparation, native geometry, immutable originals. Requires Pillow."""
from pathlib import Path
from PIL import Image, ImageChops
import json,hashlib
ROOT=Path(__file__).resolve().parents[1]/'public/assets/room-v3'
OUT=ROOT/'prepared';OUT.mkdir(exist_ok=True)
for e in json.loads((ROOT/'manifest.json').read_text(encoding='utf-8'))['files']:
 assert hashlib.sha256((ROOT/e['file']).read_bytes()).hexdigest()==e['sha256']
def load(name):return Image.open(ROOT/'originals'/f'{name}.png').convert('RGBA')
base=load('room-base');aperture=(240,121,1579,749)
base.paste((0,0,0,0),aperture);base.save(OUT/'room-base.png')
mask=Image.new('L',base.size);mask.paste(255,aperture);mask.save(OUT/'window-mask.png')
housing=Image.new('RGBA',base.size);source=load('shutter-housing')
for rect,dest in [((154,58,210,147),(184,33)),((240,58,1618,147),(240,33))]:housing.paste(source.crop(rect),dest)
housing.save(OUT/'shutter-housing.png')
# Only the front fascia participates in occlusion, not the whole tabletop.
front=Image.new('RGBA',base.size);front.paste(load('sill-foreground').crop((0,840,1672,875)),(0,840))
front.save(OUT/'sill-front.png')
composite=Image.alpha_composite(Image.alpha_composite(base,front),housing);composite.save(OUT/'room-composite.png')
visible=Image.new('RGBA',base.size,(255,255,255,255));visible.putalpha(ImageChops.invert(front.getchannel('A')));visible.save(OUT/'object-visibility.png')
# One complete material period, dark seam to dark seam. Endpoint matches exactly.
tile=load('shutter-slats').crop((0,72,1122,150));tile.putalpha(255);tile.paste(tile.crop((0,0,tile.width,1)),(0,tile.height-1));tile.save(OUT/'shutter-tile.png')
wall=load('wall-light-mask').convert('L')
shelf=Image.new('L',base.size)
# Supplied half-disc is above the lamp. Reuse its lowest band for the shade's underside.
shelf.paste(load('shelf-light-mask').convert('L').crop((74,648,150,653)),(74,700))
em=Image.merge('RGB',(shelf,wall,Image.new('L',base.size)));em.save(OUT/'panel-emission.png')
for name,cx,cy,rx,ry,color in [('shelf-light',112,707,340,290,(100,64,29)),('panel-light',1634,347,650,500,(70,49,25))]:
 im=Image.new('RGB',base.size);im.putdata([tuple(int(c*max(0,1-(((x-cx)/rx)**2+((y-cy)/ry)**2)**.5)) for c in color) for y in range(941) for x in range(1672)]);im.save(OUT/f'{name}.png')
assert composite.getpixel((800,400))[3]==0
assert tile.getchannel('A').getextrema()==(255,255)
assert tile.crop((0,0,1122,1)).tobytes()==tile.crop((0,tile.height-1,1122,tile.height)).tobytes()
print('PASS: seven originals, transparent window, opaque repeat, aligned lamp underside')
