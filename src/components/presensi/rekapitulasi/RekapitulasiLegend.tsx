type Props = {
  className?: string;
};

const LEGEND_ITEMS = [
  {
    label: "Hadir",
    className: "bg-[#287A50]",
  },
  {
    label: "Terlambat",
    className: "bg-amber-500",
  },
  {
    label: "Izin",
    className: "bg-blue-500",
  },
  {
    label: "Sakit",
    className: "bg-purple-500",
  },
  {
    label: "Alpa",
    className: "bg-red-500",
  },
];

export default function RekapitulasiLegend({ className = "" }: Props) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] text-[#78827C] ${className}`}
      aria-label="Keterangan status kehadiran"
    >
      {LEGEND_ITEMS.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1.5 whitespace-nowrap"
        >
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${item.className}`}
            aria-hidden="true"
          />
          {item.label}
        </span>
      ))}

      <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <span
          className="h-2 w-2 shrink-0 rounded-full border border-[#E5EAE6] bg-white"
          aria-hidden="true"
        />
        Belum Hadir
      </span>

      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[#9AA39D]">
        <span className="inline-flex h-2 w-2 shrink-0 items-center justify-center text-[10px]">
          -
        </span>
        Tidak Berlaku
      </span>
    </div>
  );
}
