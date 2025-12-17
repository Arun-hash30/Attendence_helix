import React, { useState, useEffect } from "react";
import { Input } from "@voilajsx/uikit/input";
import { Button } from "@voilajsx/uikit/button";
import { Card, CardContent } from "@voilajsx/uikit/card";
import { Label } from "@voilajsx/uikit/label";
import { Textarea } from "@voilajsx/uikit/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@voilajsx/uikit/select";
import { Checkbox } from "@voilajsx/uikit/checkbox";
import { Alert, AlertDescription } from "@voilajsx/uikit/alert";
import { Calendar, Loader2 } from "lucide-react";
import { ApplyLeaveInput } from "../types/leave";
import { leaveApi } from "../services/leave.api";
import { useAuth } from "../../auth";

interface Props {
  userId: number;
  onSubmit: (data: ApplyLeaveInput) => Promise<void>;
}

export const ApplyLeaveForm: React.FC<Props> = ({ onSubmit }) => { // Removed unused userId
  const { token } = useAuth();
  const [formData, setFormData] = useState<ApplyLeaveInput>({
    type: "CASUAL",
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    reason: "",
    halfDay: false,
    halfDayType: undefined,
    emergency: false,
  });

  const [leaveTypes, setLeaveTypes] = useState<{value: string, label: string}[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadLeaveTypes();
  }, []);

  const loadLeaveTypes = async () => {
    if (!token) return;
    
    setLoadingTypes(true);
    try {
      const response = await leaveApi.getLeaveTypes(token);
      if (response.success && response.data) {
        setLeaveTypes(response.data);
      }
    } catch (error) {
      console.error("Failed to load leave types:", error);
    } finally {
      setLoadingTypes(false);
    }
  };

  const handleChange = (field: keyof ApplyLeaveInput, value: any) => {
    if (field === 'halfDay' || field === 'emergency') {
      setFormData(prev => ({
        ...prev,
        [field]: value === true
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    if (field === 'fromDate' && new Date(value) > new Date(formData.toDate)) {
      setFormData(prev => ({
        ...prev,
        toDate: value
      }));
    }
  };

  const calculateDays = (start: string, end: string, halfDay: boolean = false) => {
    if (halfDay) return 0.5;
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    let weekdays = 0;
    for (let i = 0; i < diffDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        weekdays++;
      }
    }
    
    return weekdays;
  };

  const days = calculateDays(formData.fromDate, formData.toDate, formData.halfDay || false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.type) {
      setError("Please select leave type");
      return;
    }
    
    if (!formData.fromDate || !formData.toDate) {
      setError("Please select from and to dates");
      return;
    }
    
    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      setError("From date cannot be after to date");
      return;
    }
    
    if (formData.halfDay && !formData.halfDayType) {
      setError("Please select half day type");
      return;
    }

    setSubmitting(true);
    try {
      const submitData: ApplyLeaveInput = {
        ...formData,
        halfDay: formData.halfDay || false,
        emergency: formData.emergency || false
      };
      
      await onSubmit(submitData);
      setFormData({
        type: "CASUAL",
        fromDate: new Date().toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        reason: "",
        halfDay: false,
        halfDayType: undefined,
        emergency: false,
      });
    } catch (err: any) {
      setError(err.message || "Failed to apply for leave");
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Apply for Leave</h3>
        <p className="text-sm text-gray-600">
          Fill in the details below to submit your leave request.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Leave Type *</Label>
              
              {loadingTypes ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading leave types...
                </div>
              ) : (
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  From Date *
                </Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={formData.fromDate}
                  onChange={(e) => handleChange('fromDate', e.target.value)}
                  min={today}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="toDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  To Date *
                </Label>
                <Input
                  id="toDate"
                  type="date"
                  value={formData.toDate}
                  onChange={(e) => handleChange('toDate', e.target.value)}
                  min={formData.fromDate}
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Days:</span>
                <span className="text-lg font-bold text-blue-600">
                  {days} {days === 1 ? 'day' : 'days'}
                  {formData.halfDay && " (Half Day)"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="halfDay"
                  checked={formData.halfDay || false}
                  onCheckedChange={(checked) => handleChange('halfDay', checked)}
                />
                <Label htmlFor="halfDay" className="cursor-pointer">
                  Half Day Leave
                </Label>
              </div>

              {(formData.halfDay || false) && (
                <div className="pl-6 space-y-2">
                  <Label>Half Day Type *</Label>
                  <Select 
                    value={formData.halfDayType || ''} 
                    onValueChange={(value) => handleChange('halfDayType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select half day type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIRST_HALF">First Half (Morning)</SelectItem>
                      <SelectItem value="SECOND_HALF">Second Half (Afternoon)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="emergency"
                checked={formData.emergency || false}
                onCheckedChange={(checked) => handleChange('emergency', checked)}
              />
              <Label htmlFor="emergency" className="cursor-pointer text-red-600">
                Emergency Leave
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={formData.reason || ""}
              onChange={(e) => handleChange('reason', e.target.value)}
              placeholder="Briefly mention the reason for leave..."
              rows={4}
            />
            <p className="text-sm text-gray-500">
              Provide additional details for your leave request.
            </p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        disabled={submitting}
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Apply for Leave'
        )}
      </Button>

      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <h4 className="font-medium text-blue-800 mb-2">📋 Leave Application Guidelines:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Submit leave applications at least 24 hours in advance</li>
          <li>• Emergency leaves require immediate manager approval</li>
          <li>• Half-day leaves count as 0.5 days</li>
          <li>• Your leave balance will be checked before approval</li>
          <li>• You'll receive notification when your leave is approved/rejected</li>
        </ul>
      </div>
    </form>
  );
};