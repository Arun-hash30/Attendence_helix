export interface LeaveBalance {
  id: number;
  userId: number;
  year: number;
  casualTotal: number;
  casualUsed: number;
  sickTotal: number;
  sickUsed: number;
  annualTotal: number;
  annualUsed: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export interface LeaveRequest {
  id: number;
  userId: number;
  type: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason?: string | null;
  status: string;
  approvedBy?: number | null;
  approvedAt?: string | null;
  halfDay: boolean;
  halfDayType?: string | null;
  emergency: boolean;
  attachments?: string | null;
  comments?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
  };
  approvedByUser?: {
    name: string;
  };
}

export interface ApplyLeaveInput {
  type: string;
  fromDate: string;
  toDate: string;
  reason?: string;
  halfDay?: boolean;
  halfDayType?: string;
  emergency?: boolean;
}

export interface UpdateLeaveStatusInput {
  status: string;
  comments?: string;
}

export interface LeaveStats {
  totalLeaves: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  leaveBalance: {
    casual: number;
    sick: number;
    annual: number;
  };
}

export interface LeaveCalendarEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  type: string;
  status: string;
  userId: number;
  userName: string;
  allDay?: boolean;
  color?: string;
}

export interface LeaveTableData {
  id: number;
  employeeId: string;
  employeeName: string;
  type: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason?: string;
  status: string;
  statusColor: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  actions?: boolean;
}

export interface UserForLeave {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}