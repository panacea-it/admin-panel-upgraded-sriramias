import { useCallback, useRef } from 'react'
import { Film, Upload } from 'lucide-react'
import { cn } from '../../utils/cn'
import { VIDEO_ACCEPT } from '../../data/liveClassesData'

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return ''
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function VideoUploadSection({ form, setForm }) {
  const inputRef = useRef(null)

  const applyFile = useCallback(
    (file) => {
      if (!file) return
      const ext = file.name.split('.').pop()?.toLowerCase()
      const allowed = ['mp4', 'mov', 'mkv', 'avi']
      if (!allowed.includes(ext)) return

      const objectUrl = URL.createObjectURL(file)
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        const duration = formatDuration(video.duration)
        setForm((f) => ({
          ...f,
          videoFileName: file.name,
          videoDuration: duration,
          videoObjectUrl: objectUrl,
          thumbnailUrl: objectUrl,
        }))
        URL.revokeObjectURL(video.src)
      }
      video.src = objectUrl
    },
    [setForm],
  )

  const onDrop = (e) => {
    e.preventDefault()
    applyFile(e.dataTransfer.files?.[0])
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className={cn(
          'flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#55ace7]/40 bg-gradient-to-br from-[#eef2fc] to-[#e8f4fc] p-6 text-center transition hover:border-[#55ace7] hover:bg-[#e8f4fc]',
        )}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <Upload className="mb-3 h-10 w-10 text-[#55ace7]" strokeWidth={1.8} />
        <p className="text-sm font-semibold text-[#246392]">Drag & drop video here</p>
        <p className="mt-1 text-xs text-[#686868]">MP4, MOV, MKV, AVI</p>
        <input
          ref={inputRef}
          type="file"
          accept={VIDEO_ACCEPT}
          className="sr-only"
          onChange={(e) => applyFile(e.target.files?.[0])}
        />
      </div>

      {form.videoObjectUrl && (
        <div className="overflow-hidden rounded-2xl bg-[#1a3a5c] shadow-lg ring-1 ring-[#55ace7]/20">
          <video
            src={form.videoObjectUrl}
            controls
            className="aspect-video w-full"
            poster={form.thumbnailUrl}
          />
          <div className="flex items-center justify-between gap-2 bg-[#246392] px-4 py-2 text-xs text-white/90">
            <span className="flex items-center gap-2 truncate">
              <Film className="h-3.5 w-3.5 shrink-0" />
              {form.videoFileName}
            </span>
            {form.videoDuration && <span className="shrink-0 font-mono">{form.videoDuration}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
