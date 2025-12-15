import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';

type LeaveFormProps = {
  onSubmit: (data: { type: 'CASUAL' | 'SICK'; fromDate: string; toDate: string; reason: string }) => void;
};

export function ApplyLeaveForm({ onSubmit }: LeaveFormProps) {
  const [form, setForm] = useState({
    type: 'CASUAL' as 'CASUAL' | 'SICK',
    fromDate: '',
    toDate: '',
    reason: ''
  });

  const [errors, setErrors] = useState({
    fromDate: '',
    toDate: '',
    reason: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors = { fromDate: '', toDate: '', reason: '' };
    if (!form.fromDate) newErrors.fromDate = 'From date is required';
    if (!form.toDate) newErrors.toDate = 'To date is required';
    if (!form.reason.trim()) newErrors.reason = 'Reason is required';

    setErrors(newErrors);

    if (!newErrors.fromDate && !newErrors.toDate && !newErrors.reason) {
      onSubmit(form);
      setForm({ type: 'CASUAL', fromDate: '', toDate: '', reason: '' });
    }
  };

  return (
    <Card className="max-w-md mx-auto shadow-lg border border-gray-200 bg-white rounded-lg overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-center">Apply Leave</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Leave Type</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as 'CASUAL' | 'SICK' })}
            >
              <option value="CASUAL">Casual</option>
              <option value="SICK">Sick</option>
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <input
              type="date"
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.fromDate ? 'border-red-500 ring-red-300' : 'border-gray-300 ring-blue-400'
              }`}
              value={form.fromDate}
              onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
            />
            {errors.fromDate && <p className="text-red-500 text-xs mt-1">{errors.fromDate}</p>}
          </div>

          {/* To Date */}
          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <input
              type="date"
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.toDate ? 'border-red-500 ring-red-300' : 'border-gray-300 ring-blue-400'
              }`}
              value={form.toDate}
              onChange={(e) => setForm({ ...form, toDate: e.target.value })}
            />
            {errors.toDate && <p className="text-red-500 text-xs mt-1">{errors.toDate}</p>}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <textarea
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                errors.reason ? 'border-red-500 ring-red-300' : 'border-gray-300 ring-blue-400'
              }`}
              placeholder="Enter reason for leave"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={3}
            />
            {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors font-medium"
          >
            Apply Leave
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}