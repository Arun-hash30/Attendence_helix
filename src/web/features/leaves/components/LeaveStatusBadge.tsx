import React from "react";
import { Badge } from "@voilajsx/uikit/badge";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

interface Props {
  status: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const LeaveStatusBadge: React.FC<Props> = ({ 
  status, 
  size = "md", 
  showIcon = true 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'PENDING':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Clock className="h-3 w-3" />,
          label: 'Pending'
        };
      case 'APPROVED':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="h-3 w-3" />,
          label: 'Approved'
        };
      case 'REJECTED':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <XCircle className="h-3 w-3" />,
          label: 'Rejected'
        };
      case 'CANCELLED':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'Cancelled'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <AlertCircle className="h-3 w-3" />,
          label: status
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  return (
    <Badge className={`${config.color} ${sizeClasses[size]} flex items-center gap-1`}>
      {showIcon && config.icon}
      {config.label}
    </Badge>
  );
};