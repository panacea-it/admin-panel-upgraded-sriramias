import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Highlighter,
  Underline,
  Strikethrough,
  Pencil,
  StickyNote,
  MessageSquare,
  UploadCloud,
} from 'lucide-react'
import { toast } from '@/utils/toast'
import PageBanner from '../../components/figma/PageBanner'
import PdfViewer from '../../components/evaluation-management/PdfViewer'
import EvaluationStatusBadge from '../../components/evaluation-management/EvaluationStatusBadge'
import EvaluationHistoryModal from '../../components/evaluation-management/EvaluationHistoryModal'
import {
  attachAnswerSheet,
  fetchEvaluationById,
  fetchEvaluationLookups,
  publishEvaluation,
  saveAnnotations,
  saveEvaluationDraft,
} from '../../api/evaluationManagementAPI'

const AUTOSAVE_MS = 20000

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function computeRubricTotal(rubric = []) {
  return rubric.reduce((sum, r) => sum + (Number(r.score) || 0), 0)
}

function normalizeRubric(rubric) {
  const base = Array.isArray(rubric) ? rubric : []
  if (base.length) return base
  return [
    { key: 'content', label: 'Content Quality', max: 10, score: 0, feedback: '' },
    { key: 'structure', label: 'Structure', max: 5, score: 0, feedback: '' },
    { key: 'accuracy', label: 'Accuracy', max: 10, score: 0, feedback: '' },
    { key: 'presentation', label: 'Presentation', max: 5, score: 0, feedback: '' },
  ]
}

function toolLabel(tool) {
  if (tool === 'highlight') return 'Highlight'
  if (tool === 'underline') return 'Underline'
  if (tool === 'strike') return 'Strike-through'
  if (tool === 'draw') return 'Draw'
  if (tool === 'sticky') return 'Sticky note'
  if (tool === 'margin') return 'Margin comment'
  return 'Select tool'
}

