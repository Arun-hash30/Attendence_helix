import { useState, useEffect, useCallback } from "react";
import { leaveApi } from "../services/leave.api";
import { LeaveTableData } from "../types/leave"; // Removed LeaveRequest
import { useAuth } from "../../auth";

export const useLeaveRequests = (
  userId?: number, 
  isAdmin?: boolean, 
  filters?: { 
    status?: string; 
    year?: number; 
    type?: string;
    userId?: number;
    page?: number;
    limit?: number;
  }
) => {
  const { token } = useAuth();

  const [tableData, setTableData] = useState<LeaveTableData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const generateEmployeeId = (userId: number): string => {
    return `EMP${userId.toString().padStart(4, '0')}`;
  };

  const transformLeaveToTableData = (leave: any, isAdmin?: boolean, currentUserId?: number): LeaveTableData => {
    let approvedBy: string | undefined;
    
    if (leave.approvedByUser?.name) {
      approvedBy = leave.approvedByUser.name;
    } else if (leave.approvedBy) {
      approvedBy = typeof leave.approvedBy === 'number' 
        ? String(leave.approvedBy) 
        : leave.approvedBy;
    }
    
    const approvedAt = leave.approvedAt ? formatDate(leave.approvedAt) : undefined;
    
    return {
      id: leave.id || 0,
      employeeId: generateEmployeeId(leave.userId || leave.user?.id || 0),
      employeeName: leave.user?.name || `Employee ${leave.userId || 0}`,
      type: leave.type || 'CASUAL',
      fromDate: formatDate(leave.fromDate || ''),
      toDate: formatDate(leave.toDate || ''),
      days: leave.days || 1,
      reason: leave.reason || '',
      status: leave.status || 'PENDING',
      statusColor: getStatusColor(leave.status || 'PENDING'),
      approvedBy,
      approvedAt,
      createdAt: formatDate(leave.createdAt || ''),
      actions: isAdmin || leave.userId === currentUserId
    };
  };

  const load = useCallback(async () => {
    if (!token) {
      setTableData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;
      
      if (isAdmin) {
        response = await leaveApi.getAllLeaves(token, filters);
      } else if (userId) {
        response = await leaveApi.getMyLeaves(userId, token, filters);
      } else {
        setTableData([]);
        setLoading(false);
        return;
      }

      console.log('Leave Requests API Response:', response);
      
      if (response?.success) {
        const responseData = response.data;
        
        console.log('Response data structure:', {
          hasData: !!responseData,
          responseDataType: typeof responseData,
          isArray: Array.isArray(responseData),
          hasDataProperty: responseData && 'data' in responseData,
          dataPropertyIsArray: responseData && 'data' in responseData && Array.isArray(responseData.data),
          hasPagination: responseData && 'pagination' in responseData
        });
        
        let leavesData: any[] = [];
        let paginationData: any = null;
        
        if (responseData) {
          if ('data' in responseData && Array.isArray(responseData.data)) {
            leavesData = responseData.data;
          } else if (Array.isArray(responseData)) {
            leavesData = responseData;
          }
          
          if ('pagination' in responseData) {
            paginationData = responseData.pagination;
          }
        }
        
        console.log('Extracted leaves data (count):', leavesData.length);
        console.log('Sample leave data:', leavesData[0]);
        
        if (leavesData.length > 0) {
          const transformedData: LeaveTableData[] = leavesData.map((leave: any) => 
            transformLeaveToTableData(leave, isAdmin, userId)
          );
          
          console.log('Transformed table data (first item):', transformedData[0]);
          
          setTableData(transformedData);
          setPagination(paginationData);
        } else {
          setTableData([]);
          setPagination(null);
          console.log('No leaves data found in response');
        }
      } else {
        setError(response?.error || 'Failed to load leave requests');
        setTableData([]);
        setPagination(null);
      }
    } catch (err: any) {
      console.error("Failed to load leave requests", err);
      setError(err.message || 'Failed to load leave requests');
      setTableData([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [token, userId, isAdmin, JSON.stringify(filters)]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    tableData,
    loading,
    error,
    pagination,
    reload: load,
    formatDate
  };
};