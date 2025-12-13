type LeaveBalanceProps = {
  balance: { casualRemaining: number; sickRemaining: number } | null;
};

export function LeaveBalanceCard({ balance }: LeaveBalanceProps) {
  if (!balance) return null;

  return (
    <div className="p-6 bg-white rounded shadow-md max-w-sm">
      <h3 className="font-semibold text-lg mb-3">Leave Balance</h3>
      <p className="text-gray-700">Casual: <span className="font-medium">{balance.casualRemaining}</span></p>
      <p className="text-gray-700">Sick: <span className="font-medium">{balance.sickRemaining}</span></p>
    </div>
  );
}