export default function EvaluationWorkspacePage() {
  const { evaluationId } = useParams()
  const navigate = useNavigate()
  const canvasWrapRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [lookups, setLookups] = useState({ students: [], tests: [], evaluators: [] })
  const [row, setRow] = useState(null)

  const [pageCount, setPageCount] = useState(0)
  const [page, setPage] = useState(1)
  const [scale, setScale] = useState(1.1)

  const [historyOpen, setHistoryOpen] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)

  const [activeTool, setActiveTool] = useState('highlight')
  const [drag, setDrag] = useState(null)
  const [drawPath, setDrawPath] = useState(null)

  const resolved = useMemo(() => {
    if (!row) return null
    const students = lookups.students || []
    const tests = lookups.tests || []
    const evaluators = lookups.evaluators || []
    const s = students.find((x) => String(x.id) === String(row.studentId))
    const t = tests.find((x) => String(x.id) === String(row.testId))
    const e = evaluators.find((x) => String(x.id) === String(row.evaluatorId))
    return {
      student: s,
      test: t,
      evaluator: e,
      rubric: normalizeRubric(row.rubric),
    }
  }, [row, lookups])

  const currentPageAnnotations = useMemo(() => {
    const list = Array.isArray(row?.annotations) ? row.annotations : []
    return list.filter((a) => Number(a.page) === Number(page))
  }, [row?.annotations, page])

  const load = async () => {
    setLoading(true)
    try {
      const [lkp, data] = await Promise.all([fetchEvaluationLookups(), fetchEvaluationById(evaluationId)])
      setLookups(lkp || { students: [], tests: [], evaluators: [] })
      setRow({
        ...data,
        rubric: normalizeRubric(data?.rubric),
        annotations: Array.isArray(data?.annotations) ? data.annotations : [],
      })
      setDirty(false)
    } catch (err) {
      toast.error(err?.message || 'Failed to load evaluation')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluationId])

  useEffect(() => {
    if (!dirty) return undefined
    if (row?.locked) return undefined
    const t = setInterval(() => {
      saveDraft({ silent: true })
    }, AUTOSAVE_MS)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, row?.locked, row?.id])

  const saveDraft = async ({ silent } = {}) => {
    if (!row || row.locked) return
    setSaving(true)
    try {
      const patch = {
        marks: row.marks,
        remarks: row.remarks,
        rubric: row.rubric,
        highlightNotes: row.highlightNotes,
        internalComments: row.internalComments,
        status: row.status === 'Pending' ? 'In Review' : row.status,
      }
      const saved = await saveEvaluationDraft(row.id, patch, { actor: 'Mentor' })
      setRow((prev) => ({ ...prev, ...saved }))
      setDirty(false)
      if (!silent) toast.success('Draft saved')
    } catch (err) {
      if (!silent) toast.error(err?.message || 'Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  const publish = async () => {
    if (!row) return
    setSaving(true)
    try {
      const saved = await publishEvaluation(row.id, { actor: 'Mentor' })
      setRow((prev) => ({ ...prev, ...saved }))
      setDirty(false)
      toast.success('Published')
    } catch (err) {
      toast.error(err?.message || 'Failed to publish')
    } finally {
      setSaving(false)
    }
  }

  const uploadPdf = async (file) => {
    if (!row || !file) return
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.onload = () => resolve(String(reader.result || ''))
        reader.readAsDataURL(file)
      })
      const updated = await attachAnswerSheet(
        row.id,
        { fileName: file.name, dataUrl, pages: null },
        { actor: 'Mentor' },
      )
      setRow((prev) => ({ ...prev, ...updated }))
      setDirty(true)
      toast.success('PDF attached')
    } catch (err) {
      toast.error(err?.message || 'Failed to attach PDF')
    }
  }

  const setRubricScore = (idx, score) => {
    setRow((prev) => {
      const rubric = normalizeRubric(prev?.rubric).map((r, i) =>
        i === idx ? { ...r, score: clamp(Number(score) || 0, 0, Number(r.max) || 0) } : r,
      )
      return { ...prev, rubric, marks: Math.round(computeRubricTotal(rubric) * 10) / 10 }
    })
    setDirty(true)
  }

  const setRubricFeedback = (idx, feedback) => {
    setRow((prev) => {
      const rubric = normalizeRubric(prev?.rubric).map((r, i) => (i === idx ? { ...r, feedback } : r))
      return { ...prev, rubric }
    })
    setDirty(true)
  }

  const getRelativePoint = (e) => {
    const el = canvasWrapRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / Math.max(rect.width, 1)
    const y = (e.clientY - rect.top) / Math.max(rect.height, 1)
    return { x: clamp(x, 0, 1), y: clamp(y, 0, 1) }
  }

  const beginAnnotate = (e) => {
    if (!row || row.locked) return
    if (activeTool === 'sticky' || activeTool === 'margin') return
    const p = getRelativePoint(e)
    if (!p) return
    if (activeTool === 'draw') {
      setDrawPath({ tool: 'draw', page, points: [p], color: '#246392' })
      return
    }
    setDrag({ start: p, end: p })
  }

  const moveAnnotate = (e) => {
    if (!row || row.locked) return
    if (drawPath) {
      const p = getRelativePoint(e)
      if (!p) return
      setDrawPath((prev) => (prev ? { ...prev, points: [...prev.points, p] } : prev))
      return
    }
    if (!drag) return
    const p = getRelativePoint(e)
    if (!p) return
    setDrag((d) => ({ ...d, end: p }))
  }

  const endAnnotate = async () => {
    if (!row || row.locked) return
    if (drawPath) {
      const ann = { id: `ANN-${Math.floor(1000 + Math.random() * 9000)}`, tool: 'draw', page, points: drawPath.points, color: drawPath.color }
      setDrawPath(null)
      const next = [...(Array.isArray(row.annotations) ? row.annotations : []), ann]
      setRow((prev) => ({ ...prev, annotations: next }))
      setDirty(true)
      await saveAnnotations(row.id, next, { actor: 'Mentor' })
      return
    }
    if (!drag) return
    const { start, end } = drag
    setDrag(null)
    const x1 = Math.min(start.x, end.x)
    const y1 = Math.min(start.y, end.y)
    const x2 = Math.max(start.x, end.x)
    const y2 = Math.max(start.y, end.y)
    if (Math.abs(x2 - x1) < 0.01 && Math.abs(y2 - y1) < 0.01) return
    const ann = {
      id: `ANN-${Math.floor(1000 + Math.random() * 9000)}`,
      tool: activeTool,
      page,
      rect: { x: x1, y: y1, w: x2 - x1, h: y2 - y1 },
      color: activeTool === 'highlight' ? 'rgba(245,158,11,0.35)' : 'rgba(36,99,146,0.95)',
    }
    const next = [...(Array.isArray(row.annotations) ? row.annotations : []), ann]
    setRow((prev) => ({ ...prev, annotations: next }))
    setDirty(true)
    await saveAnnotations(row.id, next, { actor: 'Mentor' })
  }

  const addNote = async (e) => {
    if (!row || row.locked) return
    if (activeTool !== 'sticky' && activeTool !== 'margin') return
    const p = getRelativePoint(e)
    if (!p) return
    const text = window.prompt(activeTool === 'sticky' ? 'Sticky note' : 'Margin comment')
    if (!text) return
    const ann = {
      id: `ANN-${Math.floor(1000 + Math.random() * 9000)}`,
      tool: activeTool,
      page,
      point: p,
      text: String(text).slice(0, 500),
      color: activeTool === 'sticky' ? '#f59e0b' : '#246392',
    }
    const next = [...(Array.isArray(row.annotations) ? row.annotations : []), ann]
    setRow((prev) => ({ ...prev, annotations: next }))
    setDirty(true)
    await saveAnnotations(row.id, next, { actor: 'Mentor' })
  }

  const file = row?.answerSheet?.dataUrl ? { dataUrl: row.answerSheet.dataUrl } : row?.answerSheet?.url ? { url: row.answerSheet.url } : null

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageBanner
        icon={ArrowLeft}
        title={`Evaluation Workspace — ${evaluationId}`}
        className="from-[#55ace7] via-[#8b98bb] to-[#b8887a]"
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/test-management/evaluation-management')}
            className="inline-flex h-10 min-h-[38px] items-center justify-center gap-2 rounded-lg bg-white/90 px-4 text-sm font-semibold text-[#1a3a5c] shadow-[0_4px_10px_rgba(0,0,0,0.12)] transition hover:bg-white sm:text-base"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
            Back
          </button>
          {row?.status ? <EvaluationStatusBadge status={row.status} /> : null}
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="inline-flex h-10 min-h-[38px] items-center justify-center gap-2 rounded-lg bg-white/90 px-4 text-sm font-semibold text-[#1a3a5c] shadow-[0_4px_10px_rgba(0,0,0,0.12)] transition hover:bg-white sm:text-base"
          >
            <MessageSquare className="h-4 w-4" strokeWidth={2.2} />
            History
          </button>
        </div>
      </PageBanner>

      {loading || !row ? (
        <div className="rounded-xl bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold text-slate-600">Loading evaluation…</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="rounded-xl bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.08)] sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#1a3a5c]">
                    {resolved?.student?.name || 'Student'} — {resolved?.test?.name || 'Test'}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-500">
                    Evaluator: {resolved?.evaluator?.name || '—'} · {row?.answerSheet?.fileName || 'No PDF attached'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex h-10 min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1a3a5c] px-4 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition hover:bg-[#152f4a] sm:text-base">
                    <UploadCloud className="h-4 w-4" strokeWidth={2.2} />
                    Upload PDF
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => uploadPdf(e.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-[#eef2fc] p-2">
                <button
                  type="button"
                  onClick={() => setScale((s) => clamp(Math.round((s - 0.1) * 10) / 10, 0.7, 2.2))}
                  className="inline-flex h-9 min-h-[36px] items-center justify-center gap-2 rounded-lg bg-white px-3 text-sm font-bold text-[#1a3a5c] shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  <ZoomOut className="h-4 w-4" />
                  Zoom
                </button>
                <button
                  type="button"
                  onClick={() => setScale((s) => clamp(Math.round((s + 0.1) * 10) / 10, 0.7, 2.2))}
                  className="inline-flex h-9 min-h-[36px] items-center justify-center gap-2 rounded-lg bg-white px-3 text-sm font-bold text-[#1a3a5c] shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  <ZoomIn className="h-4 w-4" />
                  Zoom
                </button>

                <button
                  type="button"
                  onClick={() => setPage((p) => clamp(p - 1, 1, Math.max(pageCount || 1, 1)))}
                  className="inline-flex h-9 min-h-[36px] items-center justify-center gap-2 rounded-lg bg-white px-3 text-sm font-bold text-[#1a3a5c] shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>
                <div className="flex h-9 min-h-[36px] items-center rounded-lg bg-white px-3 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
                  Page {page} / {pageCount || '—'}
                </div>
                <button
                  type="button"
                  onClick={() => setPage((p) => clamp(p + 1, 1, Math.max(pageCount || 1, 1)))}
                  className="inline-flex h-9 min-h-[36px] items-center justify-center gap-2 rounded-lg bg-white px-3 text-sm font-bold text-[#1a3a5c] shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>

                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 rounded-lg bg-white p-1 shadow-sm ring-1 ring-slate-200">
                    {[
                      { id: 'highlight', label: 'Highlight', icon: Highlighter },
                      { id: 'underline', label: 'Underline', icon: Underline },
                      { id: 'strike', label: 'Strike', icon: Strikethrough },
                      { id: 'draw', label: 'Draw', icon: Pencil },
                      { id: 'sticky', label: 'Sticky', icon: StickyNote },
                    ].map((t) => {
                      const Icon = t.icon
                      const active = activeTool === t.id
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setActiveTool(t.id)}
                          title={t.label}
                          className={`inline-flex h-8 w-9 items-center justify-center rounded-md transition ${
                            active ? 'bg-[#246392] text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2.2} />
                        </button>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => setActiveTool('margin')}
                      title="Margin comment"
                      className={`inline-flex h-8 w-9 items-center justify-center rounded-md transition ${
                        activeTool === 'margin' ? 'bg-[#246392] text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <MessageSquare className="h-4 w-4" strokeWidth={2.2} />
                    </button>
                  </div>
                  <span className="text-xs font-bold text-slate-600">Tool: {toolLabel(activeTool)}</span>
                </div>
              </div>

              <div
                ref={canvasWrapRef}
                className="relative mt-3"
                onMouseDown={beginAnnotate}
                onMouseMove={moveAnnotate}
                onMouseUp={endAnnotate}
                onMouseLeave={endAnnotate}
                onDoubleClick={addNote}
              >
                <PdfViewer
                  file={file}
                  page={page}
                  scale={scale}
                  onPageCount={(n) => {
                    setPageCount(n || 0)
                    setPage((p) => clamp(p, 1, Math.max(n || 1, 1)))
                  }}
                  className=""
                />

                <div className="pointer-events-none absolute inset-0">
                  {currentPageAnnotations.map((a) => {
                    if (a.rect) {
                      const style = {
                        left: `${a.rect.x * 100}%`,
                        top: `${a.rect.y * 100}%`,
                        width: `${a.rect.w * 100}%`,
                        height: `${a.rect.h * 100}%`,
                      }
                      if (a.tool === 'highlight') {
                        return (
                          <div
                            key={a.id}
                            className="absolute rounded-sm"
                            style={{ ...style, background: a.color || 'rgba(245,158,11,0.35)' }}
                          />
                        )
                      }
                      if (a.tool === 'underline') {
                        return (
                          <div
                            key={a.id}
                            className="absolute"
                            style={{ ...style, borderBottom: `3px solid ${a.color || '#246392'}` }}
                          />
                        )
                      }
                      if (a.tool === 'strike') {
                        return (
                          <div
                            key={a.id}
                            className="absolute"
                            style={{ ...style, borderTop: `3px solid ${a.color || '#246392'}`, transform: 'translateY(50%)' }}
                          />
                        )
                      }
                      return null
                    }
                    if (a.point) {
                      return (
                        <div
                          key={a.id}
                          className="absolute"
                          style={{ left: `${a.point.x * 100}%`, top: `${a.point.y * 100}%` }}
                        >
                          <div
                            className="rounded-lg px-2 py-1 text-[11px] font-bold text-white shadow-sm"
                            style={{ background: a.color || '#f59e0b', transform: 'translate(-10%, -50%)' }}
                          >
                            {a.tool === 'margin' ? 'C' : 'N'}
                          </div>
                        </div>
                      )
                    }
                    if (a.points && a.points.length) {
                      const d = a.points
                        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x * 100} ${p.y * 100}`)
                        .join(' ')
                      return (
                        <svg key={a.id} className="absolute inset-0 h-full w-full">
                          <path d={d} fill="none" stroke={a.color || '#246392'} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )
                    }
                    return null
                  })}

                  {drag ? (
                    <div
                      className="absolute rounded-sm"
                      style={{
                        left: `${Math.min(drag.start.x, drag.end.x) * 100}%`,
                        top: `${Math.min(drag.start.y, drag.end.y) * 100}%`,
                        width: `${Math.abs(drag.end.x - drag.start.x) * 100}%`,
                        height: `${Math.abs(drag.end.y - drag.start.y) * 100}%`,
                        background: activeTool === 'highlight' ? 'rgba(245,158,11,0.25)' : 'rgba(36,99,146,0.12)',
                        outline: '2px dashed rgba(36,99,146,0.55)',
                      }}
                    />
                  ) : null}
                </div>
              </div>

              {currentPageAnnotations.some((a) => a.tool === 'sticky' || a.tool === 'margin') ? (
                <div className="mt-3 rounded-xl bg-[#eef2fc] p-3">
                  <p className="text-xs font-bold text-slate-700">Notes on this page</p>
                  <ul className="mt-2 space-y-2">
                    {currentPageAnnotations
                      .filter((a) => a.tool === 'sticky' || a.tool === 'margin')
                      .map((a) => (
                        <li key={a.id} className="rounded-lg bg-white px-3 py-2 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200">
                          <span className="font-bold text-[#1a3a5c]">{a.tool === 'margin' ? 'Comment' : 'Sticky'}:</span> {a.text}
                        </li>
                      ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-xl bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.08)] sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-extrabold text-[#1a3a5c]">Evaluation Panel</p>
                <p className="text-xs font-bold text-slate-500">
                  {row.locked ? 'Locked (Published)' : dirty ? 'Unsaved changes' : 'Up to date'}
                </p>
              </div>

              <div className="mt-4 grid gap-4">
                <div className="rounded-xl bg-[#eef2fc] p-4">
                  <p className="text-xs font-extrabold text-slate-700">Marks Entry</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      value={row.marks ?? ''}
                      disabled={row.locked}
                      onChange={(e) => {
                        setRow((prev) => ({ ...prev, marks: e.target.value === '' ? null : Number(e.target.value) }))
                        setDirty(true)
                      }}
                      className="h-10 w-44 rounded-lg bg-white px-3 text-sm font-bold text-[#1a3a5c] outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#55ace7]"
                      placeholder="Total marks"
                    />
                    <span className="text-xs font-bold text-slate-600">Auto-calculated from rubric (editable).</span>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-extrabold text-slate-700">Rubric Evaluation</p>
                  <div className="mt-3 space-y-3">
                    {resolved.rubric.map((r, idx) => (
                      <div key={r.key} className="rounded-xl bg-slate-50 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-bold text-[#1a3a5c]">{r.label}</p>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              max={Number(r.max) || 0}
                              disabled={row.locked}
                              value={r.score ?? 0}
                              onChange={(e) => setRubricScore(idx, e.target.value)}
                              className="h-9 w-24 rounded-lg bg-white px-3 text-sm font-extrabold text-slate-800 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#55ace7]"
                            />
                            <span className="text-xs font-bold text-slate-600">/ {r.max}</span>
                          </div>
                        </div>
                        <textarea
                          value={r.feedback || ''}
                          disabled={row.locked}
                          onChange={(e) => setRubricFeedback(idx, e.target.value)}
                          placeholder="Feedback for this criterion"
                          className="mt-2 min-h-[56px] w-full resize-y rounded-lg bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#55ace7]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-[#eef2fc] p-4">
                  <p className="text-xs font-extrabold text-slate-700">Remarks</p>
                  <textarea
                    value={row.remarks || ''}
                    disabled={row.locked}
                    onChange={(e) => {
                      setRow((prev) => ({ ...prev, remarks: e.target.value }))
                      setDirty(true)
                    }}
                    placeholder="Mentor remarks (student-visible)"
                    className="mt-2 min-h-[90px] w-full resize-y rounded-lg bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#55ace7]"
                  />
                </div>

                <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-extrabold text-slate-700">Highlight Notes</p>
                  <textarea
                    value={row.highlightNotes || ''}
                    disabled={row.locked}
                    onChange={(e) => {
                      setRow((prev) => ({ ...prev, highlightNotes: e.target.value }))
                      setDirty(true)
                    }}
                    placeholder="Quick notes while marking"
                    className="mt-2 min-h-[64px] w-full resize-y rounded-lg bg-[#eef2fc] px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#55ace7]"
                  />
                </div>

                <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-extrabold text-slate-700">Internal Comments</p>
                  <textarea
                    value={row.internalComments || ''}
                    disabled={row.locked}
                    onChange={(e) => {
                      setRow((prev) => ({ ...prev, internalComments: e.target.value }))
                      setDirty(true)
                    }}
                    placeholder="Internal mentor/admin comments (not visible to student)"
                    className="mt-2 min-h-[64px] w-full resize-y rounded-lg bg-[#eef2fc] px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#55ace7]"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={saving || row.locked}
                    onClick={() => saveDraft({ silent: false })}
                    className="inline-flex h-11 min-h-[40px] flex-1 items-center justify-center gap-2 rounded-lg bg-[#1a3a5c] px-4 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition hover:bg-[#152f4a] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" strokeWidth={2.2} />
                    Save Draft
                  </button>
                  <button
                    type="button"
                    disabled={saving || row.locked}
                    onClick={publish}
                    className="inline-flex h-11 min-h-[40px] flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" strokeWidth={2.2} />
                    Publish Result
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <EvaluationHistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} evaluation={row} />
    </div>
  )
}

