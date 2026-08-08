const test = require('node:test');
const assert = require('node:assert/strict');
const sharp = require('sharp');

// Pure image-processing logic — no Supabase client or network calls
// involved, so this runs safely without any live configuration.
const { optimizeImageBuffer } = require('../src/services/storage.service');

async function makePng({ width, height }) {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 90, g: 140, b: 220 },
    },
  })
    .png()
    .toBuffer();
}

test('optimizeImageBuffer downscales an oversized JPEG to the max dimension', async () => {
  const original = await sharp({
    create: { width: 3000, height: 1500, channels: 3, background: { r: 10, g: 200, b: 30 } },
  })
    .jpeg()
    .toBuffer();

  const optimized = await optimizeImageBuffer(original, 'image/jpeg');
  const meta = await sharp(optimized).metadata();

  assert.ok(meta.width <= 2000 && meta.height <= 2000, 'expected longest edge to be capped at 2000px');
  assert.ok(optimized.length <= original.length, 'expected optimized buffer to not be larger than the original');
});

test('optimizeImageBuffer leaves a small PNG under the size floor untouched', async () => {
  const tiny = await makePng({ width: 10, height: 10 });
  const result = await optimizeImageBuffer(tiny, 'image/png');
  assert.equal(result, tiny, 'expected the exact same buffer to be returned, unprocessed');
});

test('optimizeImageBuffer passes through unsupported mime types unchanged', async () => {
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"></svg>');
  const result = await optimizeImageBuffer(svg, 'image/svg+xml');
  assert.equal(result, svg, 'expected SVGs to be stored as-is, not rasterized');
});

test('optimizeImageBuffer never throws on a corrupt buffer, and returns the original bytes', async () => {
  const garbage = Buffer.from('not-a-real-image-just-bytes'.repeat(1000));
  const result = await optimizeImageBuffer(garbage, 'image/jpeg');
  assert.equal(result, garbage, 'expected a decode failure to fall back to the original buffer');
});
