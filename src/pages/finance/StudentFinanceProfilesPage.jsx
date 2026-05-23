import { useCallback, useEffect, useMemo, useState } from 'react'
import { UserCircle, Pencil } from 'lucide-react'
import FinancePageShell from '../../components/finance/FinancePageShell'
import FinanceStatusBadge from '../../components/finance/FinanceStatusBadge'
import FinanceSlideDrawer from '../../components/finance/FinanceSlideDrawer'
import PaginatedFigmaTable from '../../components/figma/PaginatedFigmaTable'
import { fetchStudentFinanceProfiles } from '../../api/financeAPI'
import { formatINR } from '../../utils/financeFilters'
import { formatCategoryDateTime } from '../../utils/formatDateTime'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useFinancePermissions } from '../../hooks/useFinancePermissions'
import { toast } from '../../utils/toast'

export default function StudentFinanceProfilesPage() {
  const { canEdit } = useFinancePermissions()
  const [profiles, setProfiles] = useState([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [selected, setSelected] = useState(null)
  const [editNote, setEditNote] = useState('')

  const load = useCallback(async () => {
    try {
      setProfiles(await fetchStudentFinanceProfiles())
    } catch {
      toast.error('Failed to load profiles')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return profiles
    return profiles.filter(
      (p) =>
        p.studentName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.mobile.includes(q),
    )
  }, [profiles, debouncedSearch])

  const courseHistory = useMemo(
    () =>
      filtered.flatMap((p) =>
        (p.courses || []).map((c) => ({
          ...c,
          profileId: p.id,
          studentName: p.studentName,
          branch: p.branch,
        })),
      ),
    [filtered],
  )

  const profileColumns = [
    { key: 'studentName', label: 'Student', render: (r) => <span className="font-medium">{r.studentName}</span> },
    { key: 'id', label: 'ID' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'branch', label: 'Branch' },
    { key: 'totalPaid', label: 'Total paid', render: (r) => formatINR(r.totalPaid) },
    { key: 'totalPending', label: 'Pending', render: (r) => formatINR(r.totalPending) },
    {
      key: 'actions',
      label: 'Action',
      render: (row) => (
        <button type="button" onClick={() => { setSelected(row); setEditNote('') }} className="rounded p-1.5 text-[#246392] hover:bg-[#eef6fc]">
          <Pencil className="h-4 w-4" />
        </button>
      ),
    },
  ]

  const historyColumns = [
    { key: 'studentName', label: 'Student' },
    { key: 'courseName', label: 'Course' },
    { key: 'courseType', label: 'Type' },
    { key: 'paymentType', label: 'Payment' },
    { key: 'paidAmount', label: 'Paid', render: (r) => formatINR(r.paidAmount) },
    { key: 'pendingAmount', label: 'Pending', render: (r) => formatINR(r.pendingAmount) },
    { key: 'paymentStatus', label: 'Status', render: (r) => <FinanceStatusBadge status={r.paymentStatus} /> },
    { key: 'date', label: 'Date', render: (r) => formatCategoryDateTime(r.date) },
  ]

  const handleSaveNote = () => {
    toast.success('Profile note saved (mock)')
    setSelected(null)
  }

  return (
    <FinancePageShell icon={UserCircle} title="Student Finance Profiles">
      <input
        type="search"
        placeholder="Search student…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
      />

      <div>
        <h3 className="mb-3 text-sm font-bold text-[#246392]">Student profiles</h3>
        <PaginatedFigmaTable columns={profileColumns} data={filtered} itemLabel="profiles" resetDeps={[debouncedSearch]} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-[#246392]">Course finance history</h3>
        <PaginatedFigmaTable columns={historyColumns} data={courseHistory} itemLabel="records" />
      </div>

      <FinanceSlideDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.studentName}
        subtitle={selected?.id}
        footer={
          canEdit && (
            <button
              type="button"
              onClick={handleSaveNote}
              className="w-full rounded-lg bg-[#246392] py-2.5 text-sm font-semibold text-white"
            >
              Save note
            </button>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid gap-2 text-sm">
              <p><span className="text-[#686868]">Email:</span> {selected.email}</p>
              <p><span className="text-[#686868]">Mobile:</span> {selected.mobile}</p>
              <p><span className="text-[#686868]">Branch:</span> {selected.branch}</p>
              <p><span className="text-[#686868]">Total paid:</span> {formatINR(selected.totalPaid)}</p>
              <p><span className="text-[#686868]">Pending:</span> {formatINR(selected.totalPending)}</p>
            </div>
            {canEdit && (
              <label className="block text-sm font-medium">
                Admin note
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Internal finance note…"
                />
              </label>
            )}
            <div>
              <h4 className="mb-2 text-sm font-bold text-[#246392]">Enrolled courses</h4>
              <ul className="space-y-2">
                {(selected.courses || []).map((c) => (
                  <li key={c.courseId} className="rounded-md border border-slate-100 p-3 text-sm">
                    <p className="font-semibold">{c.courseName}</p>
                    <p className="text-[#686868]">{c.courseType} · {c.paymentType}</p>
                    <FinanceStatusBadge status={c.paymentStatus} className="mt-2" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </FinanceSlideDrawer>
    </FinancePageShell>
  )
}
