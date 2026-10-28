// Tiny dependency-free QR code encoder (byte mode, versions 1–40, mask chosen
// by the standard penalty rules). Pure functions — safe for server and client.
//
//   const modules = qrModules("https://example.com/m/abc");   // boolean[][]
//   const svg = qrSvg("https://example.com/m/abc", { size: 240 });
//
// Algorithm follows the QR Code Model 2 spec (ISO/IEC 18004).

export type QrEcc = "L" | "M" | "Q" | "H";

const ECC_ORDINAL: Record<QrEcc, number> = { L: 0, M: 1, Q: 2, H: 3 };
const ECC_FORMAT_BITS: Record<QrEcc, number> = { L: 1, M: 0, Q: 3, H: 2 };

// [ecc ordinal][version] — index 0 is unused padding.
const ECC_CODEWORDS_PER_BLOCK: number[][] = [
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
];
const NUM_ERROR_CORRECTION_BLOCKS: number[][] = [
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
];

function getNumRawDataModules(ver: number): number {
  let result = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const numAlign = Math.floor(ver / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (ver >= 7) result -= 36;
  }
  return result;
}

function getNumDataCodewords(ver: number, ecc: QrEcc): number {
  const e = ECC_ORDINAL[ecc];
  return (
    Math.floor(getNumRawDataModules(ver) / 8) - ECC_CODEWORDS_PER_BLOCK[e][ver] * NUM_ERROR_CORRECTION_BLOCKS[e][ver]
  );
}

// ---- Reed–Solomon over GF(256) ----
function rsMultiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function rsComputeDivisor(degree: number): number[] {
  const result: number[] = new Array(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = rsMultiply(result[j], root);
      if (j + 1 < result.length) result[j] ^= result[j + 1];
    }
    root = rsMultiply(root, 0x02);
  }
  return result;
}

function rsComputeRemainder(data: number[], divisor: number[]): number[] {
  const result: number[] = divisor.map(() => 0);
  for (const b of data) {
    const factor = b ^ (result.shift() as number);
    result.push(0);
    divisor.forEach((coef, i) => (result[i] ^= rsMultiply(coef, factor)));
  }
  return result;
}

function utf8Bytes(text: string): number[] {
  return Array.from(new TextEncoder().encode(text));
}

function addEccAndInterleave(data: number[], ver: number, ecc: QrEcc): number[] {
  const e = ECC_ORDINAL[ecc];
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[e][ver];
  const blockEccLen = ECC_CODEWORDS_PER_BLOCK[e][ver];
  const rawCodewords = Math.floor(getNumRawDataModules(ver) / 8);
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLen = Math.floor(rawCodewords / numBlocks);

  const blocks: number[][] = [];
  const divisor = rsComputeDivisor(blockEccLen);
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const dat = data.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1));
    k += dat.length;
    const eccBytes = rsComputeRemainder(dat, divisor);
    if (i < numShortBlocks) dat.push(0);
    blocks.push(dat.concat(eccBytes));
  }
  const result: number[] = [];
  for (let i = 0; i < blocks[0].length; i++) {
    blocks.forEach((block, j) => {
      if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) result.push(block[i]);
    });
  }
  return result;
}

// ---- matrix drawing ----
class Matrix {
  size: number;
  modules: boolean[][];
  isFunction: boolean[][];

  constructor(public version: number, public ecc: QrEcc, dataCodewords: number[]) {
    this.size = version * 4 + 17;
    this.modules = Array.from({ length: this.size }, () => new Array(this.size).fill(false));
    this.isFunction = Array.from({ length: this.size }, () => new Array(this.size).fill(false));

    this.drawFunctionPatterns();
    const all = addEccAndInterleave(dataCodewords, version, ecc);
    this.drawCodewords(all);

    let bestMask = 0;
    let minPenalty = Infinity;
    for (let m = 0; m < 8; m++) {
      this.applyMask(m);
      this.drawFormatBits(m);
      const p = this.penalty();
      if (p < minPenalty) {
        bestMask = m;
        minPenalty = p;
      }
      this.applyMask(m); // undo (XOR)
    }
    this.applyMask(bestMask);
    this.drawFormatBits(bestMask);
    this.isFunction = [];
  }

