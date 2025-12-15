import React from "react";
import { Payslip } from "../types/payslip";
import { Button } from "@voilajsx/uikit/button";
import { Link } from "react-router-dom";

interface Props {
  payslip: Payslip;
  isAdmin?: boolean;
  onDelete?: (id: number) => void;
}

export const PayslipDocument: React.FC<Props> = ({
  payslip,
  isAdmin,
  onDelete,
}) => {
  return (
    <section className="bg-white text-black w-full max-w-[900px] mx-auto my-10 p-10 border border-gray-300 font-sans">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between border-b pb-4 mb-6">
        <div className="max-w-[70%]">
          <h1 className="text-2xl font-bold">
            FresherBot
          </h1>

          <p className="text-sm leading-relaxed">
            2nd Floor, Oyster Uptown, Beside Durgam Cheruvu Metro Station,
            Hitech City, Hyderabad – 500081
          </p>

          <p className="text-sm">
            Hitech City Hub, Hyderabad, India
          </p>

          <p className="text-sm mt-1">
            🌐 https://fresherbot.com
          </p>

          <p className="text-sm">
            ✉ info@fresherbot.com | ☎ +91 7032309797
          </p>

          <p className="text-xs text-gray-600 mt-1">
            Business Hours: Monday – Friday, 9:00 AM – 6:00 PM
          </p>
        </div>

        <h2 className="text-3xl font-bold tracking-wide self-start">
          PAYSLIP
        </h2>
      </div>

      {/* ================= META ================= */}
      <div className="grid grid-cols-2 text-sm gap-y-2 mb-8">
        <p><b>Employee ID:</b> {payslip.userId}</p>
        <p><b>Payslip ID:</b> {payslip.id}</p>
        <p><b>Pay Period:</b> {payslip.month}/{payslip.year}</p>
        <p><b>Generated On:</b> {new Date(payslip.createdAt).toDateString()}</p>
        <p><b>Status:</b> {payslip.status}</p>
        <p><b>Payment Mode:</b> Bank Transfer</p>
      </div>

      {/* ================= EARNINGS & DEDUCTIONS ================= */}
      <div className="grid grid-cols-2 gap-10">
        {/* Earnings */}
        <table className="w-full text-sm border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border text-left">Earnings</th>
              <th className="p-2 border text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(payslip.earnings).map(([key, val]) => (
              <tr key={key}>
                <td className="p-2 border capitalize">{key}</td>
                <td className="p-2 border text-right">{val}</td>
              </tr>
            ))}
            <tr className="font-bold bg-gray-50">
              <td className="p-2 border">Gross Pay</td>
              <td className="p-2 border text-right">{payslip.grossPay}</td>
            </tr>
          </tbody>
        </table>

        {/* Deductions */}
        <table className="w-full text-sm border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border text-left">Deductions</th>
              <th className="p-2 border text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(payslip.deductions).map(([key, val]) => (
              <tr key={key}>
                <td className="p-2 border capitalize">{key}</td>
                <td className="p-2 border text-right">{val}</td>
              </tr>
            ))}
            <tr className="font-bold bg-gray-50">
              <td className="p-2 border">Total Deductions</td>
              <td className="p-2 border text-right">{payslip.totalDeduct}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ================= NET PAY ================= */}
      <div className="border-t mt-8 pt-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Net Pay</h2>
        <h2 className="text-2xl font-bold text-green-700">
          ₹{payslip.netPay}
        </h2>
      </div>

      {/* ================= ADMIN ACTIONS ================= */}
      {isAdmin && (
        <div className="flex gap-3 justify-end mt-6">
          <Button asChild variant="outline">
            <Link to={`/payslips/edit/${payslip.id}`}>Edit</Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => onDelete?.(payslip.id)}
          >
            Delete
          </Button>
        </div>
      )}

      {/* ================= FOOTER ================= */}
      <p className="text-xs text-center text-gray-500 mt-10">
        This is a system-generated payslip. No signature is required.
      </p>
    </section>
  );
};
