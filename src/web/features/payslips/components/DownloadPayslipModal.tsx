import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@voilajsx/uikit/dialog";
import { Button } from "@voilajsx/uikit/button";
import { RadioGroup, RadioGroupItem } from "@voilajsx/uikit/radio-group";
import { Label } from "@voilajsx/uikit/label";
import { Download, Printer, FileText, Loader2 } from "lucide-react";
import { useAuth } from "../../auth";
import { payslipApi } from "../services/payslip.api";
import { Payslip } from "../types/payslip";

interface Props {
  payslipId: number;
  employeeName: string;
  monthName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadPayslipModal: React.FC<Props> = ({
  payslipId,
  employeeName,
  monthName,
  isOpen,
  onClose
}) => {
  const { token } = useAuth();
  const [format, setFormat] = useState<'pdf' | 'print'>('pdf');
  const [loading, setLoading] = useState(false);

  const generateEmployeeId = (userId: number): string => {
    return `EMP${userId.toString().padStart(4, '0')}`;
  };

  const getPrintHTML = (payslip: Payslip) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payslip - ${monthName}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 40px; 
            max-width: 1000px;
            margin: 0 auto;
            color: #333;
            line-height: 1.6;
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #1e40af;
          }
          
          .company-name { 
            font-size: 32px; 
            font-weight: 700; 
            margin-bottom: 10px;
            color: #1e40af;
            letter-spacing: 1px;
          }
          
          .address { 
            color: #666; 
            margin-bottom: 15px;
            font-size: 14px;
            line-height: 1.5;
          }
          
