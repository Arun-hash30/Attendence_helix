import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@voilajsx/uikit/table";
import { Button } from "@voilajsx/uikit/button";
import { Badge } from "@voilajsx/uikit/badge";
import { Eye, Download, FileEdit, Trash2 } from "lucide-react";
import { PayslipTableData } from "../types/payslip";
import { PayslipViewModal } from "./PayslipViewModal";
import { DownloadPayslipModal } from "./DownloadPayslipModal";

interface Props {
  data: PayslipTableData[];
  loading: boolean;
  isAdmin?: boolean;
  onDelete?: (id: number) => void;
}

export const PayslipsTable: React.FC<Props> = ({
  data,
  loading,
  isAdmin = false,
  onDelete
}) => {
  const [selectedPayslipId, setSelectedPayslipId] = useState<number | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  const handleView = (id: number) => {
    console.log("🔍 View button clicked for payslip ID:", id);
    setSelectedPayslipId(id);
    setViewModalOpen(true);
  };

  const handleDownload = (id: number) => {
    console.log("📥 Download button clicked for payslip ID:", id);
    setSelectedPayslipId(id);
    setDownloadModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getSelectedPayslip = () => {
    return data.find(p => p.id === selectedPayslipId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4 text-5xl">📄</div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No payslips found</h3>
        <p className="text-gray-500">No payslips have been generated yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Employee Name</TableHead>
              <TableHead>Pay Period</TableHead>
              <TableHead>Gross Pay</TableHead>
              <TableHead>Deductions</TableHead>
              <TableHead>Net Pay</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Generated On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((payslip) => (
              <TableRow key={payslip.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{payslip.employeeId}</TableCell>
                <TableCell>{payslip.employeeName}</TableCell>
                <TableCell>{payslip.monthName}</TableCell>
                <TableCell>{formatCurrency(payslip.grossPay)}</TableCell>
                <TableCell>{formatCurrency(payslip.deductions)}</TableCell>
                <TableCell className="font-semibold text-green-600">
                  {formatCurrency(payslip.netPay)}
                </TableCell>
                <TableCell>
                  <Badge className={payslip.statusColor}>
                    {payslip.status}
                  </Badge>
                </TableCell>
                <TableCell>{payslip.createdAt}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(payslip.id)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(payslip.id)}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {isAdmin && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.location.href = `/payslips/${payslip.id}`}
                          title="Edit"
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (window.confirm("Delete this payslip?")) {
                              onDelete?.(payslip.id);
                            }
                          }}
                          title="Delete"
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      {selectedPayslipId && (
        <>
          <PayslipViewModal
            payslipId={selectedPayslipId}
            isOpen={viewModalOpen}
            onClose={() => setViewModalOpen(false)}
          />
          
          <DownloadPayslipModal
            payslipId={selectedPayslipId}
            employeeName={getSelectedPayslip()?.employeeName || ''}
            monthName={getSelectedPayslip()?.monthName || ''}
            isOpen={downloadModalOpen}
            onClose={() => setDownloadModalOpen(false)}
          />
        </>
      )}
    </>
  );
};