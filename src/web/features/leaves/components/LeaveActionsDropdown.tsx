import React from "react";
import { Button } from "@voilajsx/uikit/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@voilajsx/uikit/dropdown-menu";
import { MoreVertical, Eye, CheckCircle, XCircle, Calendar } from "lucide-react";

interface Props {
  leaveId: number;
  status: string;
  isAdmin?: boolean;
  onView?: (id: number) => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onCancel?: (id: number) => void;
}

export const LeaveActionsDropdown: React.FC<Props> = ({
  leaveId,
  status,
  isAdmin = false,
  onView,
  onApprove,
  onReject,
  onCancel
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onView?.(leaveId)}>
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
        
        {isAdmin && status === 'PENDING' && (
          <>
            <DropdownMenuItem 
              onClick={() => onApprove?.(leaveId)}
              className="text-green-600"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onReject?.(leaveId)}
              className="text-red-600"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </DropdownMenuItem>
          </>
        )}

        {!isAdmin && status === 'PENDING' && onCancel && (
          <DropdownMenuItem 
            onClick={() => onCancel?.(leaveId)}
            className="text-red-600"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancel Request
          </DropdownMenuItem>
        )}

        <DropdownMenuItem>
          <Calendar className="h-4 w-4 mr-2" />
          Add to Calendar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};