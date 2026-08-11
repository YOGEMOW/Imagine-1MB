import * as fs from 'fs-extra'
import log from 'electron-log'
import { SupportedExt } from '../common/types'

const PNG_METADATA_TYPES = new Set([
  'tEXt',
  'zTXt',
  'iTXt',
  'eXIf',
  'iCCP',
  'pHYs',
  'gAMA',
  'cHRM',
  'sRGB',
  'tIME',
  'bKGD',
  'hIST',
  'sPLT',
])

const JPEG_METADATA_MARKERS = new Set([
  0xE1, // APP1: EXIF / XMP
  0xE2, // APP2: ICC
  0xED, // APP13: Photoshop IRB
  0xEE, // APP14: Adobe
  0xFE, // COM
])

interface IPngChunk {
  type: string
  start: number
  end: number
  raw: Buffer
}

interface IJpegSegment {
  marker: number
  start: number
  raw: Buffer
}

const parsePngChunks = (buffer: Buffer): IPngChunk[] => {
  const chunks: IPngChunk[] = []
  let offset = 8

  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(offset)
    const type = buffer.toString('ascii', offset + 4, offset + 8)
    const end = offset + 12 + length

    if (end > buffer.length) break

    chunks.push({
      type,
      start: offset,
      end,
      raw: buffer.subarray(offset, end),
    })

    offset = end
    if (type === 'IEND') break
  }

  return chunks
}

const parseJpegSegments = (buffer: Buffer): IJpegSegment[] => {
  const segments: IJpegSegment[] = []
  let offset = 2

  while (offset + 1 < buffer.length) {
    if (buffer[offset] !== 0xFF) {
      offset += 1
      continue
    }

    const marker = buffer[offset + 1]

    if (marker === 0xFF || marker === 0x00) {
      offset += 1
      continue
    }

    if (marker === 0xD8 || marker === 0xD9) {
      offset += 2
      continue
    }

    if (marker >= 0xD0 && marker <= 0xD7) {
      offset += 2
      continue
    }

    if (offset + 4 > buffer.length) break

    const length = buffer.readUInt16BE(offset + 2)
    const end = offset + 2 + length

    if (end > buffer.length) break

    segments.push({
      marker,
      start: offset,
      raw: buffer.subarray(offset, end),
    })

    offset = end

    // Entropy-coded data starts after SOS, stop parsing there.
    if (marker === 0xDA) break
  }

  return segments
}

const applyPngMetadata = (
  source: Buffer,
  output: Buffer,
  preserve: boolean,
): Buffer => {
  const sourceChunks = parsePngChunks(source)
  const outputChunks = parsePngChunks(output)
  const metadataChunks = sourceChunks.filter(
    (chunk) => PNG_METADATA_TYPES.has(chunk.type),
  )
  const keptChunks = outputChunks.filter(
    (chunk) => !PNG_METADATA_TYPES.has(chunk.type),
  )
  const iendIndex = keptChunks.findIndex((chunk) => chunk.type === 'IEND')
  const iend = iendIndex >= 0 ? keptChunks.splice(iendIndex, 1)[0] : null
  const chunksToInsert = preserve ? metadataChunks : []

  return Buffer.concat([
    output.subarray(0, 8),
    ...keptChunks.map((chunk) => chunk.raw),
    ...chunksToInsert.map((chunk) => chunk.raw),
    ...(iend ? [iend.raw] : []),
  ])
}

const applyJpegMetadata = (
  source: Buffer,
  output: Buffer,
  preserve: boolean,
): Buffer => {
  const sourceSegments = parseJpegSegments(source)
  const outputSegments = parseJpegSegments(output)
  const metadataSegments = sourceSegments.filter(
    (segment) => JPEG_METADATA_MARKERS.has(segment.marker),
  )
  const keptBuffers: Buffer[] = []
  let restStart = output.length

  for (const segment of outputSegments) {
    if (segment.marker === 0xDA) {
      restStart = segment.start
      break
    }

    if (!JPEG_METADATA_MARKERS.has(segment.marker)) {
      keptBuffers.push(segment.raw)
    }
  }

  return Buffer.concat([
    output.subarray(0, 2),
    ...(preserve ? metadataSegments.map((segment) => segment.raw) : []),
    ...keptBuffers,
    output.subarray(restStart),
  ])
}

export async function applyMetadata(
  sourcePath: string,
  outputPath: string,
  ext: SupportedExt,
  preserve: boolean,
) {
  if (ext === SupportedExt.webp) return

  try {
    const [source, output] = await Promise.all([
      fs.readFile(sourcePath),
      fs.readFile(outputPath),
    ])

    const result = ext === SupportedExt.png
      ? applyPngMetadata(source, output, preserve)
      : applyJpegMetadata(source, output, preserve)

    await fs.writeFile(outputPath, result)
  } catch (err) {
    log.warn('metadata', `failed to ${preserve ? 'preserve' : 'strip'} metadata`, err)
  }
}
