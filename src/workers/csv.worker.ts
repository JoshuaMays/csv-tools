/// <reference lib="webworker" />

import Papa from 'papaparse'

import { WORKER_ERROR_CODES } from '@/utils/spawn-worker'
import type { WorkerResponse } from '@/utils/spawn-worker'
import type { ParsedCsv } from '@/types/validator'

type CsvWorkerRequest = { file: File }

self.onmessage = (event: MessageEvent<CsvWorkerRequest>) => {
  const { file } = event.data

  Papa.parse<Record<string, string | undefined>>(file, {
    header: true,
    skipEmptyLines: true,
    complete(results) {
      if (results.errors.length > 0) {
        const response: WorkerResponse<ParsedCsv> = {
          ok: false,
          errorCode: WORKER_ERROR_CODES.CSV_PARSE_FAILED,
        }
        self.postMessage(response)
        return
      }
      const data: ParsedCsv = {
        headers: results.meta.fields ?? [],
        rows: results.data,
      }
      const response: WorkerResponse<ParsedCsv> = { ok: true, data }
      self.postMessage(response)
    },
    error() {
      const response: WorkerResponse<ParsedCsv> = {
        ok: false,
        errorCode: WORKER_ERROR_CODES.CSV_PARSE_FAILED,
      }
      self.postMessage(response)
    },
  })
}
