type IconProps = { className?: string };

export function DetailIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h.01" />
    </svg>
  );
}

export function EditIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 3.5a2.121 2.121 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z"
      />
    </svg>
  );
}

export function DeleteIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6V4h8v2" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 6l-1 14H6L5 6"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v5M14 11v5" />
    </svg>
  );
}

export function QRIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="2.5"
        y="2.5"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="11.5"
        y="2.5"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="2.5"
        y="11.5"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 12h2v2h-2zM16 12h1.5M12 16h2M16 15v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
