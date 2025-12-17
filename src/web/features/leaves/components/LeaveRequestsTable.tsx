import React, { useState } from "react"; // Removed useEffect import
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@voilajsx/uikit/table";
import { Button } from "@voilajsx/uikit/button";
import { Badge } from "@voilajsx/uikit/badge";
import { Eye, CheckCircle, XCircle, MoreVertical, Calendar, Clock, User, FileText } from "lucide-react";
import { LeaveTableData } from "../types/leave";
import { LeaveViewModal } from "./LeaveViewModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@voilajsx/uikit/dropdown-menu";

interface Props {
  data: LeaveTableData[];
  loading: boolean;
  isAdmin?: boolean;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onCancel?: (id: number) => void;
}

export const LeaveRequestsTable: React.FC<Props> = ({
  data,
  loading,
  isAdmin = false,
  onApprove,
  onReject,
  onCancel
}) => {
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  console.log('LeaveRequestsTable Component Debug:', {
    dataLength: data?.length || 0,
    isLoading: loading,
    isAdmin: isAdmin,
    dataSample: data?.slice(0, 2),
  });

  const handleView = (id: number) => {
    console.log('Viewing leave ID:', id);
    setSelectedLeaveId(id);
    setViewModalOpen(true);
  };

  const handleApprove = (id: number) => {
    console.log('Approving leave ID:', id);
    if (onApprove) {
      onApprove(id);
    }
  };

  const handleReject = (id: number) => {
    console.log('Rejecting leave ID:', id);
    if (onReject) {
      onReject(id);
    }
  };

  const handleCancel = (id: number) => {
    console.log('Cancelling leave ID:', id);
    if (onCancel) {
      onCancel(id);
    }
  };

  const getTypeColor = (type: string) => {
    if (!type) return 'bg-gray-100 text-gray-800';
    
    switch (type.toUpperCase()) {
      case 'CASUAL': return 'bg-blue-100 text-blue-800';
      case 'SICK': return 'bg-green-100 text-green-800';
      case 'ANNUAL': return 'bg-purple-100 text-purple-800';
      case 'MATERNITY': return 'bg-pink-100 text-pink-800';
      case 'PATERNITY': return 'bg-cyan-100 text-cyan-800';
      case 'UNPAID': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    if (!type) return <FileText className="h-3 w-3 mr-1" />;
    
    switch (type.toUpperCase()) {
      case 'CASUAL': return <Calendar className="h-3 w-3 mr-1" />;
      case 'SICK': return <FileText className="h-3 w-3 mr-1" />;
      case 'ANNUAL': return <Calendar className="h-3 w-3 mr-1" />;
      default: return <FileText className="h-3 w-3 mr-1" />;
    }
  };

  const getStatusIcon = (status: string) => {
    if (!status) return <Clock className="h-3 w-3 mr-1" />;
    
    switch (status.toUpperCase()) {
      case 'APPROVED': return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'REJECTED': return <XCircle className="h-3 w-3 mr-1" />;
      case 'PENDING': return <Clock className="h-3 w-3 mr-1" />;
      case 'CANCELLED': return <XCircle className="h-3 w-3 mr-1" />;
      default: return <Clock className="h-3 w-3 mr-1" />;
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toUpperCase()) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading leave requests...</p>
          </div>
        </div>
        
        <div className="rounded-md border animate-pulse">
          <div className="h-12 bg-gray-100 border-b"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 border-b flex items-center px-4">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/6"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16 mx-4"></div>
              <div className="h-6 bg-gray-200 rounded w-24 mx-4"></div>
              <div className="h-6 bg-gray-200 rounded w-12 mx-4"></div>
              <div className="h-6 bg-gray-200 rounded w-20 mx-4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4 text-5xl">📅</div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No leave requests found</h3>
        <p className="text-gray-500 mb-6">No leave requests have been submitted yet.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Check leave policies
          </Button>
          <Button className="gap-2">
            <FileText className="h-4 w-4" />
            Apply for leave
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Leave Requests</h3>
            <p className="text-sm text-gray-500">
              Showing {data.length} leave request{data.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <User className="h-3 w-3" />
              {isAdmin ? 'Admin View' : 'My Leaves'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Employee
                </div>
              </TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  From - To
                </div>
              </TableHead>
              <TableHead className="font-semibold">Days</TableHead>
              <TableHead className="font-semibold">Reason</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Applied On</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((leave) => {
              console.log('Rendering leave item:', leave);
              
              return (
                <TableRow 
                  key={leave.id} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {leave.employeeName || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {leave.employeeId || 'N/A'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getTypeColor(leave.type)} flex items-center gap-1`}>
                      {getTypeIcon(leave.type)}
                      {leave.type || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="font-medium">{leave.fromDate || 'N/A'}</span>
                      </div>
                      <div className="text-xs text-gray-500 ml-4">
                        to {leave.toDate || 'N/A'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-center">{leave.days || 0}</div>
                    {leave.days === 0.5 && (
                      <div className="text-xs text-gray-500 text-center">Half Day</div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="truncate" title={leave.reason}>
                      {leave.reason || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(leave.status)} flex items-center gap-1`}>
                      {getStatusIcon(leave.status)}
                      {leave.status || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{leave.createdAt || 'N/A'}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(leave.id)}
                        title="View Details"
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {isAdmin && leave.status?.toUpperCase() === 'PENDING' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleApprove(leave.id)}
                              className="text-green-600 cursor-pointer"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleReject(leave.id)}
                              className="text-red-600 cursor-pointer"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}

                      {!isAdmin && leave.status?.toUpperCase() === 'PENDING' && onCancel && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancel(leave.id)}
                          title="Cancel Request"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between text-sm text-gray-500">
        <div>
          Showing {data.length} of {data.length} leave requests
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-100 border border-green-300"></div>
            <span>Approved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-100 border border-yellow-300"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-100 border border-red-300"></div>
            <span>Rejected</span>
          </div>
        </div>
      </div>

      {selectedLeaveId && (
        <LeaveViewModal
          leaveId={selectedLeaveId}
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedLeaveId(null);
          }}
        />
      )}
    </>
  );
};