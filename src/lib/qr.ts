// Owner: Karen. A small QR code encoder (byte mode, error correction M, versions 1 to 6: up to 106 characters, plenty for a URL),
// so the live vote can draw a real code as SVG without adding a package. Follows ISO/IEC 18004 (structure after Nayuki's public
// reference implementation). Returns the module grid; the screen draws it.

const EC_PER_BLOCK = [0, 10, 16, 26, 18, 24, 16]; // level M, by version
const BLOCKS = [0, 1, 1, 1, 2, 2, 4];
const TOTAL = [0, 26, 44, 70, 100, 134, 172]; // all codewords, by version
const ALIGN = [[], [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34]];

function gfMul(x: number, y: number) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}
function rsDivisor(degree: number) {
  const r: number[] = Array(degree - 1).fill(0).concat([1]);
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < r.length; j++) {
      r[j] = gfMul(r[j], root);
      if (j + 1 < r.length) r[j] ^= r[j + 1];
    }
    root = gfMul(root, 0x02);
  }
  return r;
}
function rsRemainder(data: number[], div: number[]) {
  const r = div.map(() => 0);
  for (const b of data) {
    const f = b ^ (r.shift() as number);
    r.push(0);
    div.forEach((c, i) => { r[i] ^= gfMul(c, f); });
  }
  return r;
}

/** The QR modules for `text` (true = dark), or null if it is too long for version 6. */
export function qrMatrix(text: string): boolean[][] | null {
  const bytes = Array.from(new TextEncoder().encode(text));
  let ver = 0;
  for (let v = 1; v <= 6; v++) {
    const cap = (TOTAL[v] - EC_PER_BLOCK[v] * BLOCKS[v]) * 8;
    if (4 + 8 + bytes.length * 8 <= cap) { ver = v; break; }
  }
  if (!ver) return null;
  const dataLen = TOTAL[ver] - EC_PER_BLOCK[ver] * BLOCKS[ver];

  // data bits: byte mode, 8-bit length, the bytes, terminator, padding
  const bits: number[] = [];
  const put = (val: number, n: number) => { for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
  put(0b0100, 4); put(bytes.length, 8); bytes.forEach((b) => put(b, 8));
  put(0, Math.min(4, dataLen * 8 - bits.length));
  while (bits.length % 8) bits.push(0);
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(""), 2));
  for (let p = 0xec; data.length < dataLen; p ^= 0xec ^ 0x11) data.push(p);

  // error correction per block, then interleave
  const nb = BLOCKS[ver], ecLen = EC_PER_BLOCK[ver], raw = TOTAL[ver];
  const nShort = nb - (raw % nb), shortLen = Math.floor(raw / nb);
  const div = rsDivisor(ecLen);
  const blocks: number[][] = [];
  for (let i = 0, k = 0; i < nb; i++) {
    const dat = data.slice(k, k + shortLen - ecLen + (i < nShort ? 0 : 1));
    k += dat.length;
    const ecc = rsRemainder(dat, div);
    if (i < nShort) dat.push(0);
    blocks.push(dat.concat(ecc));
  }
  const words: number[] = [];
  for (let i = 0; i < blocks[0].length; i++) blocks.forEach((b, j) => { if (i !== shortLen - ecLen || j >= nShort) words.push(b[i]); });

  const size = ver * 4 + 17;
  const mod: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const fn: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const set = (x: number, y: number, dark: boolean) => { mod[y][x] = dark; fn[y][x] = true; };

  for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]]) {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const x = cx + dx, y = cy + dy, d = Math.max(Math.abs(dx), Math.abs(dy));
      if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, d !== 2 && d !== 4);
    }
  }
  const al = ALIGN[ver];
  for (let i = 0; i < al.length; i++) for (let j = 0; j < al.length; j++) {
    if ((i === 0 && j === 0) || (i === 0 && j === al.length - 1) || (i === al.length - 1 && j === 0)) continue;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(al[i] + dx, al[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }
  const drawFormat = (mask: number) => {
    const d = (0 << 3) | mask; // level M = 00
    let rem = d;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const b = ((d << 10) | rem) ^ 0x5412;
    const bit = (i: number) => ((b >>> i) & 1) === 1;
    for (let i = 0; i <= 5; i++) set(8, i, bit(i));
    set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
    for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
    set(8, size - 8, true);
  };
  drawFormat(0); // reserves the format areas

  // codewords in the zigzag
  let n = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) for (let j = 0; j < 2; j++) {
      const x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - vert : vert;
      if (!fn[y][x] && n < words.length * 8) { mod[y][x] = ((words[n >>> 3] >>> (7 - (n & 7))) & 1) === 1; n++; }
    }
  }

  const masked = (m: number, x: number, y: number) => [
    (x + y) % 2 === 0, y % 2 === 0, x % 3 === 0, (x + y) % 3 === 0,
    (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, ((x * y) % 2) + ((x * y) % 3) === 0,
    (((x * y) % 2) + ((x * y) % 3)) % 2 === 0, (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
  ][m];
  const applyMask = (m: number) => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!fn[y][x] && masked(m, x, y)) mod[y][x] = !mod[y][x]; };

  let best = 0, bestScore = Infinity;
  for (let m = 0; m < 8; m++) {
    applyMask(m); drawFormat(m);
    const s = penalty(mod);
    if (s < bestScore) { bestScore = s; best = m; }
    applyMask(m); // undo (xor)
  }
  applyMask(best); drawFormat(best);
  return mod;
}

function penalty(m: boolean[][]) {
  const size = m.length;
  let score = 0, dark = 0;
  const lines = (get: (a: number, b: number) => boolean) => {
    for (let a = 0; a < size; a++) {
      let run = 1;
      for (let b = 1; b <= size; b++) {
        if (b < size && get(a, b) === get(a, b - 1)) { run++; continue; }
        if (run >= 5) score += 3 + (run - 5);
        run = 1;
      }
      // finder-like 1:1:3:1:1 with four light modules on one side
      for (let b = 0; b + 10 < size; b++) {
        const s = Array.from({ length: 11 }, (_, k) => get(a, b + k));
        const pat = [true, false, true, true, true, false, true];
        const left = s.slice(0, 4).every((v) => !v) && pat.every((v, k) => s[4 + k] === v);
        const right = pat.every((v, k) => s[k] === v) && s.slice(7).every((v) => !v);
        if (left || right) score += 40;
      }
    }
  };
  lines((y, x) => m[y][x]);
  lines((x, y) => m[y][x]);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (m[y][x]) dark++;
    if (x < size - 1 && y < size - 1 && m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) score += 3;
  }
  const total = size * size;
  score += 10 * Math.max(0, Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1);
  return score;
}
