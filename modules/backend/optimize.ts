import * as os from 'os'
import * as fs from 'fs-extra'
import log from 'electron-log'
import { IImageFile, IOptimizeOptions, SupportedExt } from '../common/types'
import * as fu from '../common/file-utils'
import {
  pngquant, mozjpeg, cwebp, optipng, jpegtran, IOptimizeMethod,
} from '../optimizers'
import { getFileUrl } from '../common/file-utils'
import convert from './convert'
import { applyMetadata } from './metadata'

const platform = os.platform()

const factory: { [ext: string]: IOptimizeMethod } = {
  [SupportedExt.png]: pngquant,
  [SupportedExt.jpg]: mozjpeg,
  [SupportedExt.webp]: cwebp,
}

const getOptimizeMethod = (
  exportExt: SupportedExt,
  lossless: boolean,
): IOptimizeMethod => {
  if (!lossless) return factory[exportExt]

  switch (exportExt) {
    case SupportedExt.png:
      return optipng
    case SupportedExt.jpg:
      return jpegtran
    case SupportedExt.webp:
      return cwebp
    default:
      return factory[exportExt]
  }
}

const qualityCandidates = (
  currentQuality: number | undefined,
  defaultQuality: number,
): number[] => {
  const start = currentQuality == null ? defaultQuality : currentQuality
  const candidates: number[] = []

  for (let quality = 100; quality >= 10; quality -= 10) {
    if (quality < start) candidates.push(quality)
  }

  return candidates
}

const colorCandidates = (currentColor: number | undefined): number[] => {
  const start = currentColor == null ? 128 : Math.max(2, Math.min(256, Math.round(currentColor)))
  const candidates: number[] = []

  for (let color = Math.floor(start / 2); color >= 2; color = Math.floor(color / 2)) {
    candidates.push(color)
  }

  return candidates
}

const fitToSize = async (
  sourcePath: string,
  destPath: string,
  exportExt: SupportedExt,
  options: IOptimizeOptions,
  maxSize: number,
) => {
  const optimizeMethod = factory[exportExt]
  const useQuality = exportExt === SupportedExt.png
    ? options.quality != null
    : true
  let defaultQuality = 70

  if (exportExt === SupportedExt.png) {
    defaultQuality = 30
  } else if (exportExt === SupportedExt.webp) {
    defaultQuality = 80
  }

  const candidates = useQuality
    ? qualityCandidates(options.quality, defaultQuality)
    : colorCandidates(options.color)

  let bestSize = await fu.getSize(destPath)
  let bestPath = destPath
  let index = 0

  for (const candidate of candidates) {
    index += 1
    const attemptPath = `${destPath}.${index}.tmp`
    const attemptOptions = useQuality
      ? { ...options, quality: candidate }
      : { ...options, color: candidate }

    try {
      await optimizeMethod(sourcePath, attemptPath, attemptOptions)
      const attemptSize = await fu.getSize(attemptPath)
      log.info('optimize', `target-size attempt [${exportExt}] param=${candidate}, size=${attemptSize}`)

      if (attemptSize <= maxSize) {
        if (bestPath !== destPath) {
          await fs.remove(bestPath).catch(() => undefined)
        }
        if (attemptPath !== destPath) {
          await fs.move(attemptPath, destPath, { overwrite: true })
        }
        return attemptSize
      }

      if (attemptSize < bestSize) {
        if (bestPath !== destPath) {
          await fs.remove(bestPath).catch(() => undefined)
        }
        bestPath = attemptPath
        bestSize = attemptSize
      } else {
        await fs.remove(attemptPath).catch(() => undefined)
      }
    } catch (err) {
      log.warn('optimize', `target-size attempt failed [${exportExt}] param=${candidate}`, err)
      await fs.remove(attemptPath).catch(() => undefined)
    }
  }

  if (bestPath !== destPath) {
    await fs.move(bestPath, destPath, { overwrite: true })
  }

  return bestSize
}

const optimize = async (
  image: IImageFile,
  options: IOptimizeOptions,
): Promise<IImageFile> => {
  let sourcePath = fu.getFilePath(image)
  const originalPath = sourcePath
  const optimizedId = fu.md5(image.id + JSON.stringify(options))
  const exportExt = options.exportExt || image.ext
  const lossless = !!options.lossless
  const maxSize = options.maxSize && options.maxSize > 0
    ? options.maxSize
    : null

  const dest: Partial<IImageFile> = {
    id: optimizedId,
    ext: exportExt,
    originalName: image.originalName,
  }

  const destPath = fu.getFilePath(dest)

  log.info('optimize', `convert [${image.ext}]${sourcePath} to [${exportExt}]${destPath}`)

  dest.url = getFileUrl(destPath)

  if (exportExt === image.ext && maxSize != null && image.size <= maxSize) {
    log.info('optimize', `skip compression: [${image.ext}]${sourcePath} is already <= ${maxSize} bytes`)
    await fs.copyFile(sourcePath, destPath)
    await applyMetadata(
      exportExt === image.ext ? originalPath : sourcePath,
      destPath,
      exportExt,
      options.preserveMetadata !== false,
    )
    dest.size = await fu.getSize(destPath)
    return dest as IImageFile
  }

  try {
    dest.size = await fu.getSize(destPath)
  } catch (err) {
    log.info('optimize', 'miss cache (desk)')

    /**
     * pngquant on linux / windows does not support JPEG to PNG.
     * in this case, we should use JIMP converting JPEG to PNG firstly.
     */
    if (platform !== 'darwin' && image.ext === 'jpg' && exportExt === 'png') {
      log.info(
        'optimize',
        'should use JIMP for converting JPEG to PNG',
      )

      const intermediate = sourcePath.replace(/\.jpg$/, '.1.png')

      try {
        await fs.access(intermediate)
      } catch (error) {
        log.info('optimize', 'miss cache (JIMP)')
        await convert(sourcePath, intermediate)
      }

      sourcePath = intermediate
    }

    const optimizeMethod = getOptimizeMethod(exportExt, lossless)

    if (!optimizeMethod) {
      throw new Error(`Unsupported file format: ${image.ext}`)
    }

    await optimizeMethod(sourcePath, destPath, options)

    dest.size = await fu.getSize(destPath)

    if (maxSize != null && dest.size > maxSize && !lossless) {
      log.info('optimize', `target-size: ${dest.size} > ${maxSize}, start degrading [${exportExt}]`)
      dest.size = await fitToSize(sourcePath, destPath, exportExt, options, maxSize)
    }

    await applyMetadata(
      exportExt === image.ext ? originalPath : sourcePath,
      destPath,
      exportExt,
      options.preserveMetadata !== false,
    )
    dest.size = await fu.getSize(destPath)
  }

  return dest as IImageFile
}

export default optimize
