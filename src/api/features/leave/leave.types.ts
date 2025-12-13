export type LeaveType = 'CASUAL' | 'SICK';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApplyLeaveInput {
  type: LeaveType;
  fromDate: string;
  toDate: string;
  reason?: string;
}

export interface LeaveResponse {
  id: number;
  type: LeaveType;
  status: LeaveStatus;
  fromDate: string;
  toDate: string;
  days: number;
}

export interface LeaveBalanceResponse {
  casualRemaining: number;
  sickRemaining: number;
}
