import React, { useState } from "react";
import { PageLayout } from "@voilajsx/uikit/page";
import { Header, Footer, SEO } from "../../../shared/components";
import { usePayslips } from "../hooks/usePayslips";
import { useAuth } from "../../auth";
import { Button } from "@voilajsx/uikit/button";
import { Link } from "react-router-dom";
import { PayslipsTable } from "../components/PayslipsTable";
import { payslipApi } from "../services/payslip.api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@voilajsx/uikit/select";
import { Input } from "@voilajsx/uikit/input";
import { Card, CardContent } from "@voilajsx/uikit/card";
import { Filter, AlertCircle } from "lucide-react";
import { Label } from "@voilajsx/uikit/label";
import { Alert, AlertDescription } from "@voilajsx/uikit/alert";

const IndexPage: React.FC = () => {
  const { user, token } = useAuth();
  const isAdmin = user?.role === "admin";
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    month: undefined as number | undefined,
    year: new Date().getFullYear(),
    status: undefined as string | undefined,
  });

  const { tableData, loading, reload, error: payslipError } = usePayslips(
    isAdmin ? undefined : user?.id, // Pass userId only for non-admin users
    isAdmin, 
    isAdmin ? filters : undefined // Only apply filters for admin
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this payslip? This action cannot be undone.")) return;
    
    if (!token) {
      setError("Authentication required. Please login again.");
      return;
    }
    
    try {
      const response = await payslipApi.deletePayslip(id, token);
      if (response.success) {
        reload();
      } else {
        setError(response.error || "Failed to delete payslip");
      }
    } catch (error) {
      console.error("Failed to delete payslip:", error);
      setError("Failed to delete payslip. Please try again.");
    }
  };

  const monthNames = [
    'All Months', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calculate statistics safely
  const totalPayslips = tableData.length;
  const totalNetPay = tableData.reduce((sum, p) => sum + p.netPay, 0);
  const paidPayslips = tableData.filter(p => p.status === 'PAID').length;

  return (
    <PageLayout>
      <SEO title={isAdmin ? "All Payslips" : "My Payslips"} />
      <Header />

      <PageLayout.Content>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                {isAdmin ? "All Payslips" : "My Payslips"}
              </h1>
              <p className="text-gray-600 mt-1">
                {isAdmin 
                  ? "Manage and view all employee payslips" 
                  : "View your salary slips and payment history"}
              </p>
              {!isAdmin && user?.name && (
                <p className="text-sm text-gray-500 mt-1">
                  Welcome, {user.name}
                </p>
              )}
            </div>

            {isAdmin && (
              <div className="flex gap-3">
                <Button asChild variant="outline">
                  <Link to="/payslips/salary">Create Salary Structure</Link>
                </Button>
                <Button asChild>
                  <Link to="/payslips/generate">Generate Payslips</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Error Alerts */}
          {(error || payslipError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || payslipError}
              </AlertDescription>
            </Alert>
          )}

          {/* Filters (Admin only) */}
          {isAdmin && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filter Payslips
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Select
                        value={filters.month?.toString() || "0"}
                        onValueChange={(value) => 
                          setFilters({...filters, month: value === "0" ? undefined : parseInt(value)})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          {monthNames.map((month, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {month}
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

                      <Select
                        value={filters.status || "all"}
                        onValueChange={(value) => 
                          setFilters({...filters, status: value === "all" ? undefined : value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="GENERATED">Generated</SelectItem>
                          <SelectItem value="PROCESSED">Processed</SelectItem>
                          <SelectItem value="PAID">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilters({
                        month: undefined,
                        year: new Date().getFullYear(),
                        status: undefined
                      });
                      setError(null);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {totalPayslips}
                  </div>
                  <div className="text-sm text-gray-600">Total Payslips</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ₹{totalNetPay.toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm text-gray-600">Total Net Pay</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {paidPayslips}
                  </div>
                  <div className="text-sm text-gray-600">Paid Payslips</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payslips Table */}
          <PayslipsTable
            data={tableData}
            loading={loading}
            isAdmin={isAdmin}
            onDelete={handleDelete}
          />

          {/* Empty State for Regular Users */}
          {!isAdmin && !loading && tableData.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-gray-400 text-5xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Payslips Yet</h3>
                <p className="text-gray-500 mb-6">
                  You don't have any payslips generated yet.
                </p>
                <p className="text-sm text-gray-400">
                  Payslips will appear here once they are generated by HR/Admin.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Help Text */}
          <div className="text-center text-sm text-gray-500 mt-8">
            <p>
              💡 <strong>Note:</strong> {isAdmin 
                ? "Click on the action menu (⋮) to view, download, or manage payslips"
                : "Contact HR/Admin if you believe there should be payslips here"}
            </p>
          </div>
        </div>
      </PageLayout.Content>

      <Footer />
    </PageLayout>
  );
};


export default IndexPage;