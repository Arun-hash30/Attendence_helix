import React, { useState } from "react";
import { PageLayout } from "@voilajsx/uikit/page";
import { Header, Footer, SEO } from "../../../shared/components";
import { useAuth } from "../../auth";
import { Button } from "@voilajsx/uikit/button";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@voilajsx/uikit/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@voilajsx/uikit/tabs";
import { Calendar, Filter, Download, PlusCircle } from "lucide-react";
import { useLeaveRequests } from "../hooks/useLeaveRequests";
import { useLeaveBalance } from "../hooks/useLeaveBalance";
import { LeaveRequestsTable } from "../components/LeaveRequestsTable";
import LeaveBalanceCard from "../components/LeaveBalanceCard"; // ✅ FIXED IMPORT
import { leaveApi } from "../services/leave.api";
import { LeaveBalance } from "../types/leave";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@voilajsx/uikit/select";
import { Input } from "@voilajsx/uikit/input";
import { Label } from "@voilajsx/uikit/label";

const MyLeavesPage: React.FC = () => {
  const { user, token } = useAuth();
  const userId = user?.id || 0;

  const [activeTab, setActiveTab] = useState("history");
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    year: new Date().getFullYear(),
    type: undefined as string | undefined,
  });

  const { tableData, loading, reload } = useLeaveRequests(userId, false, filters);
  const { balance, loading: balanceLoading } = useLeaveBalance(userId, filters.year);

  // Transform the balance data to match the expected type
  const transformBalanceData = (balanceData: any): LeaveBalance | null => {
    if (!balanceData) return null;
    
    return {
      id: balanceData.id || 0,
      userId: balanceData.userId || userId,
      year: balanceData.year || filters.year,
      casualTotal: balanceData.casualTotal || 12,
      casualUsed: balanceData.casualUsed || 0,
      sickTotal: balanceData.sickTotal || 12,
      sickUsed: balanceData.sickUsed || 0,
      annualTotal: balanceData.annualTotal || 15,
      annualUsed: balanceData.annualUsed || 0,
      createdAt: balanceData.createdAt || new Date().toISOString(),
      updatedAt: balanceData.updatedAt || new Date().toISOString(),
      user: balanceData.user || (user ? { name: user.name, email: user.email } : undefined)
    };
  };

  const leaveBalance = transformBalanceData(balance);

  const handleCancel = async (id: number) => {
    if (!token || !user) return;
    
    if (confirm("Are you sure you want to cancel this leave request?")) {
      try {
        await leaveApi.cancelLeave(id, user.id, token);
        reload();
      } catch (error) {
        console.error("Failed to cancel leave:", error);
        alert("Failed to cancel leave. Please try again.");
      }
    }
  };

  const handleDownloadHistory = async () => {
    if (!token) return;
    
    try {
      // This would typically generate a PDF or CSV
      // For now, we'll show a message
      alert("Download feature would generate a PDF/CSV of your leave history. This would be implemented with a backend PDF generation service.");
    } catch (error) {
      console.error("Failed to download history:", error);
      alert("Failed to download leave history.");
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

  const approvedLeaves = tableData.filter(l => l.status === 'APPROVED');
  const pendingLeaves = tableData.filter(l => l.status === 'PENDING');
  const rejectedLeaves = tableData.filter(l => l.status === 'REJECTED');
  const totalDaysUsed = approvedLeaves.reduce((sum, leave) => sum + leave.days, 0);

  return (
    <PageLayout>
      <SEO title="My Leave History" />
      <Header />

      <PageLayout.Content>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">My Leave History</h1>
              <p className="text-gray-600 mt-1">
                View your leave balance, history, and application status
              </p>
              {user?.name && (
                <p className="text-sm text-gray-500 mt-1">
                  Welcome, {user.name}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link to="/leaves/apply">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Apply for Leave
                </Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDownloadHistory}
              >
                <Download className="mr-2 h-4 w-4" />
                Download History
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="balance">Balance</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {pendingLeaves.length}
                      </div>
                      <div className="text-sm text-gray-600">Pending</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {approvedLeaves.length}
                      </div>
                      <div className="text-sm text-gray-600">Approved</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {rejectedLeaves.length}
                      </div>
                      <div className="text-sm text-gray-600">Rejected</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {totalDaysUsed.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Days Used</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Leave Balance Summary */}
              <LeaveBalanceCard 
                balance={leaveBalance} 
                loading={balanceLoading} 
                year={filters.year} 
              />

              {/* Recent Leave Requests */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Recent Leave Requests</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('history')}
                    >
                      View All
                    </Button>
                  </div>
                  {tableData.length > 0 ? (
                    <div className="space-y-3">
                      {tableData.slice(0, 5).map((leave) => (
                        <div key={leave.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {leave.fromDate} - {leave.toDate}
                            </div>
                            <div className="text-sm text-gray-500">
                              {leave.type} • {leave.days} days • {leave.reason || 'No reason'}
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${leave.statusColor}`}>
                            {leave.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No leave requests found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6 mt-6">
              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filter Leave History
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Select
                        value={filters.status || "all"}
                        onValueChange={(value) => setFilters({...filters, status: value === "all" ? undefined : value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="APPROVED">Approved</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={filters.type || "all"}
                        onValueChange={(value) => setFilters({...filters, type: value === "all" ? undefined : value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by type" />
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

                      <Input
                        type="number"
                        placeholder="Year (e.g., 2024)"
                        value={filters.year || ""}
                        onChange={(e) => {
                          const year = parseInt(e.target.value);
                          if (year >= 2000 && year <= 2100) {
                            setFilters({...filters, year});
                          } else if (e.target.value === "") {
                            setFilters({...filters, year: new Date().getFullYear()});
                          }
                        }}
                        min="2000"
                        max="2100"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Leave Requests Table */}
              <LeaveRequestsTable
                data={tableData}
                loading={loading}
                isAdmin={false}
                onCancel={handleCancel}
              />
            </TabsContent>

            {/* Balance Tab */}
            <TabsContent value="balance" className="space-y-6 mt-6">
              <LeaveBalanceCard 
                balance={leaveBalance} 
                loading={balanceLoading} 
                year={filters.year} 
              />

              {/* Detailed Usage */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Detailed Leave Usage</h3>
                  {tableData.length > 0 ? (
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Date</th>
                              <th className="text-left py-2">Type</th>
                              <th className="text-left py-2">Days</th>
                              <th className="text-left py-2">Status</th>
                              <th className="text-left py-2">Reason</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tableData.map((leave) => (
                              <tr key={leave.id} className="border-b hover:bg-gray-50">
                                <td className="py-2">{leave.fromDate} - {leave.toDate}</td>
                                <td className="py-2">{leave.type}</td>
                                <td className="py-2">{leave.days}</td>
                                <td className="py-2">
                                  <span className={`px-2 py-1 rounded-full text-xs ${leave.statusColor}`}>
                                    {leave.status}
                                  </span>
                                </td>
                                <td className="py-2 max-w-[200px] truncate">{leave.reason || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No leave history found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-blue-800 mb-2">Need to Apply for Leave?</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Submit a new leave request with all required details.
                </p>
                <Button asChild variant="outline" className="border-blue-300 text-blue-700">
                  <Link to="/leaves/apply">
                    Apply for Leave
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-green-800 mb-2">Leave Policy</h3>
                <p className="text-sm text-green-700 mb-4">
                  Review company leave policies and guidelines.
                </p>
                <Button asChild variant="outline" className="border-green-300 text-green-700">
                  <a href="/policy/leave" target="_blank" rel="noopener noreferrer">
                    View Policy
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageLayout.Content>

      <Footer />
    </PageLayout>
  );
};

export default MyLeavesPage;