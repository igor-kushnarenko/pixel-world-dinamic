"""Deterministic room preparation. Run: python tools/prepare_room_v2.py (Pillow)."""
from pathlib import Path
import hashlib, json
from PIL import Image
ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/assets/room-v2'
OUT = ASSETS / 'prepared'
OUT.mkdir(exist_ok=True)
manifest = json.loads((ASSETS / 'manifest.json').read_text(encoding='utf-8'))
for entry in manifest['files']:
    assert hashlib.sha256((ASSETS / entry['file']).read_bytes()).hexdigest() == entry['sha256'], entry['file']
def load(name):
    return Image.open(ASSETS / 'originals' / name).convert('RGBA')
# Half-open integer bounds include the one-pixel white matte fringe.
aperture = (235, 115, 1577, 746)
base = load('room-base.png')
base.paste((0, 0, 0, 0), aperture)
base.save(OUT / 'room-base.png')
mask = Image.new('L', base.size, 0)
mask.paste(255, aperture)
mask.save(OUT / 'window-mask.png')
housing = Image.new('RGBA', base.size)
source = load('shutter-housing.png')
patches = [([147, 31, 198, 118], [195, 31]), ([246, 31, 1630, 118], [246, 31])]
for rect, position in patches:
    housing.paste(source.crop(rect), position)
housing.save(OUT / 'shutter-housing.png')
# One complete lamella between dark seams; no interpolated or blurred pixels.
# Duplicate the first dark row at the endpoint to make the repeat boundary exact.
crop = [32, 340, 1090, 462]
tile = load('shutter-slats.png').crop(crop)
tile.putalpha(255)  # Solid metal: source's uniform 254 alpha must not leak daylight.
tile.paste(tile.crop((0, 0, tile.width, 1)), (0, tile.height - 1))
tile.save(OUT / 'shutter-tile.png')
config = dict(version=1, sceneSize=list(base.size), aperture=list(aperture),
    boundsConvention='left,top,right,bottom exclusive; native scene pixels',
    housingPatches=patches, slatSourceCrop=crop, slatPeriod=tile.height,
    slatRepeat='vertical; horizontal nearest fit to aperture; endpoint row equals first row',
    drawOrder=['exterior', 'shutter clipped to window-mask', 'room-base', 'movable objects', 'foreground', 'shutter-housing'],
    files={name: 'prepared/' + name + '.png' for name in ['room-base', 'window-mask', 'shutter-housing', 'shutter-tile']})
(ASSETS / 'preparation.json').write_text(json.dumps(config, indent=2) + '\n', encoding='utf-8')
# Verify saved outputs, including all unchanged pixels outside the aperture.
original = load('room-base.png')
for box in [(0,0,1672,115),(0,746,1672,941),(0,115,235,746),(1577,115,1672,746)]:
    assert original.crop(box).tobytes() == base.crop(box).tobytes()
assert base.getchannel('A').crop(aperture).getextrema() == (0,0)
assert tile.getchannel('A').getextrema() == (255,255)
assert tile.crop((0,0,tile.width,1)).tobytes() == tile.crop((0,tile.height-1,tile.width,tile.height)).tobytes()
assert housing.crop((195,31,246,118)).tobytes() == source.crop((147,31,198,118)).tobytes()
print('PASS: six source hashes, unchanged room exterior, transparent aperture, unscaled housing cap, opaque repeat seam')

# Main-scene integration: same native geometry as the standalone preview.
composite = Image.alpha_composite(base, housing)
composite.save(OUT / 'room-composite.png')
Image.new('RGB', base.size).save(OUT / 'black.png')
emission = Image.new('RGB', base.size)
emission.putdata([(0,r,0) for r,g,b,a in load('wall-light-mask.png').getdata()])
emission.save(OUT / 'panel-emission.png')
light = Image.new('RGB', base.size)
light.putdata([tuple(int(c * max(0, 1-(((x-1634)/650)**2+((y-347)/500)**2)**0.5)) for c in (70,49,25)) for y in range(941) for x in range(1672)])
light.save(OUT / 'panel-light.png')
