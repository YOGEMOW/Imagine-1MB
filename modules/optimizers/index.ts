import { spawn } from 'child-process-promise'
import log from 'electron-log'
import * as bins from './bin'
import { IOptimizeOptions } from '../common/types'

const createEnv = () => ({
  ...process.env,
  LD_LIBRARY_PATH: bins.basePath,
} as NodeJS.ProcessEnv)

export type IOptimizeMethod = (
  input: string,
  output: string,
  options: IOptimizeOptions,
) => Promise<{ stdout: string; stderr: string }>

export const mozjpeg: IOptimizeMethod = (
  input,
  output,
  options,
) => {
  const { quality = 70 } = options

  const spawnArgs = [
    '-quality',
    quality.toString(),
    '-outfile',
    output,
    input,
  ]

  log.info('spawn', bins.mozjpeg, spawnArgs)

  return spawn(bins.mozjpeg, spawnArgs, {
    capture: ['stdout', 'stderr'],
    env: createEnv(),
  }).catch((e) => {
    throw new Error(`${e.message}\n${e.stderr}`)
  })
}

export const pngquant: IOptimizeMethod = (
  input,
  output,
  options,
) => {
  const { color = 256, quality } = options
  const spawnArgs = quality != null
    ? [
      '--quality',
      `${Math.round(quality)}-${Math.round(quality)}`,
      input,
      '-o',
      output,
    ]
    : [
      color.toString(),
      input,
      '-o',
      output,
    ]

  log.info('spawn', bins.pngquant, spawnArgs)

  return spawn(bins.pngquant, spawnArgs, {
    capture: ['stdout', 'stderr'],
    env: createEnv(),
  }).catch((e) => {
    throw new Error(`${e.message}\n${e.stderr}`)
  })
}

export const cwebp: IOptimizeMethod = (
  input,
  output,
  options,
) => {
  const {
    quality = 80,
    lossless = false,
    preserveMetadata = true,
  } = options

  const spawnArgs = [
    '-q',
    quality.toString(),
    ...(lossless ? ['-lossless'] : []),
    '-metadata',
    preserveMetadata ? 'all' : 'none',
    input,
    '-o',
    output,
  ]

  log.info('spawn', bins.cwebp, spawnArgs)

  return spawn(bins.cwebp, spawnArgs, {
    capture: ['stdout', 'stderr'],
    env: createEnv(),
  }).catch((e) => {
    throw new Error(`${e.message}\n${e.stderr}`)
  })
}

export const optipng: IOptimizeMethod = (
  input,
  output,
) => {
  const spawnArgs = [
    '-o7',
    '-quiet',
    '-out',
    output,
    input,
  ]

  log.info('spawn', bins.optipng, spawnArgs)

  return spawn(bins.optipng, spawnArgs, {
    capture: ['stdout', 'stderr'],
    env: createEnv(),
  }).catch((e) => {
    throw new Error(`${e.message}\n${e.stderr}`)
  })
}

export const jpegtran: IOptimizeMethod = (
  input,
  output,
  options,
) => {
  const { preserveMetadata = true } = options
  const spawnArgs = [
    '-copy',
    preserveMetadata ? 'all' : 'none',
    '-optimize',
    '-progressive',
    '-outfile',
    output,
    input,
  ]

  log.info('spawn', bins.jpegtran, spawnArgs)

  return spawn(bins.jpegtran, spawnArgs, {
    capture: ['stdout', 'stderr'],
    env: createEnv(),
  }).catch((e) => {
    throw new Error(`${e.message}\n${e.stderr}`)
  })
}
