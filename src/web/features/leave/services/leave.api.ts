import axios from 'axios';
import { LeaveBalance, LeaveRequest } from '../types/leave.types';

export const leaveApi = {
  getBalance: async (): Promise<LeaveBalance> => {
    const res = await axios.get('/leave/balance');
    return res.data;
  },

  applyLeave: async (data: { type: 'CASUAL' | 'SICK'; fromDate: string; toDate: string; reason?: string }): Promise<LeaveRequest> => {
    const res = await axios.post('/leave', data);
    return res.data;
  },

  getMyLeaves: async (): Promise<LeaveRequest[]> => {
    const res = await axios.get('/leave');
    return Array.isArray(res.data) ? res.data : [];
  },

  getAllLeaves: async (): Promise<LeaveRequest[]> => {
    const res = await axios.get('/leave/admin');
    return Array.isArray(res.data) ? res.data : [];
  },

  approveLeave: async (id: number) => {
    const res = await axios.post(`/leave/${id}/approve`);
    return res.data;
  },

  rejectLeave: async (id: number) => {
    const res = await axios.post(`/leave/${id}/reject`);
    return res.data;
  }
};
