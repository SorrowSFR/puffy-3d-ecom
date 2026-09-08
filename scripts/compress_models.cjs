const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { NodeIO } = require('@gltf-transform/core');
const { KHRONOS_EXTENSIONS } = require('@gltf-transform/extensions');
const { simplify, weld, dedup, prune, quantize, textureCompress } = require('@gltf-transform/functions');
const { MeshoptSimplifier } = require('meshoptimizer');

const MODELS_DIR = path.join(__dirname, '..', 'public', 'assets', 'models');
const BACKUP_DIR = path.join(MODELS_DIR, 'originals_backup');

const MODELS = [
  'puffer-purple-lumi.glb',
  'puffer-silver-iridescent.glb',
  'puffer-pink-bubblegum.glb',
  'puffer-blue-aurora.glb',
  'puffer-electric-aurora.glb',
  'puffer-moonbeam.glb',
];

async function main() {
  console.log('🚀 Initializing MeshoptSimplifier...');
  await MeshoptSimplifier.ready;

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`📁 Created backup directory: ${BACKUP_DIR}`);
  }

  const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS);
  const results = [];

  for (const filename of MODELS) {
    const filePath = path.join(MODELS_DIR, filename);
    const backupPath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File not found: ${filePath}, skipping.`);
      continue;
    }

    // Backup original if not already backed up
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(filePath, backupPath);
      console.log(`💾 Backed up ${filename} -> originals_backup/`);
    }

    const origStat = fs.statSync(backupPath);
    const origSizeMB = (origStat.size / (1024 * 1024)).toFixed(2);

    console.log(`\n⚙️ Processing: ${filename} (Original: ${origSizeMB} MB)...`);

    // Always read from the pristine backup to allow repeatable runs
    const doc = await io.read(backupPath);

    // Count original vertices
    let origVerts = 0;
    for (const m of doc.getRoot().listMeshes()) {
      for (const p of m.listPrimitives()) {
        const pos = p.getAttribute('POSITION');
        if (pos) origVerts += pos.getCount();
      }
    }

    console.log(`   Vertices: ${origVerts.toLocaleString()} -> optimizing...`);

    await doc.transform(
      weld(),
      simplify({
        simplifier: MeshoptSimplifier,
        ratio: 0.12, // reduce to ~12% (~140k vertices, crystal crisp topology)
        error: 0.005,
      }),
      textureCompress({
        encoder: sharp,
        targetFormat: 'jpeg',
        resize: [1024, 1024],
        quality: 85,
      }),
      quantize(),
      dedup(),
      prune()
    );

    // Count optimized vertices
    let optVerts = 0;
    for (const m of doc.getRoot().listMeshes()) {
      for (const p of m.listPrimitives()) {
        const pos = p.getAttribute('POSITION');
        if (pos) optVerts += pos.getCount();
      }
    }

    const compressedBuffer = await io.writeBinary(doc);
    fs.writeFileSync(filePath, Buffer.from(compressedBuffer));

    const newSizeMB = (compressedBuffer.byteLength / (1024 * 1024)).toFixed(2);
    const reduction = ((1 - compressedBuffer.byteLength / origStat.size) * 100).toFixed(1);

    console.log(`   ✅ Done! New Size: ${newSizeMB} MB (-${reduction}%), Vertices: ${optVerts.toLocaleString()}`);

    results.push({
      Model: filename,
      'Original (MB)': origSizeMB,
      'Optimized (MB)': newSizeMB,
      'Reduction (%)': `-${reduction}%`,
      'Original Verts': origVerts.toLocaleString(),
      'Optimized Verts': optVerts.toLocaleString(),
    });
  }

  console.log('\n📊 === COMPRESSION SUMMARY === 📊');
  console.table(results);
}

main().catch((err) => {
  console.error('❌ Compression failed:', err);
  process.exit(1);
});