  private setFn(x: number, y: number, dark: boolean) {
    this.modules[y][x] = dark;
    this.isFunction[y][x] = true;
  }

  private drawFunctionPatterns() {
    for (let i = 0; i < this.size; i++) {
      this.setFn(6, i, i % 2 === 0);
      this.setFn(i, 6, i % 2 === 0);
    }
    this.drawFinder(3, 3);
    this.drawFinder(this.size - 4, 3);
    this.drawFinder(3, this.size - 4);

    const pos = this.alignmentPositions();
    const n = pos.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (!((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0))) {
          this.drawAlignment(pos[i], pos[j]);
        }
      }
    }
    this.drawFormatBits(0);
    this.drawVersion();
  }

  private drawFinder(cx: number, cy: number) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < this.size && y >= 0 && y < this.size) this.setFn(x, y, dist !== 2 && dist !== 4);
      }
    }
  }

  private drawAlignment(cx: number, cy: number) {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) this.setFn(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  }

  private alignmentPositions(): number[] {
    if (this.version === 1) return [];
    const numAlign = Math.floor(this.version / 7) + 2;
    const step =
      this.version === 32 ? 26 : Math.ceil((this.version * 4 + 4) / (numAlign * 2 - 2)) * 2;
    const result = [6];
    for (let pos = this.size - 7; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
    return result;
  }

  private drawFormatBits(mask: number) {
    const data = (ECC_FORMAT_BITS[this.ecc] << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;
    const bit = (i: number) => ((bits >>> i) & 1) !== 0;

    for (let i = 0; i <= 5; i++) this.setFn(8, i, bit(i));
    this.setFn(8, 7, bit(6));
    this.setFn(8, 8, bit(7));
    this.setFn(7, 8, bit(8));
    for (let i = 9; i < 15; i++) this.setFn(14 - i, 8, bit(i));

    for (let i = 0; i < 8; i++) this.setFn(this.size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) this.setFn(8, this.size - 15 + i, bit(i));
    this.setFn(8, this.size - 8, true);
  }

  private drawVersion() {
    if (this.version < 7) return;
    let rem = this.version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (this.version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const color = ((bits >>> i) & 1) !== 0;
      const a = this.size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      this.setFn(a, b, color);
      this.setFn(b, a, color);
    }
  }

  private drawCodewords(data: number[]) {
    let i = 0;
    for (let right = this.size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < this.size; vert++) {
        for (let j = 0; j < 2; j++) {
          const x = right - j;
          const upward = ((right + 1) & 2) === 0;
          const y = upward ? this.size - 1 - vert : vert;
          if (!this.isFunction[y][x] && i < data.length * 8) {
            this.modules[y][x] = ((data[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0;
            i++;
          }
        }
      }
    }
  }

  private applyMask(mask: number) {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        let invert: boolean;
        switch (mask) {
          case 0: invert = (x + y) % 2 === 0; break;
          case 1: invert = y % 2 === 0; break;
          case 2: invert = x % 3 === 0; break;
          case 3: invert = (x + y) % 3 === 0; break;
          case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
          case 5: invert = ((x * y) % 2) + ((x * y) % 3) === 0; break;
          case 6: invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; break;
          default: invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
        }
        if (!this.isFunction[y][x] && invert) this.modules[y][x] = !this.modules[y][x];
      }
    }
  }

  private penalty(): number {
    let result = 0;
    const size = this.size;
    const m = this.modules;

    const finderPenaltyCount = (h: number[]) => {
      const n = h[1];
      const core = n > 0 && h[2] === n && h[3] === n * 3 && h[4] === n && h[5] === n;
      return (core && h[0] >= n * 4 && h[6] >= n ? 1 : 0) + (core && h[6] >= n * 4 && h[0] >= n ? 1 : 0);
    };
    const finderTerminate = (color: boolean, run: number, h: number[]) => {
      if (color) {
        this.pushHistory(run, h);
        run = 0;
      }
      run += size;
      this.pushHistory(run, h);
      return finderPenaltyCount(h);
    };

    for (let y = 0; y < size; y++) {
      let runColor = false;
      let runX = 0;
      const h = [0, 0, 0, 0, 0, 0, 0];
      for (let x = 0; x < size; x++) {
        if (m[y][x] === runColor) {
          runX++;
          if (runX === 5) result += 3;
          else if (runX > 5) result++;
        } else {
          this.addHistory(runX, h);
          if (!runColor) result += finderPenaltyCount(h) * 40;
          runColor = m[y][x];
          runX = 1;
        }
      }
      result += finderTerminate(runColor, runX, h) * 40;
    }
    for (let x = 0; x < size; x++) {
      let runColor = false;
      let runY = 0;
      const h = [0, 0, 0, 0, 0, 0, 0];
      for (let y = 0; y < size; y++) {
        if (m[y][x] === runColor) {
          runY++;
          if (runY === 5) result += 3;
          else if (runY > 5) result++;
        } else {
          this.addHistory(runY, h);
          if (!runColor) result += finderPenaltyCount(h) * 40;
          runColor = m[y][x];
          runY = 1;
        }
      }
      result += finderTerminate(runColor, runY, h) * 40;
    }
    for (let y = 0; y < size - 1; y++) {
      for (let x = 0; x < size - 1; x++) {
        const c = m[y][x];
        if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) result += 3;
      }
    }
    let dark = 0;
    for (const row of m) for (const c of row) if (c) dark++;
    const total = size * size;
    const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
    result += k * 10;
    return result;
  }

  // run-length history helpers (border of light modules counts as the first run)
  private addHistory(run: number, h: number[]) {
    if (h[0] === 0) run += this.size;
    h.pop();
    h.unshift(run);
  }
  private pushHistory(run: number, h: number[]) {
    this.addHistory(run, h);
  }
}

