import { Upload, X } from 'lucide-react'
import { cn } from '../../../utils/cn'

const fieldClass =
  'mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-[#222] outline-none focus:ring-2 focus:ring-[#55ace7]/40'

export default function OfflinePaymentModeFields({
  paymentMode,
  register,
  modeFields,
  setModeFields,
  proofFile,
  proofPreview,
  onProofChange,
  onClearProof,
}) {
  const setMode = (key, value) => setModeFields((f) => ({ ...f, [key]: value }))

  return (
    <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[#246392]">Payment mode details</p>

      {paymentMode === 'UPI' && (
        <>
          <label className="block text-sm font-semibold text-[#333]">
            UTR number
            <input
              {...register('utrNumber', { required: !paymentMode })}
              className={cn(fieldClass, 'font-mono')}
              placeholder="12-digit UTR"
            />
          </label>
          <ProofUploadBlock
            proofFile={proofFile}
            proofPreview={proofPreview}
            onProofChange={onProofChange}
            onClearProof={onClearProof}
            label="UPI screenshot"
          />
        </>
      )}

      {paymentMode === 'Bank Transfer' && (
        <>
          <label className="block text-sm font-semibold text-[#333]">
            Reference / NEFT number
            <input {...register('utrNumber')} className={cn(fieldClass, 'font-mono')} />
          </label>
          <ProofUploadBlock
            proofFile={proofFile}
            proofPreview={proofPreview}
            onProofChange={onProofChange}
            onClearProof={onClearProof}
            label="Transfer receipt"
          />
        </>
      )}

      {paymentMode === 'Cheque' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-[#333]">
            Cheque number
            <input
              value={modeFields.chequeNumber || ''}
              onChange={(e) => setMode('chequeNumber', e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block text-sm font-semibold text-[#333]">
            Bank name
            <input
              value={modeFields.bankName || ''}
              onChange={(e) => setMode('bankName', e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block text-sm font-semibold text-[#333] sm:col-span-2">
            Cheque date
            <input
              type="date"
              value={modeFields.chequeDate || ''}
              onChange={(e) => setMode('chequeDate', e.target.value)}
              className={fieldClass}
            />
          </label>
        </div>
      )}

      {paymentMode === 'DD' && (
        <label className="block text-sm font-semibold text-[#333]">
          DD number
          <input
            value={modeFields.ddNumber || ''}
            onChange={(e) => setMode('ddNumber', e.target.value)}
            className={fieldClass}
          />
        </label>
      )}

      {paymentMode === 'Cash' && (
        <label className="block text-sm font-semibold text-[#333]">
          Receipt number
          <input
            value={modeFields.receiptNumber || ''}
            onChange={(e) => setMode('receiptNumber', e.target.value)}
            className={fieldClass}
            placeholder="Counter receipt #"
          />
        </label>
      )}

      {paymentMode === 'POS Machine' && (
        <label className="block text-sm font-semibold text-[#333]">
          POS transaction ID
          <input
            {...register('utrNumber')}
            className={cn(fieldClass, 'font-mono')}
          />
        </label>
      )}

      {paymentMode === 'Card' && (
        <label className="block text-sm font-semibold text-[#333]">
          Authorization reference
          <input {...register('utrNumber')} className={cn(fieldClass, 'font-mono')} />
        </label>
      )}

      {!['UPI', 'Bank Transfer'].includes(paymentMode) && (
        <ProofUploadBlock
          proofFile={proofFile}
          proofPreview={proofPreview}
          onProofChange={onProofChange}
          onClearProof={onClearProof}
          label="Upload proof"
        />
      )}
    </div>
  )
}

function ProofUploadBlock({ proofFile, proofPreview, onProofChange, onClearProof, label }) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#333]">{label}</p>
      <div className="mt-2 flex flex-wrap items-start gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#55ace7]/50 bg-white px-4 py-2.5 text-sm font-semibold text-[#246392] hover:bg-[#eef6fc]">
          <Upload className="h-4 w-4" />
          Upload proof
          <input type="file" accept="image/*,.pdf" className="sr-only" onChange={onProofChange} />
        </label>
        {proofFile && (
          <button
            type="button"
            onClick={onClearProof}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#df8284] hover:underline"
          >
            <X className="h-3.5 w-3.5" /> Remove
          </button>
        )}
      </div>
      {proofPreview && (
        <img src={proofPreview} alt="" className="mt-2 max-h-32 rounded-lg object-contain" />
      )}
    </div>
  )
}
