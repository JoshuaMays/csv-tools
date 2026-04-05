import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  spawnWorker,
  WorkerError,
  WORKER_ERROR_CODES,
} from '@/utils/spawn-worker'
import type { WorkerResponse } from '@/utils/spawn-worker'

let lastWorker: MockWorker | null = null

class MockWorker {
  terminated = false
  lastMessage: unknown = undefined
  onmessage: ((e: MessageEvent) => void) | null = null
  onerror: ((e: ErrorEvent) => void) | null = null
  onmessageerror: (() => void) | null = null

  constructor(_url: URL) {
    lastWorker = this
  }

  postMessage(data: unknown) {
    this.lastMessage = data
  }

  terminate() {
    this.terminated = true
  }
}

describe('spawnWorker', () => {
  beforeEach(() => {
    vi.stubGlobal('Worker', MockWorker)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    lastWorker = null
  })

  it('resolves with data when the worker responds ok', async () => {
    const promise = spawnWorker<{ x: number }, string>(
      new URL('test.js', import.meta.url),
      { x: 1 },
    )

    lastWorker!.onmessage!(
      new MessageEvent('message', {
        data: { ok: true, data: 'hello' } satisfies WorkerResponse<string>,
      }),
    )

    await expect(promise).resolves.toBe('hello')
  })

  it('rejects when the worker responds with ok: false', async () => {
    const promise = spawnWorker<{ x: number }, string>(
      new URL('test.js', import.meta.url),
      { x: 1 },
    )

    lastWorker!.onmessage!(
      new MessageEvent('message', {
        data: {
          ok: false,
          errorCode: WORKER_ERROR_CODES.CSV_PARSE_FAILED,
        } satisfies WorkerResponse<string>,
      }),
    )

    const err = await promise.catch((e: unknown) => e)
    expect(err).toBeInstanceOf(WorkerError)
    expect((err as WorkerError).code).toBe(WORKER_ERROR_CODES.CSV_PARSE_FAILED)
  })

  it('rejects when the worker fires an error event', async () => {
    const promise = spawnWorker<{ x: number }, string>(
      new URL('test.js', import.meta.url),
      { x: 1 },
    )

    lastWorker!.onerror!(new ErrorEvent('error', { message: 'worker crashed' }))

    const err = await promise.catch((e: unknown) => e)
    expect(err).toBeInstanceOf(WorkerError)
    expect((err as WorkerError).code).toBe(WORKER_ERROR_CODES.WORKER_CRASHED)
    expect((err as WorkerError).message).toBe('worker crashed')
  })

  it('terminates the worker after a successful response', async () => {
    const promise = spawnWorker<{ x: number }, string>(
      new URL('test.js', import.meta.url),
      { x: 1 },
    )

    lastWorker!.onmessage!(
      new MessageEvent('message', {
        data: { ok: true, data: 'result' } satisfies WorkerResponse<string>,
      }),
    )

    await promise
    expect(lastWorker!.terminated).toBe(true)
  })

  it('terminates the worker after a failed response', async () => {
    const promise = spawnWorker<{ x: number }, string>(
      new URL('test.js', import.meta.url),
      { x: 1 },
    )

    lastWorker!.onmessage!(
      new MessageEvent('message', {
        data: {
          ok: false,
          errorCode: WORKER_ERROR_CODES.CSV_PARSE_FAILED,
        } satisfies WorkerResponse<string>,
      }),
    )

    await expect(promise).rejects.toThrow()
    expect(lastWorker!.terminated).toBe(true)
  })

  it('terminates the worker after an error event', async () => {
    const promise = spawnWorker<{ x: number }, string>(
      new URL('test.js', import.meta.url),
      { x: 1 },
    )

    lastWorker!.onerror!(new ErrorEvent('error', { message: 'crash' }))

    await expect(promise).rejects.toThrow()
    expect(lastWorker!.terminated).toBe(true)
  })

  it('rejects and terminates when a messageerror event fires', async () => {
    const promise = spawnWorker<{ x: number }, string>(
      new URL('test.js', import.meta.url),
      { x: 1 },
    )

    lastWorker!.onmessageerror!()

    const err = await promise.catch((e: unknown) => e)
    expect(err).toBeInstanceOf(WorkerError)
    expect((err as WorkerError).code).toBe(
      WORKER_ERROR_CODES.DESERIALIZE_FAILED,
    )
    expect(lastWorker!.terminated).toBe(true)
  })

  it('posts the message payload to the worker', async () => {
    const promise = spawnWorker<{ x: number }, string>(
      new URL('test.js', import.meta.url),
      { x: 42 },
    )

    expect(lastWorker!.lastMessage).toEqual({ x: 42 })

    lastWorker!.onmessage!(
      new MessageEvent('message', {
        data: { ok: true, data: 'done' } satisfies WorkerResponse<string>,
      }),
    )

    await promise
  })
})
