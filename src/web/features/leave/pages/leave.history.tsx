import { useLeave } from '../hooks/useLeave';
import { LeaveList } from '../components/LeaveList';

export default function LeaveHistoryPage() {
  const { leaves } = useLeave();
  return <LeaveList leaves={leaves} />;
}
