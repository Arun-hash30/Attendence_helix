import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@voilajsx/uikit/dialog";
import { Button } from "@voilajsx/uikit/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@voilajsx/uikit/tabs";
import { Badge } from "@voilajsx/uikit/badge";
import {
  Download,
  Printer,
  Loader2,
  X,
  Calendar,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { useAuth } from "../../auth";
import { payslipApi } from "../services/payslip.api";
import { Payslip } from "../types/payslip";

interface Props {
  payslipId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const PayslipViewModal: React.FC<Props> = ({
  payslipId,
  isOpen,
  onClose,
}) => {
  const { token } = useAuth();
  const [payslip, setPayslip] = useState<Payslip | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (isOpen && payslipId && token) {
      loadPayslip();
    } else {
      setPayslip(null);
      setLoading(true);
    }
  }, [isOpen, payslipId, token]);

  const loadPayslip = async () => {
    setLoading(true);
    try {
      console.log("Loading payslip:", payslipId);
      const response = await payslipApi.getPayslip(payslipId, token!);
      console.log("Payslip response:", response);
      if (response.success && response.data) {
        setPayslip(response.data);
      } else {
        console.error("Failed to load payslip:", response.error);
      }
    } catch (error) {
      console.error("Failed to load payslip:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateEmployeeId = (userId: number): string => {
    return `EMP${userId.toString().padStart(4, "0")}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[month - 1] || "";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "GENERATED":
        return "bg-blue-100 text-blue-800";
      case "PROCESSED":
        return "bg-yellow-100 text-yellow-800";
      case "PAID":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handlePrint = () => {
    if (!payslip) {
      console.error("Cannot print: No payslip data available");
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${getMonthName(payslip.month)} ${payslip.year}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; margin: 0; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-name { font-size: 28px; font-weight: bold; color: #1e40af; }
          .address { color: #666; margin: 10px 0 20px; font-size: 14px; line-height: 1.4; }
          .payslip-title { font-size: 24px; margin: 20px 0; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .info-section { margin-bottom: 20px; }
          .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #ddd; }
          .info-table td { padding: 10px; border: 1px solid #ddd; }
          .info-table tr:nth-child(even) { background-color: #f9f9f9; }
          .earnings-deductions { display: flex; gap: 30px; margin: 30px 0; }
          .section { flex: 1; }
          .section h3 { background-color: #f5f5f5; padding: 10px; margin: 0; border: 1px solid #ddd; border-bottom: none; }
          .section table { width: 100%; border-collapse: collapse; border: 1px solid #ddd; }
          .section th, .section td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          .section th { background-color: #f5f5f5; font-weight: bold; }
          .total-row { font-weight: bold; background-color: #f0f9ff; }
          .net-pay { text-align: center; font-size: 24px; font-weight: bold; color: #059669; margin: 40px 0; padding: 20px; background-color: #f0fdf4; border-radius: 8px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
          @media print { 
            body { padding: 20px; }
            @page { margin: 20mm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">FRESHERBOT PRIVATE LIMITED</div>
          <div class="address">
            2nd Floor, Oyster Uptown, Beside Durgam Cheruvu Metro Station,<br>
            Hitech City, Hyderabad – 500081<br>
            Tel: +91 7032309797 | Email: info@fresherbot.com | Web: https://fresherbot.com
          </div>
          <div class="payslip-title">PAYSLIP</div>
        </div>
        
        <div class="info-section">
          <table class="info-table">
            <tr>
              <td><strong>Employee Name:</strong> ${payslip.user?.name || "N/A"}</td>
              <td><strong>Employee ID:</strong> ${generateEmployeeId(
                payslip.userId
              )}</td>
            </tr>
            <tr>
              <td><strong>Email:</strong> ${payslip.user?.email || "N/A"}</td>
              <td><strong>Pay Period:</strong> ${getMonthName(
                payslip.month
              )} ${payslip.year}</td>
            </tr>
            <tr>
              <td><strong>Payslip ID:</strong> #${payslip.id
                .toString()
                .padStart(6, "0")}</td>
              <td><strong>Status:</strong> ${payslip.status}</td>
            </tr>
          </table>
        </div>
        
        <div class="earnings-deductions">
          <div class="section">
            <h3>EARNINGS</h3>
            <table>
              <thead>
                <tr><th>Component</th><th>Amount (₹)</th></tr>
              </thead>
              <tbody>
                ${Object.entries(payslip.earnings)
                  .map(
                    ([key, value]) => `
                  <tr>
                    <td>${key
                      .charAt(0)
                      .toUpperCase()}${key
                      .slice(1)
                      .replace(/([A-Z])/g, " $1")}</td>
                    <td>${value.toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join("")}
                <tr class="total-row">
                  <td>Gross Pay</td>
                  <td>${payslip.grossPay.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h3>DEDUCTIONS</h3>
            <table>
              <thead>
                <tr><th>Component</th><th>Amount (₹)</th></tr>
              </thead>
              <tbody>
                ${Object.entries(payslip.deductions)
                  .map(
                    ([key, value]) => `
                  <tr>
                    <td>${key
                      .charAt(0)
                      .toUpperCase()}${key
                      .slice(1)
                      .replace(/([A-Z])/g, " $1")}</td>
                    <td>${value.toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join("")}
                <tr class="total-row">
                  <td>Total Deductions</td>
                  <td>${payslip.totalDeduct.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="net-pay">
          NET PAY: ₹${payslip.netPay.toFixed(2)}
        </div>
        
        <div class="footer">
          <p>This is a system-generated payslip. No signature is required.</p>
          <p>For any queries, please contact HR Department at hr@fresherbot.com</p>
          <p>Generated on: ${new Date(payslip.createdAt).toLocaleDateString(
            "en-IN",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          )}</p>
        </div>
      </body>
      </html>
    `;

    try {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();

        // Add a small delay before printing to ensure content is loaded
        const printAfterLoad = () => {
          setTimeout(() => {
            printWindow.print();
          }, 250);
        };

        if (printWindow.document.readyState === "complete") {
          printAfterLoad();
        } else {
          printWindow.addEventListener("load", printAfterLoad);
        }
      } else {
        console.error("Failed to open print window");
        alert(
          "Please allow pop-ups for this site to enable printing functionality."
        );
      }
    } catch (error) {
      console.error("Print error:", error);
      alert("Failed to print payslip. Please try again.");
    }
  };

  const handleDownload = () => {
    if (!payslip) {
      console.error("Cannot download: No payslip data available");
      return;
    }
    
    // For now, we'll use the print functionality
    // In a real app, you would generate an actual PDF here
    handlePrint();
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Loading Payslip</DialogTitle>
            <DialogDescription>
              Please wait while we load the payslip details...
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-500">Loading payslip information...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!payslip) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payslip Not Found</DialogTitle>
            <DialogDescription>
              The requested payslip could not be loaded.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-12">
            <div className="text-red-400 mb-4 text-6xl">❌</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Payslip Not Found
            </h3>
            <p className="text-gray-500 mb-6">
              The payslip you are trying to view does not exist or you don't
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
              <DialogTitle className="text-2xl">Payslip Details</DialogTitle>
              <DialogDescription>
                {getMonthName(payslip.month)} {payslip.year} •{" "}
                {generateEmployeeId(payslip.userId)}
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
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="deductions">Deductions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      {payslip.user?.name || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Employee ID</div>
                    <div className="font-medium text-gray-900">
                      {generateEmployeeId(payslip.userId)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {payslip.user?.email || "N/A"}
                    </div>
                  </div>
                  {payslip.user?.phone && (
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {payslip.user.phone}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Payslip Information
                    </h4>
                    <p className="text-sm text-gray-500">
                      Payment period and status
                    </p>
                  </div>
                </div>
                <div className="space-y-3 pl-10">
                  <div>
                    <div className="text-sm text-gray-500">Pay Period</div>
                    <div className="font-medium text-gray-900">
                      {getMonthName(payslip.month)} {payslip.year}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Payslip ID</div>
                    <div className="font-medium text-gray-900">
                      #{payslip.id.toString().padStart(6, "0")}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Generated On</div>
                    <div className="font-medium text-gray-900">
                      {new Date(payslip.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
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
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-2xl font-bold text-blue-700">
                  {formatCurrency(payslip.grossPay)}
                </div>
                <div className="text-sm text-blue-600 mt-1">Gross Pay</div>
                <div className="text-xs text-blue-500 mt-2">
                  Total earnings before deductions
                </div>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="text-2xl font-bold text-red-700">
                  {formatCurrency(payslip.totalDeduct)}
                </div>
                <div className="text-sm text-red-600 mt-1">Total Deductions</div>
                <div className="text-xs text-red-500 mt-2">
                  Taxes and other deductions
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(payslip.netPay)}
                </div>
                <div className="text-sm text-green-600 mt-1">Net Pay</div>
                <div className="text-xs text-green-500 mt-2">
                  Amount credited to bank
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-4 mt-6">
            <div className="rounded-lg border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Component
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Amount (₹)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(payslip.earnings).map(([key, value]) => (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(value)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50 font-semibold border-t-2 border-blue-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">
                      Total Earnings (Gross Pay)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">
                      {formatCurrency(payslip.grossPay)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500">
              These are all the components that make up your total earnings for
              this pay period.
            </p>
          </TabsContent>

          <TabsContent value="deductions" className="space-y-4 mt-6">
            <div className="rounded-lg border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-red-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Component
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Amount (₹)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(payslip.deductions).map(([key, value]) => (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {formatCurrency(value)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-red-50 font-semibold border-t-2 border-red-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-900">
                      Total Deductions
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-900">
                      {formatCurrency(payslip.totalDeduct)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500">
              These are statutory and other deductions applied to your earnings
              for this pay period.
            </p>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};