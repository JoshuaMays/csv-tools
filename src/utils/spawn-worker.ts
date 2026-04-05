export const WORKER_ERROR_CODES = {
  CSV_PARSE_FAILED: 'CSV_PARSE_FAILED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  WORKER_CRASHED: 'WORKER_CRASHED',
  DESERIALIZE_FAILED: 'DESERIALIZE_FAILED',
} as const

export type WorkerErrorCode =
  (typeof WORKER_ERROR_CODES)[keyof typeof WORKER_ERROR_CODES]

export class WorkerError extends Error {
  readonly code: WorkerErrorCode
  constructor(code: WorkerErrorCode, message?: string) {
    super(message ?? code)
    this.name = 'WorkerError'
    this.code = code
  }
}

export type WorkerResponse<T> =
  | { ok: true; data: T }
  | { ok: false; errorCode: WorkerErrorCode }

export function spawnWorker<TReq, TData>(
  url: URL,
  message: TReq,
): Promise<TData> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(url, { type: 'module' })
    worker.onmessage = (event: MessageEvent<WorkerResponse<TData>>) => {
      worker.terminate()
      if (event.data.ok) {
        resolve(event.data.data)
      } else {
        reject(new WorkerError(event.data.errorCode))
      }
    }
    worker.onerror = (event) => {
      worker.terminate()
      reject(new WorkerError(WORKER_ERROR_CODES.WORKER_CRASHED, event.message))
    }
    worker.onmessageerror = () => {
      worker.terminate()
      reject(new WorkerError(WORKER_ERROR_CODES.DESERIALIZE_FAILED))
    }
    worker.postMessage(message)
  })
}
