import Papa from 'papaparse'
import type { ParsedCsv } from '@/types/validator'

export function parseCsvString(content: string): ParsedCsv {
  const result = Papa.parse<Record<string, string | undefined>>(content, {
    header: true,
    skipEmptyLines: true,
  })
  return { headers: result.meta.fields ?? [], rows: result.data }
}

export function parseCsvFile(file: File): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string | undefined>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const headers = results.meta.fields ?? []
        resolve({ headers, rows: results.data })
      },
      error(err) {
        reject(new Error(err.message))
      },
    })
  })
}
