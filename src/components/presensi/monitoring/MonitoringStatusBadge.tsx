import { PresensiStatus } from "../../../backend/presensi/types";
import { Badge, type BadgeVariant } from "../../common";

type Props = {
  status: PresensiStatus | null;
  size?: "sm" | "md";
};

const STATUS_CONFIG: Record<
  PresensiStatus,
  {
    label: string;
    variant: BadgeVariant;
  }
> = {
  hadir: {
    label: "Hadir",
    variant: "success",
  },
  terlambat: {
    label: "Terlambat",
    variant: "warning",
  },
  izin: {
    label: "Izin",
    variant: "info",
  },
  sakit: {
    label: "Sakit",
    variant: "info",
  },
  alpa: {
    label: "Alpa",
    variant: "danger",
  },
};

export default function MonitoringStatusBadge({ status, size = "sm" }: Props) {
  if (!status) {
    return (
      <Badge variant="neutral" size={size} dot>
        Belum Hadir
      </Badge>
    );
  }

  const config = STATUS_CONFIG[status];

  if (!config) {
    return (
      <Badge variant="neutral" size={size}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge variant={config.variant} size={size} dot>
      {config.label}
    </Badge>
  );
}
