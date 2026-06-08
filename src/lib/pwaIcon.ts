import { deflateSync } from 'node:zlib';

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const COLORS = {
  cyan: [103, 232, 249, 255],
  green: [134, 239, 172, 255],
  ink: [17, 24, 39, 255],
  white: [255, 255, 255, 255],
  pink: [249, 168, 212, 255],
} as const;

type Color = readonly [number, number, number, number];

function crc32(input: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of input) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.allocUnsafe(4);
  const checksum = Buffer.allocUnsafe(4);
  length.writeUInt32BE(data.length);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function fillRect(pixels: Buffer, size: number, x0: number, y0: number, x1: number, y1: number, color: Color): void {
  const scale = size / 64;
  const left = Math.round(x0 * scale);
  const top = Math.round(y0 * scale);
  const right = Math.round(x1 * scale);
  const bottom = Math.round(y1 * scale);
  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) {
      const offset = (y * size + x) * 4;
      pixels.set(color, offset);
    }
  }
}

export function createPixelPawsPng(size: 192 | 512, maskable = false): Buffer {
  const pixels = Buffer.alloc(size * size * 4);
  for (let offset = 0; offset < pixels.length; offset += 4) pixels.set(COLORS.cyan, offset);

  const inset = maskable ? 8 : 4;
  fillRect(pixels, size, inset, inset, 64 - inset, 64 - inset, COLORS.green);
  fillRect(pixels, size, 14, 24, 50, 48, COLORS.ink);
  fillRect(pixels, size, 20, 18, 26, 30, COLORS.ink);
  fillRect(pixels, size, 38, 18, 44, 30, COLORS.ink);
  fillRect(pixels, size, 20, 28, 44, 44, COLORS.white);
  fillRect(pixels, size, 24, 32, 30, 38, COLORS.ink);
  fillRect(pixels, size, 34, 32, 40, 38, COLORS.ink);
  fillRect(pixels, size, 28, 42, 36, 46, COLORS.ink);
  fillRect(pixels, size, 18, 24, 24, 28, COLORS.pink);
  fillRect(pixels, size, 40, 24, 46, 28, COLORS.pink);

  const scanlines = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y += 1) pixels.copy(scanlines, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);

  const header = Buffer.allocUnsafe(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([PNG_SIGNATURE, chunk('IHDR', header), chunk('IDAT', deflateSync(scanlines, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

export function pwaIconResponse(size: 192 | 512, maskable = false): Response {
  const png = createPixelPawsPng(size, maskable);
  const body = new Uint8Array(png.length);
  body.set(png);
  return new Response(body.buffer, {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': 'image/png',
    },
  });
}
