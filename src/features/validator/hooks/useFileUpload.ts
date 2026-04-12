import {
  dropTargetForExternal,
  monitorForExternal,
} from '@atlaskit/pragmatic-drag-and-drop/external/adapter'
import {
  containsFiles,
  getFiles,
} from '@atlaskit/pragmatic-drag-and-drop/external/file'
import { preventUnhandled } from '@atlaskit/pragmatic-drag-and-drop/prevent-unhandled'
import { useEffect, useRef, useState } from 'react'

import { m } from '@/paraglide/messages'
import { WorkerError } from '@/utils/spawn-worker'
import type { ParsedCsv } from '@/types/validator'

type UseFileUploadProps = {
  onParsed: (result: ParsedCsv) => void
  onError: (message: string) => void
}

type UseFileUploadReturn = {
  dragging: boolean
  fileName: string | null
  dropZoneRef: React.RefObject<HTMLDivElement | null>
  inputRef: React.RefObject<HTMLInputElement | null>
  onBrowse: () => void
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function useFileUpload({
  onParsed,
  onError,
}: UseFileUploadProps): UseFileUploadReturn {
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep callback refs current so the mount-time useEffect never goes stale.
  const onParsedRef = useRef(onParsed)
  const onErrorRef = useRef(onError)
  onParsedRef.current = onParsed
  onErrorRef.current = onError

  async function handleFile(file: File) {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      onErrorRef.current(m.validator_error_wrong_type())
      return
    }
    setFileName(file.name)
    try {
      const { parseCsvFileInWorker } = await import('@/utils/csv')
      const result = await parseCsvFileInWorker(file)
      if (result.headers.length === 0) {
        onErrorRef.current(m.validator_error_no_headers())
        return
      }
      onParsedRef.current(result)
    } catch (err) {
      onErrorRef.current(
        err instanceof WorkerError
          ? m.validator_error_parse_failed()
          : err instanceof Error
            ? err.message
            : m.validator_error_parse_failed(),
      )
    }
  }

  useEffect(() => {
    const el = dropZoneRef.current
    if (!el) return

    const cleanupDropTarget = dropTargetForExternal({
      element: el,
      canDrop: containsFiles,
      onDragEnter: () => setDragging(true),
      onDragLeave: () => setDragging(false),
      onDrop: ({ source }) => {
        setDragging(false)
        const files = getFiles({ source })
        if (files.length > 1) {
          onErrorRef.current(m.validator_error_multiple_files())
          return
        }
        if (files[0]) handleFile(files[0])
      },
    })

    const cleanupMonitor = monitorForExternal({
      canMonitor: containsFiles,
      onDragStart: () => preventUnhandled.start(),
      onDrop: () => preventUnhandled.stop(),
    })

    return () => {
      cleanupDropTarget()
      cleanupMonitor()
    }
  }, [])

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function onBrowse() {
    inputRef.current?.click()
  }

  return { dragging, fileName, dropZoneRef, inputRef, onBrowse, onInputChange }
}
