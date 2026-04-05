import Papa from 'papaparse'

import type { ParsedCsv } from '@/types/validator'
import { spawnWorker } from '@/utils/spawn-worker'

export function parseCsvString(content: string): ParsedCsv {
  const result = Papa.parse<Record<string, string | undefined>>(content, {
    header: true,
    skipEmptyLines: true,
  })
  if (result.errors.length > 0) {
    throw new Error(`CSV parse error: ${result.errors[0].message}`)
  }
  return { headers: result.meta.fields ?? [], rows: result.data }
}

export function parseCsvFile(file: File): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string | undefined>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parse error: ${results.errors[0].message}`))
          return
        }
        const headers = results.meta.fields ?? []
        resolve({ headers, rows: results.data })
      },
      error(err) {
        reject(new Error(err.message))
      },
    })
  })
}

export function parseCsvFileInWorker(file: File): Promise<ParsedCsv> {
  return spawnWorker<{ file: File }, ParsedCsv>(new Worker('/csv-worker.js'), {
    file,
  })
}
