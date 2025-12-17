import { config } from "../../auth/config/index";
import { 
  LeaveBalance, 
  LeaveRequest, 
  ApplyLeaveInput, 
  UpdateLeaveStatusInput,
  LeaveStats,
  LeaveCalendarEvent,
  UserForLeave,
  ApiResponse 
} from "../types/leave";

export const leaveApi = {
  // Leave Balance
  async getLeaveBalance(userId: number, year: number | undefined, token: string): Promise<ApiResponse<LeaveBalance>> {
    const url = `${config.api.baseUrl}/api/leave/balance/${userId}${year ? `?year=${year}` : ''}`;
    const res = await fetch(url, {
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      }
    });
    return res.json();
  },

  // Apply for leave
  async applyLeave(userId: number, data: ApplyLeaveInput, token: string): Promise<ApiResponse<LeaveRequest>> {
    const res = await fetch(`${config.api.baseUrl}/api/leave/apply/${userId}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Get my leave requests
  async getMyLeaves(userId: number, token: string, filters?: {
    status?: string;
    year?: number;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{data: LeaveRequest[], pagination: any}>> {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.year) queryParams.append('year', filters.year.toString());
    if (filters?.type) queryParams.append('type', filters.type);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    
    const url = `${config.api.baseUrl}/api/leave/my/${userId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const res = await fetch(url, {
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      }
    });
    return res.json();
  },

  // Get all leave requests (admin)
  async getAllLeaves(token: string, filters?: {
    status?: string;
    userId?: number;
    year?: number;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{data: LeaveRequest[], pagination: any}>> {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.userId) queryParams.append('userId', filters.userId.toString());
    if (filters?.year) queryParams.append('year', filters.year.toString());
    if (filters?.type) queryParams.append('type', filters.type);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    
    const url = `${config.api.baseUrl}/api/leave/admin/all${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const res = await fetch(url, {
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      }
    });
    return res.json();
  },

  // Cancel leave request
  async cancelLeave(id: number, userId: number, token: string): Promise<ApiResponse<void>> {
    const res = await fetch(`${config.api.baseUrl}/api/leave/cancel/${id}/${userId}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      }
    });
    return res.json();
  },

  // Update leave status (admin)
  async updateLeaveStatus(id: number, approverId: number, data: UpdateLeaveStatusInput, token: string): Promise<ApiResponse<LeaveRequest>> {
    const res = await fetch(`${config.api.baseUrl}/api/leave/admin/status/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({ ...data, approverId })
    });
    return res.json();
  },

  // Get leave statistics
  async getLeaveStats(token: string, userId?: number, year?: number): Promise<ApiResponse<LeaveStats>> {
    const url = userId 
      ? `${config.api.baseUrl}/api/leave/stats/${userId}${year ? `?year=${year}` : ''}`
      : `${config.api.baseUrl}/api/leave/admin/stats${year ? `?year=${year}` : ''}`;
    
    const res = await fetch(url, {
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      }
    });
    return res.json();
  },

  // Get leave calendar
  async getLeaveCalendar(token: string, year: number, month: number, userId?: number): Promise<ApiResponse<LeaveCalendarEvent[]>> {
    const url = `${config.api.baseUrl}/api/leave/calendar/${year}/${month}${userId ? `?userId=${userId}` : ''}`;
    
    const res = await fetch(url, {
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      }
    });
    return res.json();
  },

  // Get users for leave management (admin)
  async getUsersForLeaveManagement(token: string): Promise<ApiResponse<UserForLeave[]>> {
    const res = await fetch(`${config.api.baseUrl}/api/leave/admin/users`, {
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      }
    });
    return res.json();
  },

  // Get single leave request
  async getLeaveRequest(id: number, token: string): Promise<ApiResponse<LeaveRequest>> {
    const res = await fetch(`${config.api.baseUrl}/api/leave/admin/${id}`, {
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      }
    });
    return res.json();
  },

  // Get leave types
  async getLeaveTypes(token: string): Promise<ApiResponse<{value: string, label: string}[]>> {
    const res = await fetch(`${config.api.baseUrl}/api/leave/types`, {
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      }
    });
    return res.json();
  },

  // Get leave statuses
  async getLeaveStatuses(token: string): Promise<ApiResponse<{value: string, label: string}[]>> {
    const res = await fetch(`${config.api.baseUrl}/api/leave/statuses`, {
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      }
    });
    return res.json();
  }
};