type LeaveStatusBadgeProps = {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
};

function LeaveStatusBadge({ status }: LeaveStatusBadgeProps) {
  const base = 'px-2 py-1 rounded text-xs font-semibold inline-block';
  const styles: Record<typeof status, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800'
  };
  return <span className={`${base} ${styles[status]}`}>{status}</span>;
}

type LeaveListProps = {
  leaves: Array<{
    id: number;
    type: string;
    fromDate: string;
    toDate: string;
    days: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
  }>;
};

export function LeaveList({ leaves }: LeaveListProps) {
  if (!Array.isArray(leaves) || leaves.length === 0) return <p>No leaves found.</p>;

  return (
    <div className="overflow-x-auto bg-white shadow rounded p-4">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Dates</th>
            <th className="px-4 py-2">Days</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map(l => (
            <tr key={l.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{l.type}</td>
              <td className="px-4 py-2">{l.fromDate} → {l.toDate}</td>
              <td className="px-4 py-2">{l.days}</td>
              <td className="px-4 py-2"><LeaveStatusBadge status={l.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
