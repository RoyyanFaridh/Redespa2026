export default function ModalWrapper({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-full max-w-md
          overflow-hidden
          rounded-xl
          bg-white
          shadow-xl
        "
      >
        {children}
      </div>
    </div>
  )
}