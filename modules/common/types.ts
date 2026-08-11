import type { UpdateInfo } from 'electron-updater'

// eslint-disable-next-line @typescript-eslint/ban-types
export type Empty = {}

export enum SupportedExt {
  png = 'png',
  jpg = 'jpg',
  webp = 'webp',
}

export const SupportedExtAlias: Record<string, SupportedExt> = {
  jpeg: SupportedExt.jpg,
}

export const DEFAULT_MAX_SIZE = 1024 * 1024

export const enum TaskStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
  FAIL = 'FAIL',
}

export const enum IpcChannel {
  FILE_SELECT = 'FILE_SELECT',
  FILE_SELECTED = 'FILE_SELECTED',
  FILE_ADD = 'FILE_ADD',
  OPTIMIZE = 'OPTIMIZE',
  SAVE = 'SAVE',
  SAVED = 'SAVED',
  SYNC = 'SYNC',
  APP_UPDATE = 'APP_UPDATE',
  READY = 'READY',
  RESPONSE = 'RESPONSE',
}

export const enum SaveType {
  OVER = 'OVER',
  NEW_NAME = 'NEW_NAME',
  NEW_DIR = 'NEW_DIR',
  SAVE_AS = 'SAVE_AS',
}

export interface IElectronResponse<T> {
  session: string
  error: string
  result: T
}

export interface IImageFile {
  id: string
  url: string
  size: number
  ext: SupportedExt
  originalName: string
}

export interface IOptimizeOptions {
  /**
   * Target maximum file size in bytes. Defaults to 1MB.
   */
  maxSize?: number

  /**
   * Use true lossless compression when the target format supports it.
   */
  lossless?: boolean

  /**
   * Keep metadata (EXIF/ICC/XMP etc.) in the optimized output.
   */
  preserveMetadata?: boolean

  /**
   * 2~256, for PNG
   */
  color?: number

  /**
   * 10~100, for JPEG
   */
  quality?: number

  exportExt?: SupportedExt
}

export interface ITaskItem {
  id: string
  image: IImageFile
  options: IOptimizeOptions
  optimized?: IImageFile
  status: TaskStatus
}

export interface IOptimizeRequest {
  image: IImageFile
  options: IOptimizeOptions
  exportExt?: SupportedExt
}

export interface IBackendState {
  taskCount: number
  aloneMode: boolean
}

export type IUpdateInfo = UpdateInfo

export interface IDefaultOptions {
  jpg: IOptimizeOptions
  png: IOptimizeOptions
  webp: IOptimizeOptions
}

export interface IGlobals {
  activeId?: string
  updateInfo?: UpdateInfo
  optionsVisible: boolean
  compressionMode: 'quality' | 'size'
  defaultOptions: IDefaultOptions
}

export interface IState {
  tasks: ITaskItem[]
  globals: IGlobals
}

export type AsyncCall<Payload, Response> = (payload: Payload) => Promise<Response>

export interface RendererIpcPayload {
  [IpcChannel.READY]: null;
  [IpcChannel.FILE_ADD]: string[];
  [IpcChannel.FILE_SELECT]: null;
  [IpcChannel.SAVE]: {
    images: IImageFile[];
    type: SaveType;
  };
  [IpcChannel.SYNC]: IBackendState;
}

export interface MainIpcPayload {
  [IpcChannel.SAVE]: SaveType;
  [IpcChannel.SAVED]: SaveType;
  [IpcChannel.FILE_SELECTED]: IImageFile[];
  [IpcChannel.APP_UPDATE]: UpdateInfo;
}
