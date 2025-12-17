import { useState, useEffect, useCallback } from "react";
import { leaveApi } from "../services/leave.api";
import { LeaveBalance } from "../types/leave";
import { useAuth } from "../../auth";

export const useLeaveBalance = (userId: number, year?: number) => {
  const { token } = useAuth();

  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || !userId) {
      // Return default balance if no token/userId
      const defaultBalance: LeaveBalance = {
        id: 0,
        userId: userId || 0,
        year: year || new Date().getFullYear(),
        casualTotal: 12,
        casualUsed: 0,
        sickTotal: 12,
        sickUsed: 0,
        annualTotal: 15,
        annualUsed: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setBalance(defaultBalance);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await leaveApi.getLeaveBalance(userId, year, token);
      
      console.log('Leave Balance API Response:', response); // Debug
      
      if (response?.success) {
        // response.data should be a LeaveBalance object
        if (response.data) {
          // Ensure the user property is properly typed
          const balanceData = {
            ...response.data,
            user: response.data.user || undefined
          } as LeaveBalance;
          
          setBalance(balanceData);
        } else {
          // If no data, use defaults
          const defaultBalance: LeaveBalance = {
            id: 0,
            userId: userId,
            year: year || new Date().getFullYear(),
            casualTotal: 12,
            casualUsed: 0,
            sickTotal: 12,
            sickUsed: 0,
            annualTotal: 15,
            annualUsed: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          setBalance(defaultBalance);
          setError('No balance data returned, using default values');
        }
      } else {
        setError(response?.error || 'Failed to load leave balance');
        
        // Use default balance on API error
        const defaultBalance: LeaveBalance = {
          id: 0,
          userId: userId,
          year: year || new Date().getFullYear(),
          casualTotal: 12,
          casualUsed: 0,
          sickTotal: 12,
          sickUsed: 0,
          annualTotal: 15,
          annualUsed: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setBalance(defaultBalance);
      }
    } catch (err: any) {
      console.error("Failed to load leave balance", err);
      setError(err.message || 'Failed to load leave balance');
      
      // Use default balance on error
      const defaultBalance: LeaveBalance = {
        id: 0,
        userId: userId,
        year: year || new Date().getFullYear(),
        casualTotal: 12,
        casualUsed: 0,
        sickTotal: 12,
        sickUsed: 0,
        annualTotal: 15,
        annualUsed: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setBalance(defaultBalance);
    } finally {
      setLoading(false);
    }
  }, [token, userId, year]);

  useEffect(() => {
    if (userId) {
      load();
    }
  }, [load]);

  const calculateAvailable = (total: number, used: number) => {
    return Math.max(0, total - used);
  };

  const casualAvailable = balance ? calculateAvailable(balance.casualTotal, balance.casualUsed) : 0;
  const sickAvailable = balance ? calculateAvailable(balance.sickTotal, balance.sickUsed) : 0;
  const annualAvailable = balance ? calculateAvailable(balance.annualTotal, balance.annualUsed) : 0;

  return {
    balance,
    loading,
    error,
    reload: load,
    calculateAvailable,
    casualAvailable,
    sickAvailable,
    annualAvailable
  };
};