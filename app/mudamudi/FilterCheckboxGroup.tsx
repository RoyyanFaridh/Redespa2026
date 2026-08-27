type Props = {
  label: string
  options: string[]
  selected: string[]
  onChange: (next: string[]) => void
  colorClass?: string
}

export default function FilterCheckboxGroup({
  label,
  options,
  selected,
  onChange,
  colorClass = 'border-teal-400 bg-teal-50 text-teal-700',
}: Props) {
  const isSemua = selected.length === 0

  function toggleOption(opt: string) {
    if (selected.includes(opt)) {
      onChange(selected.filter((o) => o !== opt))
    } else {
      onChange([...selected, opt])
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium text-gray-600">{label}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange([])}
          className={`rounded-lg border px-3 py-1.5 text-[11px] font-medium transition ${
            isSemua ? colorClass : 'border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          Semua
        </button>

        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggleOption(opt)}
            className={`rounded-lg border px-3 py-1.5 text-[11px] font-medium transition ${
              selected.includes(opt) ? colorClass : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}