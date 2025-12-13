import { useLeave } from '../hooks/useLeave';

export default function AdminLeavePage() {
  const { leaves = [], approveLeave, rejectLeave, loading } = useLeave();

  if (loading) return <p>Loading leaves...</p>;
  if (!leaves.length) return <p>No leave requests found.</p>;

  return (
    <>
      {leaves.map(l => (
        <div key={l.id} className="card p-4 mb-4 border rounded shadow">
          <p className="font-medium">{l.reason}</p>
          <div className="mt-2 flex gap-2">
            <button
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              onClick={() => approveLeave(l.id)}
            >
              Approve
            </button>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              onClick={() => rejectLeave(l.id)}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
