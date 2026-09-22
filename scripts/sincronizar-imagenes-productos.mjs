import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import Papa from 'papaparse';
import sharp from 'sharp';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'public', 'imagenes-productos');
const MANIFEST = path.join(ROOT, 'src', 'generated', 'imagenes-productos.json');
const SHEETS = [
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRonjC9Bv3YGK1Wpr8CN2EZh9370FkdcEXo94iCA-rJPiw7Y2gLT9hipzcTk4UWcFCRQaEvN0XT0Q_/pub?gid=0&single=true&output=csv',
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRonjC9Bv3YGK1Wpr8CN2EZh9370FkdcEXo94iCA-rJPiw7Y2gLT9hipzcTk4UWcFCRQaEvN0XT0Q_/pub?gid=921992274&single=true&output=csv',
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRonjC9Bv3YGK1Wpr8CN2EZh9370FkdcEXo94iCA-rJPiw7Y2gLT9hipzcTk4UWcFCRQaEvN0XT0Q_/pub?gid=731975557&single=true&output=csv',
];

await fs.mkdir(OUT, { recursive: true });
let anterior = {};
try { anterior = JSON.parse(await fs.readFile(MANIFEST, 'utf8')); } catch {}

async function fetchConTimeout(url, ms = 45000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try { return await fetch(url, { signal: c.signal, cache: 'no-store' }); }
  finally { clearTimeout(t); }
}

const urls = new Set();
for (const sheet of SHEETS) {
  const r = await fetchConTimeout(sheet);
  if (!r.ok) throw new Error(`Google Sheets respondió ${r.status}`);
  const csv = await r.text();
  const filas = Papa.parse(csv, { header: true, skipEmptyLines: true }).data;
  for (const fila of filas) {
    const raw = String(fila.Imagen || fila['Imagen'] || '').trim();
    if (!raw) continue;
    for (const u of raw.split(/[\n,;|]+/).map(x => x.trim()).filter(Boolean)) {
      if (/^https?:\/\//i.test(u)) urls.add(u);
    }
  }
}

const manifest = {};
let hechas = 0, reutilizadas = 0, fallidas = 0;

async function procesar(url) {
  const hash = crypto.createHash('sha1').update(url).digest('hex').slice(0, 20);
  const cardName = `${hash}-tarjeta.webp`;
  const detailName = `${hash}-detalle.webp`;
  const cardPath = path.join(OUT, cardName);
  const detailPath = path.join(OUT, detailName);
  const entry = { tarjeta: `/imagenes-productos/${cardName}`, detalle: `/imagenes-productos/${detailName}` };
  try {
    await Promise.all([fs.access(cardPath), fs.access(detailPath)]);
    manifest[url] = entry; reutilizadas++; return;
  } catch {}
  try {
    const r = await fetchConTimeout(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer());
    await Promise.all([
      sharp(buf).rotate().resize({ width: 420, height: 420, fit: 'inside', withoutEnlargement: true }).webp({ quality: 72, effort: 4 }).toFile(cardPath),
      sharp(buf).rotate().resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80, effort: 4 }).toFile(detailPath),
    ]);
    manifest[url] = entry; hechas++;
  } catch (e) {
    if (anterior[url]) manifest[url] = anterior[url];
    fallidas++;
    console.warn(`[A Todo Trapo] No se pudo optimizar: ${url} (${e.message})`);
  }
}

const lista = [...urls];
for (let i = 0; i < lista.length; i += 6) await Promise.all(lista.slice(i, i + 6).map(procesar));
await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`[A Todo Trapo] Imágenes: ${Object.keys(manifest).length}/${lista.length} locales (${hechas} nuevas, ${reutilizadas} reutilizadas, ${fallidas} fallidas).`);
