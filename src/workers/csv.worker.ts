/// <reference lib="webworker" />

import Papa from 'papaparse'

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
          error: `CSV parse error: ${results.errors[0].message}`,
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
    error(err) {
      const response: WorkerResponse<ParsedCsv> = {
        ok: false,
        error: err.message,
      }
      self.postMessage(response)
    },
  })
}
