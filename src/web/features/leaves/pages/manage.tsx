import React, { useState, useEffect } from "react";
import { PageLayout } from "@voilajsx/uikit/page";
import { Header, Footer, SEO } from "../../../shared/components";
import { AuthGuard, useAuth } from "../../auth";
import { Button } from "@voilajsx/uikit/button";
import { Card, CardContent } from "@voilajsx/uikit/card";
import { Tabs, TabsList, TabsTrigger } from "@voilajsx/uikit/tabs"; // Removed TabsContent
import { Users, Filter, Download, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useLeaveRequests } from "../hooks/useLeaveRequests";
import { LeaveRequestsTable } from "../components/LeaveRequestsTable";
import { leaveApi } from "../services/leave.api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@voilajsx/uikit/select";
import { Input } from "@voilajsx/uikit/input";
import { Label } from "@voilajsx/uikit/label";

const ManageLeavesPage: React.FC = () => {
  const { user, token } = useAuth();
  const isAdmin = user?.role === "admin";

  const [activeTab, setActiveTab] = useState("pending");
  const [filters, setFilters] = useState({
    status: "PENDING" as string | undefined,
    year: new Date().getFullYear(),
    type: undefined as string | undefined,
    userId: undefined as number | undefined,
    page: 1,
    limit: 10
  });

  const [allUsers, setAllUsers] = useState<{id: number, name: string}[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const { tableData, loading, reload, pagination } = useLeaveRequests(
    undefined,
    true,
    filters
  );

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    if (!token) return;
    
    setLoadingUsers(true);
    try {
      const response = await leaveApi.getUsersForLeaveManagement(token);
      if (response.success && response.data) {
        setAllUsers(response.data.map(user => ({
          id: user.id,
          name: user.name
        })));
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!token || !user) return;
    
    if (confirm("Are you sure you want to approve this leave request?")) {
      try {
        await leaveApi.updateLeaveStatus(id, user.id, { status: "APPROVED" }, token);
        reload();
      } catch (error) {
        console.error("Failed to approve leave:", error);
        alert("Failed to approve leave. Please try again.");
      }
    }
  };

  const handleReject = async (id: number) => {
    if (!token || !user) return;
    
    const comments = prompt("Please provide reason for rejection:");
    if (comments === null) return;
    
    if (!comments.trim()) {
      alert("Comments are required when rejecting a leave request.");
      return;
    }

    if (confirm("Are you sure you want to reject this leave request?")) {
      try {
        await leaveApi.updateLeaveStatus(id, user.id, { status: "REJECTED", comments }, token);
        reload();
      } catch (error) {
        console.error("Failed to reject leave:", error);
        alert("Failed to reject leave. Please try again.");
      }
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setFilters({
      ...filters,
      status: tab === "all" ? undefined : tab === "pending" ? "PENDING" : tab.toUpperCase(),
      page: 1
    });
  };

  const handleDownloadReport = async () => {
    if (!token) return;
    
    try {
      alert("Report download feature would generate a comprehensive leave report.");
    } catch (error) {
      console.error("Failed to download report:", error);
      alert("Failed to download report.");
    }
  };

  const leaveTypes = [
    { value: 'CASUAL', label: 'Casual' },
    { value: 'SICK', label: 'Sick' },
    { value: 'ANNUAL', label: 'Annual' },
    { value: 'MATERNITY', label: 'Maternity' },
    { value: 'PATERNITY', label: 'Paternity' },
    { value: 'UNPAID', label: 'Unpaid' },
  ];

  const pendingCount = tableData.filter(l => l.status === 'PENDING').length;
  const approvedCount = tableData.filter(l => l.status === 'APPROVED').length;
  const rejectedCount = tableData.filter(l => l.status === 'REJECTED').length;

  if (!isAdmin) {
    return (
      <PageLayout>
        <Header />
        <PageLayout.Content>
          <div className="flex justify-center items-center h-screen">
            <div className="text-center">
              <div className="text-red-400 mb-4 text-5xl">🔒</div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to access this page.</p>
            </div>
          </div>
        </PageLayout.Content>
        <Footer />
      </PageLayout>
    );
  }

  return (
    <AuthGuard>
      <PageLayout>
        <SEO title="Manage Leaves" />
        <Header />

        <PageLayout.Content>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">Leave Management</h1>
                <p className="text-gray-600 mt-1">
                  Approve, reject, and manage employee leave requests
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleDownloadReport}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      status: undefined,
                      year: new Date().getFullYear(),
                      type: undefined,
                      userId: undefined,
                      page: 1,
                      limit: 10
                    });
                    setActiveTab("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {pendingCount}
                    </div>
                    <div className="text-sm text-gray-600">Pending Approval</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {approvedCount}
                    </div>
                    <div className="text-sm text-gray-600">Approved</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {rejectedCount}
                    </div>
                    <div className="text-sm text-gray-600">Rejected</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Pending
                  {pendingCount > 0 && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Approved
                </TabsTrigger>
                <TabsTrigger value="rejected" className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Rejected
                </TabsTrigger>
                <TabsTrigger value="all">All Leaves</TabsTrigger>
              </TabsList>

              {/* Content Area */}
              <div className="mt-6 space-y-6">
                {/* Filters */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Advanced Filters
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Employee</Label>
                          <Select
                            value={filters.userId?.toString() || "all"}
                            onValueChange={(value) => setFilters({
                              ...filters, 
                              userId: value === "all" ? undefined : parseInt(value),
                              page: 1
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Employees</SelectItem>
                              {loadingUsers ? (
                                <SelectItem value="loading" disabled>
                                  Loading users...
                                </SelectItem>
                              ) : (
                                allUsers.map((user) => (
                                  <SelectItem key={user.id} value={user.id.toString()}>
                                    {user.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Leave Type</Label>
                          <Select
                            value={filters.type || "all"}
                            onValueChange={(value) => setFilters({
                              ...filters, 
                              type: value === "all" ? undefined : value,
                              page: 1
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              {leaveTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Year</Label>
                          <Input
                            type="number"
                            value={filters.year || ""}
                            onChange={(e) => {
                              const year = parseInt(e.target.value);
                              if (year >= 2000 && year <= 2100) {
                                setFilters({
                                  ...filters, 
                                  year,
                                  page: 1
                                });
                              } else if (e.target.value === "") {
                                setFilters({
                                  ...filters, 
                                  year: new Date().getFullYear(),
                                  page: 1
                                });
                              }
                            }}
                            min="2000"
                            max="2100"
                            placeholder="Year"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={filters.status || "all"}
                            onValueChange={(value) => setFilters({
                              ...filters, 
                              status: value === "all" ? undefined : value,
                              page: 1
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="PENDING">Pending</SelectItem>
                              <SelectItem value="APPROVED">Approved</SelectItem>
                              <SelectItem value="REJECTED">Rejected</SelectItem>
                              <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Leave Requests Table */}
                <LeaveRequestsTable
                  data={tableData}
                  loading={loading}
                  isAdmin={true}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFilters({
                              ...filters,
                              page: (pagination.page || 1) - 1
                            })}
                            disabled={pagination.page === 1}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFilters({
                              ...filters,
                              page: (pagination.page || 1) + 1
                            })}
                            disabled={pagination.page === pagination.totalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Empty State */}
                {!loading && tableData.length === 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Leave Requests Found</h3>
                        <p className="text-gray-500">
                          {filters.status === 'PENDING' 
                            ? "No pending leave requests at the moment."
                            : "No leave requests match your filters."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </Tabs>

            {/* Management Guidelines */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-blue-800 mb-4">📋 Leave Approval Guidelines:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-blue-700 mb-2">For Approval:</h4>
                    <ul className="text-sm text-blue-600 space-y-1">
                      <li>• Check employee's leave balance before approval</li>
                      <li>• Consider team coverage during the leave period</li>
                      <li>• Verify emergency leaves have proper justification</li>
                      <li>• Ensure compliance with company leave policies</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-700 mb-2">For Rejection:</h4>
                    <ul className="text-sm text-blue-600 space-y-1">
                      <li>• Always provide clear reasoning for rejection</li>
                      <li>• Consider alternative dates if possible</li>
                      <li>• Check for overlapping critical business periods</li>
                      <li>• Document all rejected leave requests</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </PageLayout.Content>

        <Footer />
      </PageLayout>
    </AuthGuard>
  );
};

export default ManageLeavesPage;