/** Encodes `text` (UTF-8) and returns the module grid (true = dark). */
export function qrModules(text: string, ecc: QrEcc = "M"): boolean[][] {
  const bytes = utf8Bytes(text);
  let version = 0;
  let usedEcc: QrEcc = ecc;
  for (let v = 1; v <= 40; v++) {
    const capBits = getNumDataCodewords(v, ecc) * 8;
    const ccBits = v <= 9 ? 8 : 16;
    if (4 + ccBits + bytes.length * 8 <= capBits) {
      version = v;
      break;
    }
  }
  if (!version) throw new Error("QR: text too long");

  // Raise the error-correction level for free when the data still fits.
  for (const candidate of ["H", "Q", "M"] as QrEcc[]) {
    if (ECC_ORDINAL[candidate] <= ECC_ORDINAL[usedEcc]) continue;
    const ccBits = version <= 9 ? 8 : 16;
    if (4 + ccBits + bytes.length * 8 <= getNumDataCodewords(version, candidate) * 8) {
      usedEcc = candidate;
      break;
    }
  }

  const bits: number[] = [];
  const push = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
  };
  push(0x4, 4); // byte mode
  push(bytes.length, version <= 9 ? 8 : 16);
  for (const b of bytes) push(b, 8);

  const capBits = getNumDataCodewords(version, usedEcc) * 8;
  push(0, Math.min(4, capBits - bits.length));
  push(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capBits; pad ^= 0xec ^ 0x11) push(pad, 8);

  const data: number[] = new Array(bits.length / 8).fill(0);
  bits.forEach((b, i) => (data[i >>> 3] |= b << (7 - (i & 7))));
  return new Matrix(version, usedEcc, data).modules;
}

/** A self-contained SVG string (quiet zone included). */
export function qrSvg(
  text: string,
  opts: { size?: number; dark?: string; light?: string; margin?: number } = {}
): string {
  const modules = qrModules(text);
  const n = modules.length;
  const margin = opts.margin ?? 2;
  const dim = n + margin * 2;
  const size = opts.size ?? 220;
  const dark = opts.dark ?? "#000";
  const light = opts.light ?? "#fff";
  let path = "";
  for (let y = 0; y < n; y++) {
    let x = 0;
    while (x < n) {
      if (!modules[y][x]) {
        x++;
        continue;
      }
      let w = 1;
      while (x + w < n && modules[y][x + w]) w++;
      path += `M${x + margin} ${y + margin}h${w}v1h-${w}z`;
      x += w;
    }
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" width="${size}" height="${size}" shape-rendering="crispEdges" role="img">` +
    `<rect width="100%" height="100%" fill="${light}"/><path d="${path}" fill="${dark}"/></svg>`
  );
}
