import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@voilajsx/uikit/dialog";
import { Button } from "@voilajsx/uikit/button";
import { Badge } from "@voilajsx/uikit/badge";
import { Card, CardContent } from "@voilajsx/uikit/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@voilajsx/uikit/tabs";
import {
  Calendar,
  User,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  X,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../../auth";
import { leaveApi } from "../services/leave.api";
import { LeaveRequest } from "../types/leave";

interface Props {
  leaveId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const LeaveViewModal: React.FC<Props> = ({ leaveId, isOpen, onClose }) => {
  const { token, user } = useAuth();
  const [leaveRequest, setLeaveRequest] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [updating, setUpdating] = useState(false);
  const [comments, setComments] = useState("");

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (isOpen && leaveId && token) {
      loadLeaveRequest();
    } else {
      setLeaveRequest(null);
      setLoading(true);
      setComments("");
    }
  }, [isOpen, leaveId, token]);

  const loadLeaveRequest = async () => {
    setLoading(true);
    try {
      const response = await leaveApi.getLeaveRequest(leaveId, token!);
      if (response.success && response.data) {
        setLeaveRequest(response.data);
      }
    } catch (error) {
      console.error("Failed to load leave request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!token || !user || !leaveRequest) return;
    
    if (status === "REJECTED" && !comments.trim()) {
      alert("Please provide comments when rejecting a leave request");
      return;
    }

    if (confirm(`Are you sure you want to ${status.toLowerCase()} this leave request?`)) {
      setUpdating(true);
      try {
        await leaveApi.updateLeaveStatus(
          leaveId,
          user.id,
          { status, comments: comments.trim() },
          token
        );
        await loadLeaveRequest();
        setComments("");
      } catch (error: any) {
        alert(error.message || "Failed to update status");
      } finally {
        setUpdating(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      default: return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CASUAL': return 'bg-blue-100 text-blue-800';
      case 'SICK': return 'bg-green-100 text-green-800';
      case 'ANNUAL': return 'bg-purple-100 text-purple-800';
      case 'MATERNITY': return 'bg-pink-100 text-pink-800';
      case 'PATERNITY': return 'bg-cyan-100 text-cyan-800';
      case 'UNPAID': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Loading Leave Request</DialogTitle>
            <DialogDescription>
              Please wait while we load the leave details...
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-500">Loading leave request information...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!leaveRequest) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Leave Request Not Found</DialogTitle>
            <DialogDescription>
              The requested leave could not be loaded.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-12">
            <div className="text-red-400 mb-4 text-6xl">❌</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Leave Request Not Found
            </h3>
            <p className="text-gray-500 mb-6">
              The leave request you are trying to view does not exist or you don't
              have permission to access it.
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl">Leave Request Details</DialogTitle>
              <DialogDescription>
                Request ID: #{leaveRequest.id.toString().padStart(6, '0')}
              </DialogDescription>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full mt-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="employee">Employee</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className={`${getStatusColor(leaveRequest.status)} flex items-center gap-1 text-lg px-4 py-2`}>
                  {getStatusIcon(leaveRequest.status)}
                  {leaveRequest.status}
                </Badge>
                <Badge className={getTypeColor(leaveRequest.type)}>
                  {leaveRequest.type} LEAVE
                </Badge>
                {leaveRequest.emergency && (
                  <Badge className="bg-red-100 text-red-800">
                    EMERGENCY
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Applied on {formatDate(leaveRequest.createdAt)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Leave Dates
                        </h4>
                        <p className="text-sm text-gray-500">
                          Duration and type of leave
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3 pl-10">
                      <div>
                        <div className="text-sm text-gray-500">From Date</div>
                        <div className="font-medium text-gray-900">
                          {formatDate(leaveRequest.fromDate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">To Date</div>
                        <div className="font-medium text-gray-900">
                          {formatDate(leaveRequest.toDate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Duration</div>
                        <div className="font-medium text-gray-900">
                          {leaveRequest.days} {leaveRequest.days === 1 ? 'day' : 'days'}
                          {leaveRequest.halfDay && ` (Half Day - ${leaveRequest.halfDayType})`}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Reason</div>
                        <div className="font-medium text-gray-900 mt-1 p-3 bg-gray-50 rounded">
                          {leaveRequest.reason || 'No reason provided'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Approval Information
                        </h4>
                        <p className="text-sm text-gray-500">
                          Status and approval details
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3 pl-10">
                      <div>
                        <div className="text-sm text-gray-500">Current Status</div>
                        <div>
                          <Badge className={getStatusColor(leaveRequest.status)}>
                            {leaveRequest.status}
                          </Badge>
                        </div>
                      </div>
                      {leaveRequest.approvedByUser && (
                        <>
                          <div>
                            <div className="text-sm text-gray-500">Approved By</div>
                            <div className="font-medium text-gray-900">
                              {leaveRequest.approvedByUser.name}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Approved At</div>
                            <div className="font-medium text-gray-900">
                              {formatDate(leaveRequest.approvedAt!)}
                            </div>
                          </div>
                        </>
                      )}
                      {leaveRequest.comments && (
                        <div>
                          <div className="text-sm text-gray-500">Comments</div>
                          <div className="font-medium text-gray-900 mt-1 p-3 bg-gray-50 rounded">
                            {leaveRequest.comments}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {isAdmin && leaveRequest.status === 'PENDING' && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Approve/Reject Leave</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Comments (Optional)</label>
                        <textarea
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          placeholder="Add comments for your decision..."
                          className="w-full p-3 border rounded-md min-h-[100px]"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleStatusUpdate('APPROVED')}
                          disabled={updating}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          {updating ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Approve Leave
                        </Button>
                        <Button
                          onClick={() => handleStatusUpdate('REJECTED')}
                          disabled={updating || !comments.trim()}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                          {updating ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          Reject Leave
                        </Button>
                      </div>
                      {!comments.trim() && (
                        <p className="text-sm text-red-600">
                          Comments are required when rejecting a leave request.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="employee" className="space-y-6 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Employee Information
                      </h4>
                      <p className="text-sm text-gray-500">
                        Personal and contact details
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 pl-10">
                    <div>
                      <div className="text-sm text-gray-500">Name</div>
                      <div className="font-medium text-gray-900">
                        {leaveRequest.user?.name || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {leaveRequest.user?.email || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Employee ID</div>
                      <div className="font-medium text-gray-900">
                        EMP{leaveRequest.userId.toString().padStart(4, '0')}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Request Timeline
                      </h4>
                      <p className="text-sm text-gray-500">
                        History of this leave request
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4 pl-10">
                    <div className="relative">
                      <div className="absolute left-[-20px] top-0 bottom-0 w-0.5 bg-gray-200"></div>
                      
                      <div className="relative pb-8">
                        <div className="absolute left-[-24px] top-1 w-3 h-3 rounded-full bg-green-500"></div>
                        <div>
                          <div className="font-medium">Leave Request Created</div>
                          <div className="text-sm text-gray-500">
                            {formatDate(leaveRequest.createdAt)}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Employee applied for {leaveRequest.days} days of {leaveRequest.type.toLowerCase()} leave
                          </div>
                        </div>
                      </div>

                      {leaveRequest.status !== 'PENDING' && (
                        <div className="relative pb-8">
                          <div className="absolute left-[-24px] top-1 w-3 h-3 rounded-full bg-blue-500"></div>
                          <div>
                            <div className="font-medium">Leave Request {leaveRequest.status}</div>
                            <div className="text-sm text-gray-500">
                              {formatDate(leaveRequest.updatedAt)}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {leaveRequest.status === 'APPROVED' ? 'Approved' : 'Rejected'} by {leaveRequest.approvedByUser?.name || 'admin'}
                              {leaveRequest.comments && (
                                <div className="mt-2 p-3 bg-gray-50 rounded">
                                  <div className="flex items-start gap-2">
                                    <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                                    <div>
                                      <div className="font-medium text-sm">Comments:</div>
                                      <div>{leaveRequest.comments}</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {leaveRequest.status === 'PENDING' && (
                        <div className="relative">
                          <div className="absolute left-[-24px] top-1 w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div>
                            <div className="font-medium">Awaiting Approval</div>
                            <div className="text-sm text-gray-500">
                              Currently pending review
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              Leave request is waiting for manager approval
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {isAdmin && leaveRequest.status === 'PENDING' && (
            <Button
              onClick={() => handleStatusUpdate('APPROVED')}
              disabled={updating}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {updating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Approve
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};