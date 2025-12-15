import { useEffect, useState } from 'react';
import { leaveApi } from '../services/leave.api';
import { LeaveBalance, LeaveRequest } from '../types/leave.types';

export function useLeave() {
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBalance = async () => {
    try {
      setBalance(await leaveApi.getBalance());
    } catch (err) {
      console.error('Failed to load balance', err);
      setError('Failed to load balance');
    }
  };

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const data = await leaveApi.getMyLeaves();
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load leaves', err);
      setError('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  const applyLeave = async (form: { type: 'CASUAL' | 'SICK'; fromDate: string; toDate: string; reason?: string }) => {
    try {
      await leaveApi.applyLeave(form);
      await loadLeaves();
    } catch (err) {
      console.error('Failed to apply leave', err);
      setError('Failed to apply leave');
    }
  };

  const approveLeave = async (id: number) => {
    try { await leaveApi.approveLeave(id); await loadLeaves(); } 
    catch { setError('Failed to approve leave'); }
  };

  const rejectLeave = async (id: number) => {
    try { await leaveApi.rejectLeave(id); await loadLeaves(); } 
    catch { setError('Failed to reject leave'); }
  };

  useEffect(() => {
    loadBalance();
    loadLeaves();
  }, []);

  return { balance, leaves, loading, error, applyLeave, approveLeave, rejectLeave };
}