import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  UserCircle,
  IndianRupee,
  CalendarClock,
  Receipt,
  MessageSquare,
  ShieldCheck,
  History,
} from 'lucide-react'
import FinanceSlideDrawer from './FinanceSlideDrawer'
import FinanceStatusBadge from './FinanceStatusBadge'
import { fetchPaymentReports, fetchEmiPlans, fetchCommunicationLogs } from '../../api/financeAPI'
import { enrichFinanceRecord } from '../../utils/financeRecordModel'
import { formatINR } from '../../utils/financeFilters'
import { formatCategoryDateTime } from '../../utils/formatDateTime'
import { useFinanceOperations } from '../../contexts/FinanceOperationsContext'
import { cn } from '../../utils/cn'

const TABS = [
  { id: 'overview', label: 'Overview', icon: UserCircle },
  { id: 'payments', label: 'Payment History', icon: IndianRupee },
  { id: 'emi', label: 'EMI', icon: CalendarClock },
  { id: 'receipts', label: 'Receipts', icon: Receipt },
  { id: 'communication', label: 'Communication', icon: MessageSquare },
  { id: 'verification', label: 'Verification', icon: ShieldCheck },
  { id: 'attempts', label: 'Failed Attempts', icon: History },
]

export default function StudentFinanceProfilePanel({ studentId, seed, onClose }) {
  const { goToFinance } = useFinanceOperations()
  const [tab, setTab] = useState('overview')
  const [payments, setPayments] = useState([])
  const [emiPlans, setEmiPlans] = useState([])
  const [comms, setComms] = useState([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!studentId) return
    setLoading(true)
    try {
      const [allPay, emi, logs] = await Promise.all([
        fetchPaymentReports(),
        fetchEmiPlans(),
        fetchCommunicationLogs(),
      ])
      setPayments(allPay.filter((p) => p.studentId === studentId).map(enrichFinanceRecord))
      setEmiPlans(emi.filter((e) => e.studentId === studentId))
      setComms(
        logs.filter(
          (l) =>
            l.recipient?.includes(seed?.mobile) ||
            l.recipient?.includes(seed?.email) ||
            l.studentId === studentId,
        ),
      )
    } finally {
      setLoading(false)
    }
  }, [studentId, seed?.mobile, seed?.email])

  useEffect(() => {
    if (studentId) {
      setTab('overview')
      load()
    }
  }, [studentId, load])

  const profile = useMemo(() => {
    const base = seed ? enrichFinanceRecord(seed) : payments[0] || {}
    const totalPaid = payments.reduce((s, p) => s + (p.amountPaid || 0), 0)
    const totalPending = payments.reduce((s, p) => s + (p.pendingAmount || 0), 0)
    const totalFees = payments.reduce((s, p) => s + (p.totalFees || 0), 0) || base.totalFees || 0
    return {
      ...base,
      studentId: studentId || base.studentId,
      studentName: base.studentName || 'Student',
      totalPaid,
      totalPending,
      totalFees,
      emiStatus: emiPlans.length ? 'EMI Running' : base.emiStatus || '—',
      lastPayment: payments.find((p) => p.paymentDate)?.paymentDate,
    }
  }, [seed, payments, emiPlans, studentId])

  if (!studentId) return null

  return (
    <FinanceSlideDrawer
      open={!!studentId}
      onClose={onClose}
      title={profile.studentName}
      subtitle={`${profile.studentId} · ${profile.centerName || profile.branch || '—'}`}
      width="max-w-2xl"
    >
      <div className="flex flex-col gap-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition',
                  tab === t.id ? 'bg-[#246392] text-white' : 'bg-[#eef2fc] text-[#246392]',
                )}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          {loading && <p className="text-sm text-[#686868]">Loading finance profile…</p>}

          {tab === 'overview' && !loading && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-[#eef2fc] p-4">
                <p className="text-xs font-semibold text-[#686868]">Total fees</p>
                <p className="text-lg font-bold text-[#111]">{formatINR(profile.totalFees)}</p>
              </div>
              <div className="rounded-xl bg-[#eef8eb] p-4">
                <p className="text-xs font-semibold text-[#686868]">Total paid</p>
                <p className="text-lg font-bold text-[#111]">{formatINR(profile.totalPaid)}</p>
              </div>
              <div className="rounded-xl bg-[#fff8eb] p-4">
                <p className="text-xs font-semibold text-[#686868]">Pending</p>
                <p className="text-lg font-bold text-[#111]">{formatINR(profile.totalPending)}</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <p className="text-xs font-semibold text-[#686868]">EMI status</p>
                <FinanceStatusBadge status={profile.emiStatus} />
              </div>
              {profile.lastPayment && (
                <p className="sm:col-span-2 text-sm text-[#686868]">
                  Last payment: {formatCategoryDateTime(profile.lastPayment)}
                </p>
              )}
            </div>
          )}

          {tab === 'payments' && (
            <ul className="space-y-2">
              {payments.length === 0 && <p className="text-sm text-[#686868]">No payment history</p>}
              {payments.map((p) => (
                <li key={p.id} className="rounded-lg border border-slate-100 p-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">{p.courseName}</span>
                    <FinanceStatusBadge status={p.paymentStatus} />
                  </div>
                  <p className="mt-1 text-[#686868]">{formatINR(p.amountPaid)} · {p.paymentMode}</p>
                </li>
              ))}
            </ul>
          )}

          {tab === 'emi' && (
            <ul className="space-y-3">
              {emiPlans.length === 0 && <p className="text-sm text-[#686868]">No EMI plan</p>}
              {emiPlans.map((plan) => (
                <li key={plan.id} className="rounded-lg bg-[#eef2fc] p-3 text-sm">
                  <p className="font-semibold">{plan.courseName}</p>
                  <p className="text-[#686868]">
                    Paid {formatINR(plan.totalPaid)} / {formatINR(plan.totalFees)}
                  </p>
                  <button
                    type="button"
                    onClick={() => goToFinance('emi')}
                    className="mt-2 text-xs font-semibold text-[#246392] underline"
                  >
                    Open EMI Management
                  </button>
                </li>
              ))}
            </ul>
          )}

          {tab === 'receipts' && (
            <ul className="space-y-2">
              {payments.filter((p) => p.receiptNumber).map((p) => (
                <li key={p.id} className="flex justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                  <span className="font-mono">{p.receiptNumber}</span>
                  <span>{formatINR(p.amountPaid)}</span>
                </li>
              ))}
            </ul>
          )}

          {tab === 'communication' && (
            <ul className="space-y-2">
              {comms.map((c) => (
                <li key={c.id} className="rounded-lg border border-slate-100 p-3 text-sm">
                  <div className="flex justify-between">
                    <span>{c.type}</span>
                    <FinanceStatusBadge status={c.status} />
                  </div>
                  <p className="text-[#686868]">{c.channel} · {formatCategoryDateTime(c.timestamp)}</p>
                </li>
              ))}
            </ul>
          )}

          {tab === 'verification' && (
            <ul className="space-y-2">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span>{p.id}</span>
                  <FinanceStatusBadge status={p.verificationStatus} />
                </li>
              ))}
            </ul>
          )}

          {tab === 'attempts' && (
            <button
              type="button"
              onClick={() => goToFinance('attempts', { student: studentId })}
              className="text-sm font-semibold text-[#246392] underline"
            >
              View full attempt logs →
            </button>
          )}
      </div>
    </FinanceSlideDrawer>
  )
}
