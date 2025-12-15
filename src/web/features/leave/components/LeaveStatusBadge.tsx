type LeaveStatusBadgeProps = {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
};

export function LeaveStatusBadge({ status }: LeaveStatusBadgeProps) {
  const base = 'px-2 py-1 rounded text-xs font-semibold inline-block';

  const styles: Record<typeof status, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800'
  };

  return <span className={`${base} ${styles[status]}`}>{status}</span>;
}