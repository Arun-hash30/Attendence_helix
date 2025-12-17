import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@voilajsx/uikit/card";
import { Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { LeaveBalance } from "../types/leave";

interface LeaveBalanceCardProps {
  balance: LeaveBalance | null;
  loading: boolean;
  year: number;
}

const LeaveBalanceCard: React.FC<LeaveBalanceCardProps> = ({ 
  balance, 
  loading,
  year: propYear 
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'casual': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sick': return 'bg-green-100 text-green-800 border-green-200';
      case 'annual': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'maternity': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'paternity': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'unpaid': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'casual': return <Calendar className="h-4 w-4" />;
      case 'sick': return <AlertCircle className="h-4 w-4" />;
      case 'annual': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'casual': return 'Casual Leave';
      case 'sick': return 'Sick Leave';
      case 'annual': return 'Annual Leave';
      case 'maternity': return 'Maternity Leave';
      case 'paternity': return 'Paternity Leave';
      case 'unpaid': return 'Unpaid Leave';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Leave Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading leave balance...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!balance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Leave Balance ({propYear})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">Unable to Load Balance</h3>
            <p className="text-sm text-gray-500">
              Unable to load leave balance for {propYear}. Please try again later.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayYear = propYear || balance.year;
  
  const casualAvailable = balance.casualTotal - balance.casualUsed;
  const sickAvailable = balance.sickTotal - balance.sickUsed;
  const annualAvailable = balance.annualTotal - balance.annualUsed;

  const balanceItems = [
    { type: 'casual', total: balance.casualTotal, used: balance.casualUsed, available: casualAvailable },
    { type: 'sick', total: balance.sickTotal, used: balance.sickUsed, available: sickAvailable },
    { type: 'annual', total: balance.annualTotal, used: balance.annualUsed, available: annualAvailable },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Your Leave Balance ({displayYear})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {balanceItems.map((item) => (
              <div
                key={item.type}
                className={`border rounded-lg p-4 ${getTypeColor(item.type)} flex flex-col items-center justify-center`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(item.type)}
                  <span className="font-semibold">{getTypeLabel(item.type)}</span>
                </div>
                <div className="text-3xl font-bold mt-2">{item.available}</div>
                <div className="text-sm text-gray-600 mt-2 text-center">
                  <div>Available: <span className="font-semibold">{item.available}</span> days</div>
                  <div>Used: <span className="font-semibold">{item.used}</span> of {item.total}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-medium text-blue-800 mb-2">Balance Guidelines:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Casual Leave ({balance.casualTotal} days/year): For personal work or planned leaves</li>
                <li>• Sick Leave ({balance.sickTotal} days/year): For medical reasons</li>
                <li>• Annual Leave ({balance.annualTotal} days/year): For vacations and longer breaks</li>
                <li>• Submit leave applications at least 24 hours in advance</li>
                <li>• Emergency leaves require immediate manager approval</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaveBalanceCard;