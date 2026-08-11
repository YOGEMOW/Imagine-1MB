/* eslint-disable no-bitwise */
import '../_tools/before-test'

import * as path from 'path'
import * as fs from 'fs-extra'
import { applyMetadata } from '../../backend/metadata'
import { tmpdir } from '../../common/file-utils'
import { SupportedExt } from '../../common/types'

const relPath = (file: string) => path.resolve(__dirname, file)

const pngBuffer = () => fs.readFile(relPath('../_files/600_600.png'))
const jpgBuffer = () => fs.readFile(relPath('../_files/fox.jpg'))

const crcTable = (() => {
  const table = new Uint32Array(256)

  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    }
    table[n] = c >>> 0
  }

  return table
})()

const crc32 = (buffer: Buffer) => {
  let crc = 0xFFFFFFFF

  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xFF] ^ (crc >>> 8)
  }

  return (crc ^ 0xFFFFFFFF) >>> 0
}

const makePngChunk = (type: string, data: Buffer) => {
  const typeBuffer = Buffer.from(type, 'ascii')
  const lengthBuffer = Buffer.alloc(4)
  lengthBuffer.writeUInt32BE(data.length)

  const crcBuffer = Buffer.alloc(4)
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])))

  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer])
}

const insertPngChunkBeforeIend = (png: Buffer, chunk: Buffer) => {
  const iendTypeIndex = png.lastIndexOf(Buffer.from('IEND'))
  const iendStart = iendTypeIndex - 4

  return Buffer.concat([
    png.subarray(0, iendStart),
    chunk,
    png.subarray(iendStart),
  ])
}

const makeJpegSegment = (marker: number, data: Buffer) => {
  const lengthBuffer = Buffer.alloc(2)
  lengthBuffer.writeUInt16BE(data.length + 2)

  return Buffer.concat([
    Buffer.from([0xFF, marker]),
    lengthBuffer,
    data,
  ])
}

const insertJpegSegmentAfterSof = (jpeg: Buffer, segment: Buffer) => Buffer.concat([
  jpeg.subarray(0, 2),
  segment,
  jpeg.subarray(2),
])

test('png metadata is preserved and stripped', async () => {
  const sourcePath = path.resolve(tmpdir, `metadata-${Date.now()}-source.png`)
  const outputPath = path.resolve(tmpdir, `metadata-${Date.now()}-output.png`)
  const png = insertPngChunkBeforeIend(
    await pngBuffer(),
    makePngChunk('tEXt', Buffer.from('Comment\0Imagine-1MB metadata test')),
  )

  await fs.writeFile(sourcePath, png)
  await fs.copyFile(sourcePath, outputPath)

  await applyMetadata(sourcePath, outputPath, SupportedExt.png, true)
  expect((await fs.readFile(outputPath)).includes(Buffer.from('tEXt'))).toBe(true)

  await applyMetadata(sourcePath, outputPath, SupportedExt.png, false)
  expect((await fs.readFile(outputPath)).includes(Buffer.from('tEXt'))).toBe(false)
})

test('jpeg metadata is preserved and stripped', async () => {
  const sourcePath = path.resolve(tmpdir, `metadata-${Date.now()}-source.jpg`)
  const outputPath = path.resolve(tmpdir, `metadata-${Date.now()}-output.jpg`)
  const jpeg = insertJpegSegmentAfterSof(
    await jpgBuffer(),
    makeJpegSegment(0xE1, Buffer.from('Exif\0\0Imagine-1MB metadata test')),
  )

  await fs.writeFile(sourcePath, jpeg)
  await fs.copyFile(sourcePath, outputPath)

  await applyMetadata(sourcePath, outputPath, SupportedExt.jpg, true)
  expect((await fs.readFile(outputPath)).includes(Buffer.from('Imagine-1MB metadata test'))).toBe(true)

  await applyMetadata(sourcePath, outputPath, SupportedExt.jpg, false)
  expect((await fs.readFile(outputPath)).includes(Buffer.from('Imagine-1MB metadata test'))).toBe(false)
})
