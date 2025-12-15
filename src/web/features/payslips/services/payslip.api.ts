import { config } from "../../auth/config/index";
import { 
  Payslip, 
  SalaryStructureInput, 
  GeneratePayslipInput,
  UserForPayslip,
  ApiResponse 
} from "../types/payslip";

export const payslipApi = {
  async getMyPayslips(userId: number, token: string): Promise<ApiResponse<Payslip[]>> {
    const res = await fetch(`${config.api.baseUrl}/api/payslip/my/${userId}`, {
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      }
    });
    return res.json();
  },

  async getAllPayslips(token: string, filters?: { month?: number; year?: number; status?: string }): Promise<ApiResponse<Payslip[]>> {
    const queryParams = new URLSearchParams();
    if (filters?.month) queryParams.append('month', filters.month.toString());
    if (filters?.year) queryParams.append('year', filters.year.toString());
    if (filters?.status) queryParams.append('status', filters.status);
    
    const url = `${config.api.baseUrl}/api/payslip/admin/all${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const res = await fetch(url, {
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      }
    });
    return res.json();
  },

  async getUsersForPayslip(token: string): Promise<ApiResponse<UserForPayslip[]>> {
    const res = await fetch(`${config.api.baseUrl}/api/payslip/admin/users`, {
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      }
    });
    return res.json();
  },

  async createSalary(userId: number, data: SalaryStructureInput, token: string): Promise<ApiResponse<any>> {
    const res = await fetch(`${config.api.baseUrl}/api/payslip/salary/${userId}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async generatePayslips(data: GeneratePayslipInput, token: string): Promise<ApiResponse<any>> {
    const res = await fetch(`${config.api.baseUrl}/api/payslip/generate`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getPayslip(id: number, token: string): Promise<ApiResponse<Payslip>> {
    const res = await fetch(`${config.api.baseUrl}/api/payslip/${id}`, {
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      }
    });
    return res.json();
  },

  async deletePayslip(id: number, token: string): Promise<ApiResponse<void>> {
    const res = await fetch(`${config.api.baseUrl}/api/payslip/${id}`, {
      method: "DELETE",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      }
    });
    return res.json();
  },

  async updatePayslipStatus(
    id: number, 
    status: 'GENERATED' | 'PROCESSED' | 'PAID', 
    token: string
  ): Promise<ApiResponse<Payslip>> {
    const res = await fetch(`${config.api.baseUrl}/api/payslip/${id}/status`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async getPayslipStats(token: string): Promise<ApiResponse<any>> {
    const res = await fetch(`${config.api.baseUrl}/api/payslip/admin/stats`, {
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${token}` 
      }
    });
    return res.json();
  }
};