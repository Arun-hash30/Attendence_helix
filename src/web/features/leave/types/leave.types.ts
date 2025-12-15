export type LeaveType = 'CASUAL' | 'SICK';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveBalance {
  casualRemaining: number;
  sickRemaining: number;
}

export interface LeaveRequest {
  id: number;
  type: LeaveType;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
}