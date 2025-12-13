import { useLeave } from '../hooks/useLeave';
import { ApplyLeaveForm } from '../components/ApplyLeaveForm';
import { LeaveBalanceCard } from '../components/LeaveBalanceCard';

export default function ApplyLeavePage() {
  const { balance, applyLeave } = useLeave();

  return (
    <>
      <LeaveBalanceCard balance={balance} />
      <ApplyLeaveForm onSubmit={applyLeave} />
    </>
  );
}
