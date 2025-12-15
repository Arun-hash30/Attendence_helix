export interface SalaryStructureInput {
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  travelAllowance: number;
  medicalAllowance: number;
  pf: number;
  professionalTax: number;
  tds: number;
  otherDeductions: number;
  effectiveFrom: string;
}

export interface GeneratePayslipInput {
  userId: number;
  months: number[]; // Array of months to generate payslips for
  year: number;
}

export interface Payslip {
  id: number;
  userId: number;
  month: number;
  year: number;
  earnings: Record<string, number>;
  deductions: Record<string, number>;
  grossPay: number;
  totalDeduct: number;
  netPay: number;
  status: 'GENERATED' | 'PROCESSED' | 'PAID';
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  paymentDate?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
    employeeId: string;
    designation: string;
    department: string;
    phone?: string;
  };
}

export interface PayslipTableData {
  id: number;
  employeeId: string;
  employeeName: string;
  month: number;
  year: number;
  monthName: string;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: string;
  statusColor: string;
  createdAt: string;
  actions?: boolean;
}

export interface UserForPayslip {
  id: number;
  name: string;
  email: string;
  employeeId: string;
  designation: string;
  department: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}