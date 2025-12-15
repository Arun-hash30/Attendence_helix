import React, { useEffect, useState } from "react";
import { PageLayout } from "@voilajsx/uikit/page";
import { Card, CardContent, CardHeader, CardTitle } from "@voilajsx/uikit/card";
import { Button } from "@voilajsx/uikit/button";
import { ArrowLeft, Download, Printer, CheckCircle, Clock } from "lucide-react";
import { Header, Footer, SEO } from "../../../shared/components";
import { AuthGuard, useAuth } from "../../auth";
import { useParams, useNavigate } from "react-router-dom";
import { payslipApi } from "../services/payslip.api";
import { Payslip } from "../types/payslip";
import { Badge } from "@voilajsx/uikit/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@voilajsx/uikit/select";
import { Label } from "@voilajsx/uikit/label";

const PayslipDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [payslip, setPayslip] = useState<Payslip | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (id && token) {
      loadPayslip();
    }
  }, [id, token]);

  const loadPayslip = async () => {
    setLoading(true);
    try {
      const response = await payslipApi.getPayslip(Number(id), token!);
      if (response.success && response.data) {
        setPayslip(response.data);
      }
    } catch (error) {
      console.error("Failed to load payslip:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!token || !payslip) return;
    
    setUpdating(true);
    try {
      const response = await payslipApi.updatePayslipStatus(
        payslip.id, 
        newStatus as any, 
        token
      );
      
      if (response.success) {
        alert("✅ Payslip status updated successfully!");
        loadPayslip();
      } else {
        alert(`❌ ${response.error || "Failed to update status"}`);
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message || "Failed to update status"}`);
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert("PDF download feature would be implemented here");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'GENERATED': return <Clock className="h-4 w-4" />;
      case 'PROCESSED': return <Clock className="h-4 w-4" />;
      case 'PAID': return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GENERATED': return 'bg-blue-100 text-blue-800';
      case 'PROCESSED': return 'bg-yellow-100 text-yellow-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || '';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <PageLayout>
        <Header />
        <PageLayout.Content>
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </PageLayout.Content>
        <Footer />
      </PageLayout>
    );
  }

  if (!payslip) {
    return (
      <PageLayout>
        <Header />
        <PageLayout.Content>
          <div className="text-center py-12">
            <div className="text-red-400 mb-4 text-5xl">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payslip Not Found</h2>
            <p className="text-gray-600 mb-6">The requested payslip could not be found or you don't have access to it.</p>
            <Button asChild>
              <a href="/payslips">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Payslips
              </a>
            </Button>
          </div>
        </PageLayout.Content>
        <Footer />
      </PageLayout>
    );
  }

  return (
    <AuthGuard>
      <PageLayout>
        <SEO title={`Payslip - ${getMonthName(payslip.month)} ${payslip.year}`} />
        <Header />

        <PageLayout.Content>
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">Payslip Details</h1>
                <p className="text-gray-600 mt-1">
                  {getMonthName(payslip.month)} {payslip.year} • ID: #{payslip.id.toString().padStart(6, '0')}
                </p>
              </div>

              <div className="flex gap-3">
                <Button asChild variant="outline">
                  <a href="/payslips">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </a>
                </Button>
                
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>

            {/* Status Update Card (Admin only) */}
            {isAdmin && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                      <Label className="text-sm font-medium mb-2">Update Payslip Status</Label>
                      <div className="flex gap-3">
                        <Select
                          value={payslip.status}
                          onValueChange={(value) => handleStatusUpdate(value)}
                          disabled={updating}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GENERATED">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Generated
                              </div>
                            </SelectItem>
                            <SelectItem value="PROCESSED">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Processed
                              </div>
                            </SelectItem>
                            <SelectItem value="PAID">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Paid
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Current Status:</span>
                      <Badge className={`${getStatusColor(payslip.status)} flex items-center gap-1`}>
                        {getStatusIcon(payslip.status)}
                        {payslip.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Employee Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Employee Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500">Name</div>
                      <div className="font-medium">{payslip.user?.name || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Employee ID</div>
                      <div className="font-medium">EMP{payslip.userId.toString().padStart(4, '0')}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium">{payslip.user?.email || 'N/A'}</div>
                    </div>
                    {payslip.user?.phone && (
                      <div>
                        <div className="text-sm text-gray-500">Phone</div>
                        <div className="font-medium">{payslip.user.phone}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payslip Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Payslip Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500">Pay Period</div>
                      <div className="font-medium">{getMonthName(payslip.month)} {payslip.year}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Payslip ID</div>
                      <div className="font-medium">#{payslip.id.toString().padStart(6, '0')}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Generated On</div>
                      <div className="font-medium">{new Date(payslip.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Status</div>
                      <div>
                        <Badge className={getStatusColor(payslip.status)}>
                          {payslip.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">Gross Pay</div>
                      <div className="font-medium">{formatCurrency(payslip.grossPay)}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">Total Deductions</div>
                      <div className="font-medium text-red-600">{formatCurrency(payslip.totalDeduct)}</div>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-semibold">Net Pay</div>
                        <div className="text-2xl font-bold text-green-700">{formatCurrency(payslip.netPay)}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Earnings & Deductions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Earnings Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Earnings Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Component</th>
                        <th className="text-right py-2 font-medium">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(payslip.earnings).map(([key, value]) => (
                        <tr key={key} className="border-b">
                          <td className="py-2 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                          <td className="py-2 text-right">{formatCurrency(value)}</td>
                        </tr>
                      ))}
                      <tr className="font-semibold bg-gray-50">
                        <td className="py-3">Total Earnings</td>
                        <td className="py-3 text-right">{formatCurrency(payslip.grossPay)}</td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Deductions Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Deductions Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Component</th>
                        <th className="text-right py-2 font-medium">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(payslip.deductions).map(([key, value]) => (
                        <tr key={key} className="border-b">
                          <td className="py-2 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                          <td className="py-2 text-right text-red-600">{formatCurrency(value)}</td>
                        </tr>
                      ))}
                      <tr className="font-semibold bg-gray-50">
                        <td className="py-3">Total Deductions</td>
                        <td className="py-3 text-right text-red-600">{formatCurrency(payslip.totalDeduct)}</td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>

            {/* Printable Payslip (Hidden for normal view, visible when printing) */}
            <div className="hidden print:block bg-white p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">FresherBot Pvt. Ltd.</h1>
                <p className="text-gray-600">2nd Floor, Oyster Uptown, Hitech City, Hyderabad - 500081</p>
                <h2 className="text-2xl font-bold mt-8">PAYSLIP</h2>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-bold mb-2">Employee Details:</h3>
                  <p>Name: {payslip.user?.name || 'N/A'}</p>
                  <p>Employee ID: EMP{payslip.userId.toString().padStart(4, '0')}</p>
                  <p>Email: {payslip.user?.email || 'N/A'}</p>
                  <p>Pay Period: {getMonthName(payslip.month)} {payslip.year}</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Payslip Details:</h3>
                  <p>Payslip ID: #{payslip.id.toString().padStart(6, '0')}</p>
                  <p>Status: {payslip.status}</p>
                  <p>Generated On: {new Date(payslip.createdAt).toLocaleDateString()}</p>
                  <p>Print Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold mb-2 border-b pb-1">Earnings</h3>
                  {Object.entries(payslip.earnings).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span>₹{value.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold border-t pt-2 mt-2">
                    <span>Total Earnings</span>
                    <span>₹{payslip.grossPay.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-2 border-b pb-1">Deductions</h3>
                  {Object.entries(payslip.deductions).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span>₹{value.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold border-t pt-2 mt-2">
                    <span>Total Deductions</span>
                    <span>₹{payslip.totalDeduct.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t-2 text-center">
                <div className="text-2xl font-bold">
                  Net Pay: ₹{payslip.netPay.toFixed(2)}
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  This is a computer-generated payslip. No signature is required.
                </p>
              </div>
            </div>
          </div>
        </PageLayout.Content>

        <Footer />
      </PageLayout>
    </AuthGuard>
  );
};

export default PayslipDetailPage;