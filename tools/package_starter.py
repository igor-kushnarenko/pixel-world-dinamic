from pathlib import Path
import zipfile,json
root=Path(__file__).resolve().parents[1]
out=root/'public/downloads';out.mkdir(exist_ok=True)
package=root/'artifacts/pixel-world-atmosphere-engine-0.5.0.tgz'
assert package.exists()
(out/package.name).write_bytes(package.read_bytes())
with zipfile.ZipFile(out/'pixel-world-panorama-starter-0.5.0.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in (root/'examples/panorama').rglob('*'):
  if p.is_file() and not any(x in p.parts for x in ['node_modules','dist']):z.write(p,p.relative_to(root/'examples/panorama'))
 z.write(package,package.name)
with zipfile.ZipFile(out/'pixel-world-apartment-starter-0.5.0.zip','w',zipfile.ZIP_DEFLATED) as z:
 for folder in ['src','tools','docs','tests','.github']:
  for p in (root/folder).rglob('*'):
   if p.is_file() and '__pycache__' not in p.parts:z.write(p,p.relative_to(root))
 for p in (root/'public').rglob('*'):
  if p.is_file() and 'downloads' not in p.relative_to(root/'public').parts:z.write(p,p.relative_to(root))
 for name in ['package.json','package-lock.json','tsconfig.json','tsconfig.engine.json','vite.config.ts','vite.engine.config.ts','index.html','live_sky_instructions.md','CHANGELOG.md']:
  z.write(root/name,name)
 z.writestr('README.md','Atmosphere Engine 0.5.0 — полный пример квартиры. npm install; npm run dev. Для настройки новой комнаты смотрите docs/REUSE_050.md. Пользовательские медиа не включены. Наполните file_system своими файлами. Звук требует нажатия пользователем. Для сборки: npm run build. Скрипт package:starter относится к исходному репозиторию поставщика.')
 for folder in ['PHOTO','MUSIC','VIDEO','TEXT']:z.writestr('file_system/'+folder+'/.gitkeep','')
for p in out.glob('*0.5.0*'):print(p.name,p.stat().st_size)
