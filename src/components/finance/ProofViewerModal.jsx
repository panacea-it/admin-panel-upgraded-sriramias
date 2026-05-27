import { FileImage, FileText } from 'lucide-react'
import Modal from '../ui/Modal'
import ModalPanelHeader from '../courses/ModalPanelHeader'

export default function ProofViewerModal({ open, onClose, title = 'Payment proof', proofUrl, proofName, utr, notes }) {
  const isPdf = proofName?.toLowerCase().endsWith('.pdf')

  return (
    <Modal open={open} onClose={onClose} size="lg" title={title}>
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_11px_25px_rgba(15,23,42,0.08)]">
        <ModalPanelHeader title={title} onClose={onClose} />
        <div className="space-y-4 p-5 sm:p-6">
          {utr && (
            <p className="text-sm">
              <span className="font-semibold text-[#333]">UTR / Reference:</span>{' '}
              <span className="font-mono text-[#246392]">{utr}</span>
            </p>
          )}
          {notes && (
            <p className="rounded-lg bg-[#eef2fc] p-3 text-sm text-[#333]">
              <span className="font-semibold">Notes:</span> {notes}
            </p>
          )}
          <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6">
            {isPdf ? (
              <div className="flex flex-col items-center gap-2 text-[#686868]">
                <FileText className="h-12 w-12 text-[#246392]" />
                <p className="text-sm font-medium">{proofName || 'Document.pdf'}</p>
                <p className="text-xs">PDF preview available when API provides file URL</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-[#686868]">
                <FileImage className="h-12 w-12 text-[#246392]" />
                <p className="text-sm font-medium">{proofName || 'proof-image.jpg'}</p>
                {proofUrl ? (
                  <img src={proofUrl} alt="Payment proof" className="max-h-64 rounded-lg object-contain" />
                ) : (
                  <p className="text-xs">Screenshot / receipt image placeholder (mock)</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
