export default function SectionBar({ title }) {
  return (
    <div className="rounded-lg bg-white px-4 py-3 text-center shadow-[0_4px_14px_rgba(15,23,42,0.08)] sm:py-3.5">
      <h3 className="text-base font-bold text-[#246392] sm:text-lg">{title}</h3>
    </div>
  )
}