          .payslip-title { 
            font-size: 28px; 
            margin: 30px 0 20px;
            padding: 10px;
            background: linear-gradient(90deg, #1e40af, #3b82f6);
            color: white;
            border-radius: 8px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
          }
          
          .employee-info { 
            margin-bottom: 40px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
          }
          
          .info-table { 
            width: 100%; 
            border-collapse: collapse;
          }
          
          .info-table td { 
            padding: 12px 15px; 
            border: 1px solid #cbd5e1;
            font-size: 14px;
          }
          
          .info-table tr:nth-child(even) {
            background-color: #f1f5f9;
          }
          
          .earnings-deductions { 
            display: flex; 
            gap: 40px; 
            margin: 40px 0;
          }
          
          .section { 
            flex: 1;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          }
          
          .section h3 {
            background: linear-gradient(90deg, #1e40af, #3b82f6);
            color: white;
            padding: 15px 20px;
            margin: 0;
            font-size: 18px;
            font-weight: 600;
          }
          
          .section table { 
            width: 100%; 
            border-collapse: collapse;
          }
          
          .section th, .section td { 
            border: 1px solid #e2e8f0; 
            padding: 12px 15px;
            text-align: left;
          }
          
          .section th { 
            background-color: #f1f5f9;
            font-weight: 600;
            color: #475569;
            font-size: 14px;
          }
          
          .section td {
            font-size: 14px;
          }
          
          .total-row { 
            font-weight: bold; 
            background-color: #f0f9ff;
            color: #0369a1;
          }
          
          .net-pay { 
            text-align: center; 
            font-size: 32px;
            font-weight: bold;
            color: #059669;
            margin: 50px 0;
            padding: 25px;
            background: linear-gradient(135deg, #d1fae5, #a7f3d0);
            border-radius: 12px;
            border: 2px solid #10b981;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
          }
          
          .footer { 
            text-align: center; 
            color: #64748b; 
            font-size: 13px; 
            margin-top: 60px;
            padding-top: 25px;
            border-top: 2px dashed #cbd5e1;
          }
          
          .footer p {
            margin: 8px 0;
          }
          
          .signature-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
            padding-top: 30px;
            border-top: 2px solid #cbd5e1;
          }
          
          .signature-box {
            text-align: center;
            flex: 1;
          }
          
          .signature-line {
            width: 80%;
            height: 1px;
            background: #333;
            margin: 40px auto 10px;
          }
          
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            color: rgba(30, 64, 175, 0.1);
            font-weight: bold;
            pointer-events: none;
            z-index: -1;
          }
          
          @media print {
            body { 
              padding: 20px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .no-print { 
              display: none; 
            }
            
            .watermark {
              opacity: 0.1;
            }
            
            .section {
              box-shadow: none;
              border: 1px solid #ddd;
            }
            
            .net-pay {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="watermark">FRESHERBOT</div>
        
        <div class="header">
          <div class="company-name">FRESHERBOT PRIVATE LIMITED</div>
          <div class="address">
            2nd Floor, Oyster Uptown, Beside Durgam Cheruvu Metro Station,<br>
            Hitech City, Hyderabad – 500081<br>
            Tel: +91 7032309797 | Email: info@fresherbot.com | Web: https://fresherbot.com
          </div>
          <div class="payslip-title">PAYSLIP</div>
        </div>
        
        <div class="employee-info">
          <table class="info-table">
            <tr>
              <td><strong>Employee Name:</strong> ${payslip.user?.name || employeeName}</td>
              <td><strong>Employee ID:</strong> ${generateEmployeeId(payslip.userId)}</td>
            </tr>
            <tr>
              <td><strong>Email:</strong> ${payslip.user?.email || 'N/A'}</td>
              <td><strong>Pay Period:</strong> ${monthName}</td>
            </tr>
            <tr>
              <td><strong>Payslip ID:</strong> #${payslip.id.toString().padStart(6, '0')}</td>
              <td><strong>Generated On:</strong> ${new Date(payslip.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</td>
            </tr>
            <tr>
              <td><strong>Status:</strong> ${payslip.status}</td>
              <td><strong>Phone:</strong> ${payslip.user?.phone || 'Not Provided'}</td>
            </tr>
          </table>
        </div>
        
        <div class="earnings-deductions">
          <div class="section">
            <h3>EARNINGS</h3>
            <table>
              <thead>
                <tr>
                  <th>Component</th>
                  <th style="text-align: right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(payslip.earnings).map(([key, value]) => `
                  <tr>
                    <td>${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</td>
                    <td style="text-align: right">${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td><strong>Gross Pay</strong></td>
                  <td style="text-align: right"><strong>₹${payslip.grossPay.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h3>DEDUCTIONS</h3>
            <table>
              <thead>
                <tr>
                  <th>Component</th>
                  <th style="text-align: right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(payslip.deductions).map(([key, value]) => `
                  <tr>
                    <td>${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</td>
                    <td style="text-align: right">${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td><strong>Total Deductions</strong></td>
                  <td style="text-align: right"><strong>₹${payslip.totalDeduct.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="net-pay">
          NET PAYABLE: ₹${payslip.netPay.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        </div>
        
        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line"></div>
            <p>Employee Signature</p>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <p>Authorized Signatory</p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Important Notes:</strong></p>
          <p>1. This is a system-generated payslip and does not require a physical signature.</p>
          <p>2. For any discrepancies, please report to HR within 7 days of receiving this payslip.</p>
          <p>3. This payslip is confidential and should not be shared with unauthorized persons.</p>
          <p>4. Keep this payslip for your records and tax filing purposes.</p>
          <br>
          <p>For queries, contact HR Department at hr@fresherbot.com or call +91 7032309797</p>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
          <button onclick="window.print()" style="padding: 12px 30px; background: linear-gradient(90deg, #1e40af, #3b82f6); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 600; transition: all 0.3s;">
            🖨️ Print Payslip
          </button>
          <p style="margin-top: 15px; color: #666; font-size: 12px;">Click the button above to print this payslip</p>
        </div>
      </body>
      </html>
    `;
  };

  const handlePrint = async () => {
    setLoading(true);
    try {
      const response = await payslipApi.getPayslip(payslipId, token!);
      if (response.success && response.data) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(getPrintHTML(response.data));
          printWindow.document.close();
          printWindow.focus();
          
          // Wait for content to load then trigger print
          setTimeout(() => {
            printWindow.print();
          }, 500);
        }
      }
      onClose();
    } catch (error) {
      console.error("Print failed:", error);
      alert("Failed to generate print. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      const response = await payslipApi.getPayslip(payslipId, token!);
      if (response.success && response.data) {
        // Generate HTML content
        const htmlContent = getPrintHTML(response.data);
        
        // Create a Blob with the HTML content
        const blob = new Blob([htmlContent], { type: 'text/html' });
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Payslip_${employeeName.replace(/\s+/g, '_')}_${monthName.replace(/\s+/g, '_')}.html`;
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        URL.revokeObjectURL(link.href);
        
        console.log('PDF download initiated (as HTML)');
      }
      onClose();
    } catch (error) {
      console.error("PDF download failed:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (format === 'pdf') {
      await handleDownloadPDF();
    } else {
      await handlePrint();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download Payslip</DialogTitle>
          <DialogDescription>
            Choose format for {employeeName}'s payslip - {monthName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <RadioGroup value={format} onValueChange={(value: any) => setFormat(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pdf" id="pdf" />
              <Label htmlFor="pdf" className="flex items-center gap-3 cursor-pointer w-full p-3 rounded-lg hover:bg-gray-50">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Download as HTML</div>
                  <div className="text-sm text-gray-500">
                    Save as HTML file (can be converted to PDF)
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="print" id="print" />
              <Label htmlFor="print" className="flex items-center gap-3 cursor-pointer w-full p-3 rounded-lg hover:bg-gray-50">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Printer className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">Print Directly</div>
                  <div className="text-sm text-gray-500">
                    Opens print dialog immediately
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-0.5">💡</div>
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">Quick Tips:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• <strong>HTML Download:</strong> Save file and open in browser to print</li>
                  <li>• <strong>Print Directly:</strong> Choose "Save as PDF" in print dialog for PDF</li>
                  <li>• <strong>For official use:</strong> Download HTML and convert to PDF</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium mb-1">Note:</p>
            <p>For true PDF generation, consider implementing a backend PDF service using libraries like Puppeteer, jsPDF, or using a dedicated PDF generation API.</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAction} 
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {format === 'print' ? 'Opening...' : 'Downloading...'}
              </>
            ) : (
              <>
                {format === 'print' ? <Printer className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                {format === 'print' ? 'Print' : 'Download HTML'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};