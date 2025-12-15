import React, { useState, useEffect } from "react";
import { Input } from "@voilajsx/uikit/input";
import { Button } from "@voilajsx/uikit/button";
import { Card, CardContent } from "@voilajsx/uikit/card";
import { Label } from "@voilajsx/uikit/label";
import { Checkbox } from "@voilajsx/uikit/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@voilajsx/uikit/select";
import { Alert, AlertDescription } from "@voilajsx/uikit/alert";
import { Loader2, Users } from "lucide-react";
import { GeneratePayslipInput, UserForPayslip } from "../types/payslip";
import { payslipApi } from "../services/payslip.api";
import { useAuth } from "../../auth";

interface Props {
  onSubmit: (data: GeneratePayslipInput) => Promise<void>;
}

const MONTHS = [
  { id: 1, name: "January" },
  { id: 2, name: "February" },
  { id: 3, name: "March" },
  { id: 4, name: "April" },
  { id: 5, name: "May" },
  { id: 6, name: "June" },
  { id: 7, name: "July" },
  { id: 8, name: "August" },
  { id: 9, name: "September" },
  { id: 10, name: "October" },
  { id: 11, name: "November" },
  { id: 12, name: "December" },
];

export const GeneratePayslipForm: React.FC<Props> = ({ onSubmit }) => {
  const { token } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<number>(0);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [users, setUsers] = useState<UserForPayslip[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserForPayslip | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    if (!token) return;
    
    setLoadingUsers(true);
    try {
      const response = await payslipApi.getUsersForPayslip(token);
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleMonthToggle = (monthId: number) => {
    setSelectedMonths(prev =>
      prev.includes(monthId)
        ? prev.filter(id => id !== monthId)
        : [...prev, monthId]
    );
  };

  const selectAllMonths = () => {
    if (selectedMonths.length === 12) {
      setSelectedMonths([]);
    } else {
      setSelectedMonths(MONTHS.map(m => m.id));
    }
  };

  const handleUserSelect = (userId: string) => {
    const id = parseInt(userId);
    setSelectedUserId(id);
    const user = users.find(u => u.id === id);
    setSelectedUser(user || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (selectedUserId === 0) {
      setError("Please select an employee");
      return;
    }
    
    if (selectedMonths.length === 0) {
      setError("Please select at least one month");
      return;
    }

    if (!year || year < 2000 || year > 2100) {
      setError("Please enter a valid year (2000-2100)");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ 
        userId: selectedUserId, 
        months: selectedMonths, 
        year 
      });
      // Reset form after successful submission
      setSelectedUserId(0);
      setSelectedMonths([]);
      setSelectedUser(null);
    } catch (err: any) {
      setError(err.message || "Failed to generate payslips");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Generate Payslips</h3>
        <p className="text-sm text-gray-600">
          Select an employee and choose multiple months to generate payslips for the selected year.
        </p>
      </div>

      {/* Employee Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Select Employee
              </Label>
              
              {loadingUsers ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading employees...
                </div>
              ) : (
                <Select onValueChange={handleUserSelect} value={selectedUserId.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.employeeId}) - {user.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedUser && (
              <div className="p-4 bg-gray-50 rounded-md space-y-2">
                <h4 className="font-medium">Selected Employee Details:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {selectedUser.name}
                  </div>
                  <div>
                    <span className="font-medium">Employee ID:</span> {selectedUser.employeeId}
                  </div>
                  <div>
                    <span className="font-medium">Designation:</span> {selectedUser.designation}
                  </div>
                  <div>
                    <span className="font-medium">Department:</span> {selectedUser.department}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Year Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="year">Pay Year</Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
              placeholder="e.g. 2024"
              min="2000"
              max="2100"
              required
            />
            <p className="text-sm text-gray-500">
              Payslips will be generated for this year
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Month Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Select Months</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={selectAllMonths}
              >
                {selectedMonths.length === 12 ? 'Deselect All' : 'Select All Months'}
              </Button>
            </div>
            
            <p className="text-sm text-gray-500">
              Selected: {selectedMonths.length} month(s)
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {MONTHS.map((month) => (
                <div key={month.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`month-${month.id}`}
                    checked={selectedMonths.includes(month.id)}
                    onCheckedChange={() => handleMonthToggle(month.id)}
                  />
                  <Label
                    htmlFor={`month-${month.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {month.name}
                  </Label>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between font-medium">
                <span>Total Payslips to Generate:</span>
                <span className="text-blue-600">{selectedMonths.length}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                One payslip will be created for each selected month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSelectedUserId(0);
            setSelectedMonths([]);
            setSelectedUser(null);
            setError(null);
          }}
          disabled={loading}
        >
          Clear
        </Button>
        <Button 
          type="submit" 
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          disabled={loading || selectedUserId === 0 || selectedMonths.length === 0}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            `Generate ${selectedMonths.length} Payslip(s)`
          )}
        </Button>
      </div>

      {/* Information Note */}
      <div className="p-4 bg-blue-50 rounded-md">
        <h4 className="font-medium text-blue-800 mb-2">💡 How it works:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• The system will use the latest salary structure for the selected employee</li>
          <li>• Each payslip will be generated individually for the selected months</li>
          <li>• You can view and download payslips from the main payslips page</li>
          <li>• Generated payslips will be marked as "GENERATED" status</li>
        </ul>
      </div>
    </form>
  );
};