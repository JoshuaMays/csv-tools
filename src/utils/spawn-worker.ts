export type WorkerResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

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
        reject(new Error(event.data.error))
      }
    }
    worker.onerror = (event) => {
      worker.terminate()
      reject(new Error(event.message))
    }
    worker.postMessage(message)
  })
}
