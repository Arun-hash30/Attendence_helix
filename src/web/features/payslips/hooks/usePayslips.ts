import { useState, useEffect } from "react";
import { payslipApi } from "../services/payslip.api";
import { Payslip, PayslipTableData } from "../types/payslip";
import { useAuth } from "../../auth";

export const usePayslips = (userId?: number, isAdmin?: boolean, filters?: { month?: number; year?: number; status?: string }) => {
  const { token } = useAuth();

  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [tableData, setTableData] = useState<PayslipTableData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const generateEmployeeId = (userId: number): string => {
    return `EMP${userId.toString().padStart(4, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GENERATED': return 'bg-blue-100 text-blue-800';
      case 'PROCESSED': return 'bg-yellow-100 text-yellow-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const transformToTableData = (payslips: Payslip[]): PayslipTableData[] => {
    return payslips.map(p => ({
      id: p.id,
      employeeId: generateEmployeeId(p.userId),
      employeeName: p.user?.name || `Employee ${p.userId}`,
      month: p.month,
      year: p.year,
      monthName: `${monthNames[p.month - 1]} ${p.year}`,
      grossPay: p.grossPay,
      deductions: p.totalDeduct,
      netPay: p.netPay,
      status: p.status,
      statusColor: getStatusColor(p.status),
      createdAt: new Date(p.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      actions: isAdmin || p.userId === userId
    }));
  };

  const load = async () => {
    if (!token) {
      setPayslips([]);
      setTableData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;
      
      if (isAdmin) {
        response = await payslipApi.getAllPayslips(token, filters);
      } else if (userId) {
        response = await payslipApi.getMyPayslips(userId, token);
      }

      if (response?.success && response.data) {
        setPayslips(response.data);
        setTableData(transformToTableData(response.data));
      } else {
        setError(response?.error || 'Failed to load payslips');
        setPayslips([]);
        setTableData([]);
      }
    } catch (err: any) {
      console.error("Failed to load payslips", err);
      setError(err.message || 'Failed to load payslips');
      setPayslips([]);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token, userId, isAdmin, filters?.month, filters?.year, filters?.status]);

  return {
    payslips,
    tableData,
    loading,
    error,
    reload: load,
    monthNames
  };
};