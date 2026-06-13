/**
 * Lightweight ZIP builder using Node.js built-in zlib.
 * Produces a valid ZIP 2.0 file (DEFLATE compressed entries).
 * No native addons — pure Node.js ESM compatible.
 *
 * Usage:
 *   const zip = new ZipBuilder();
 *   zip.addFile('readme.txt', Buffer.from('hello'));
 *   const buf = zip.build();
 *   fs.writeFileSync('out.zip', buf);
 */
import { deflateRawSync } from 'zlib';
import { crc32 } from './crc32.js';

interface ZipEntry {
  name: string;
  data: Buffer;
  compressed: Buffer;
  crc: number;
  offset: number;
  modTime: number;
  modDate: number;
}

export class ZipBuilder {
  private entries: ZipEntry[] = [];

  addFile(name: string, data: Buffer | string): void {
    const buf = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
    const compressed = deflateRawSync(buf, { level: 6 });
    const checksum = crc32(buf);

    // DOS time/date for now
    const now = new Date();
    const modTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
    const modDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

    this.entries.push({
      name,
      data: buf,
      compressed,
      crc: checksum,
      offset: 0, // filled in during build
      modTime,
      modDate,
    });
  }

  build(): Buffer {
    const parts: Buffer[] = [];
    let offset = 0;

    // Local file headers + data
    for (const entry of this.entries) {
      entry.offset = offset;
      const nameBytes = Buffer.from(entry.name, 'utf8');
      const useCompressed = entry.compressed.length < entry.data.length;
      const fileData = useCompressed ? entry.compressed : entry.data;
      const method = useCompressed ? 8 : 0; // 8=DEFLATE, 0=STORE

      const localHeader = Buffer.alloc(30 + nameBytes.length);
      localHeader.writeUInt32LE(0x04034b50, 0);  // signature
      localHeader.writeUInt16LE(20, 4);           // version needed
      localHeader.writeUInt16LE(0x0800, 6);       // flags (UTF-8)
      localHeader.writeUInt16LE(method, 8);       // compression method
      localHeader.writeUInt16LE(entry.modTime, 10);
      localHeader.writeUInt16LE(entry.modDate, 12);
      localHeader.writeUInt32LE(entry.crc >>> 0, 14);
      localHeader.writeUInt32LE(fileData.length, 18);
      localHeader.writeUInt32LE(entry.data.length, 22);
      localHeader.writeUInt16LE(nameBytes.length, 26);
      localHeader.writeUInt16LE(0, 28);           // extra field length
      nameBytes.copy(localHeader, 30);

      parts.push(localHeader);
      parts.push(fileData);
      offset += localHeader.length + fileData.length;
    }

    const centralDirOffset = offset;

    // Central directory headers
    for (const entry of this.entries) {
      const nameBytes = Buffer.from(entry.name, 'utf8');
      const useCompressed = entry.compressed.length < entry.data.length;
      const fileData = useCompressed ? entry.compressed : entry.data;
      const method = useCompressed ? 8 : 0;

      const cdHeader = Buffer.alloc(46 + nameBytes.length);
      cdHeader.writeUInt32LE(0x02014b50, 0);   // signature
      cdHeader.writeUInt16LE(20, 4);            // version made by
      cdHeader.writeUInt16LE(20, 6);            // version needed
      cdHeader.writeUInt16LE(0x0800, 8);        // flags (UTF-8)
      cdHeader.writeUInt16LE(method, 10);
      cdHeader.writeUInt16LE(entry.modTime, 12);
      cdHeader.writeUInt16LE(entry.modDate, 14);
      cdHeader.writeUInt32LE(entry.crc >>> 0, 16);
      cdHeader.writeUInt32LE(fileData.length, 20);
      cdHeader.writeUInt32LE(entry.data.length, 24);
      cdHeader.writeUInt16LE(nameBytes.length, 28);
      cdHeader.writeUInt16LE(0, 30);            // extra field length
      cdHeader.writeUInt16LE(0, 32);            // comment length
      cdHeader.writeUInt16LE(0, 34);            // disk number start
      cdHeader.writeUInt16LE(0, 36);            // internal attributes
      cdHeader.writeUInt32LE(0, 38);            // external attributes
      cdHeader.writeUInt32LE(entry.offset, 42); // local header offset
      nameBytes.copy(cdHeader, 46);

      parts.push(cdHeader);
      offset += cdHeader.length;
    }

    const centralDirSize = offset - centralDirOffset;

    // End of central directory record
    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0);          // signature
    eocd.writeUInt16LE(0, 4);                    // disk number
    eocd.writeUInt16LE(0, 6);                    // disk with central dir
    eocd.writeUInt16LE(this.entries.length, 8);  // entries on disk
    eocd.writeUInt16LE(this.entries.length, 10); // total entries
    eocd.writeUInt32LE(centralDirSize, 12);
    eocd.writeUInt32LE(centralDirOffset, 16);
    eocd.writeUInt16LE(0, 20);                   // comment length
    parts.push(eocd);

    return Buffer.concat(parts);
  }
}
