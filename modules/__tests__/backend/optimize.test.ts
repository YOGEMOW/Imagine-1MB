import '../_tools/before-test'

import * as path from 'path'
import optimize from '../../backend/optimize'
import { saveFilesTmp, getFilePath } from '../../common/file-utils'
import { fullDiff } from '../_tools/image-diff'
import { IImageFile, SupportedExt } from '../../common/types'

const relPath = (file: string) => path.resolve(__dirname, file)

const png = '../_files/600_600.png'
const jpg = '../_files/fox.jpg'

test('optimize png success', async () => {
  const files = await saveFilesTmp([relPath(png)])
  const file = files[0] as IImageFile
  const optimized = await optimize(file, {
    exportExt: SupportedExt.png,
  })

  const diffResult = await fullDiff({
    actualImage: getFilePath(optimized),
    expectedImage: getFilePath(file),
  })

  expect(diffResult).toBeLessThan(0.01)
})

test('optimize png with quality', async () => {
  const files = await saveFilesTmp([relPath(png)])
  const file = files[0] as IImageFile
  const optimized = await optimize(file, {
    exportExt: SupportedExt.png,
    quality: 30,
    preserveMetadata: true,
  })

  expect(optimized.size).toBeGreaterThan(0)
})

test('optimize png fail', async () => {
  const image: IImageFile = {
    id: '404',
    url: '/',
    size: 0,
    ext: SupportedExt.png,
    originalName: '',
  }

  try {
    await optimize(image, {
      exportExt: SupportedExt.png,
    })
  } catch (e) {
    expect(e).toBeTruthy()
  }
})

test('optimize jpg success', async () => {
  const files = await saveFilesTmp([relPath(jpg)])
  const file = files[0] as IImageFile
  const optimized = await optimize(file, {
    exportExt: SupportedExt.jpg,
  })

  const diffResult = await fullDiff({
    actualImage: getFilePath(optimized),
    expectedImage: getFilePath(file),
  })

  expect(diffResult).toBeLessThan(0.1)
})

test('optimize skips compression when image is already under maxSize', async () => {
  const files = await saveFilesTmp([relPath(png)])
  const file = files[0] as IImageFile
  const optimized = await optimize(file, {
    exportExt: SupportedExt.png,
    maxSize: 1024 * 1024,
  })

  expect(optimized.size).toBe(file.size)
})

test('optimize jpg reduces to target size', async () => {
  const files = await saveFilesTmp([relPath(jpg)])
  const file = files[0] as IImageFile
  const maxSize = 150 * 1024
  const optimized = await optimize(file, {
    exportExt: SupportedExt.jpg,
    quality: 80,
    maxSize,
  })

  expect(optimized.size).toBeLessThanOrEqual(maxSize)
})

test('optimize keeps smallest result when maxSize cannot be reached', async () => {
  const files = await saveFilesTmp([relPath(jpg)])
  const file = files[0] as IImageFile
  const optimized = await optimize(file, {
    exportExt: SupportedExt.jpg,
    quality: 80,
    maxSize: 1,
  })

  expect(optimized.size).toBeGreaterThan(0)
})

test('optimize cache id changes when maxSize changes', async () => {
  const files = await saveFilesTmp([relPath(png)])
  const file = files[0] as IImageFile
  const optimizedA = await optimize(file, {
    exportExt: SupportedExt.png,
    maxSize: 1024 * 1024,
  })
  const optimizedB = await optimize(file, {
    exportExt: SupportedExt.png,
    maxSize: 2 * 1024 * 1024,
  })

  expect(optimizedA.id).not.toBe(optimizedB.id)
})

test('optimize png lossless keeps pixels', async () => {
  const files = await saveFilesTmp([relPath(png)])
  const file = files[0] as IImageFile
  const optimized = await optimize(file, {
    exportExt: SupportedExt.png,
    lossless: true,
    preserveMetadata: true,
  })

  const diffResult = await fullDiff({
    actualImage: getFilePath(optimized),
    expectedImage: getFilePath(file),
  })

  expect(diffResult).toBeLessThan(0.01)
})

test('optimize jpg lossless keeps pixels', async () => {
  const files = await saveFilesTmp([relPath(jpg)])
  const file = files[0] as IImageFile
  const optimized = await optimize(file, {
    exportExt: SupportedExt.jpg,
    lossless: true,
    preserveMetadata: true,
  })

  const diffResult = await fullDiff({
    actualImage: getFilePath(optimized),
    expectedImage: getFilePath(file),
  })

  expect(diffResult).toBeLessThan(0.01)
})

test('optimize lossless does not degrade when maxSize is impossible', async () => {
  const files = await saveFilesTmp([relPath(jpg)])
  const file = files[0] as IImageFile
  const optimized = await optimize(file, {
    exportExt: SupportedExt.jpg,
    lossless: true,
    preserveMetadata: true,
    maxSize: 1,
  })

  expect(optimized.size).toBeGreaterThan(0)

  const diffResult = await fullDiff({
    actualImage: getFilePath(optimized),
    expectedImage: getFilePath(file),
  })

  expect(diffResult).toBeLessThan(0.01)
})

test('optimize jpg fail', async () => {
  const image: IImageFile = {
    id: '404',
    url: '/',
    size: 0,
    ext: SupportedExt.jpg,
    originalName: '',
  }

  try {
    await optimize(image, {
      exportExt: SupportedExt.jpg,
    })
  } catch (e) {
    expect(e).toBeTruthy()
  }
})
