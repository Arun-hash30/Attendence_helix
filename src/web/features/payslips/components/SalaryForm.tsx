import { useState } from "react";
import { Input } from "@voilajsx/uikit/input";
import { Button } from "@voilajsx/uikit/button";
import { Card, CardContent } from "@voilajsx/uikit/card";
import { Label } from "@voilajsx/uikit/label";
import { SalaryStructureInput } from "../types/payslip";

interface Props {
  userId: number;
  onSubmit: (data: SalaryStructureInput) => void;
}

export const SalaryForm = ({ userId: _, onSubmit }: Props) => {
  const [formData, setFormData] = useState<SalaryStructureInput>({
    basicSalary: 0,
    hra: 0,
    specialAllowance: 0,
    travelAllowance: 0,
    medicalAllowance: 0,
    pf: 0,
    professionalTax: 0,
    tds: 0,
    otherDeductions: 0,
    effectiveFrom: new Date().toISOString().split('T')[0],
  });

  const handleChange = (field: keyof SalaryStructureInput, value: string) => {
    // Convert to number, default to 0 if empty or invalid
    const numValue = value === '' ? 0 : parseFloat(value) || 0;
    
    setFormData(prev => ({
      ...prev,
      [field]: field === 'effectiveFrom' ? value : numValue
    }));
  };

  const calculateTotalEarnings = () => {
    return formData.basicSalary + formData.hra + formData.specialAllowance + 
           formData.travelAllowance + formData.medicalAllowance;
  };

  const calculateTotalDeductions = () => {
    return formData.pf + formData.professionalTax + formData.tds + formData.otherDeductions;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const netSalary = calculateTotalEarnings() - calculateTotalDeductions();

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Employee Salary Structure</h3>
        <p className="text-sm text-gray-600">
          Define the complete salary structure including all earnings and deductions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Earnings Section */}
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-4 text-green-700">Earnings (₹)</h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="basicSalary">Basic Salary</Label>
                <Input
                  id="basicSalary"
                  type="number"
                  value={formData.basicSalary || ''}
                  onChange={(e) => handleChange('basicSalary', e.target.value)}
                  placeholder="Enter basic salary"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hra">House Rent Allowance (HRA)</Label>
                <Input
                  id="hra"
                  type="number"
                  value={formData.hra || ''}
                  onChange={(e) => handleChange('hra', e.target.value)}
                  placeholder="Enter HRA"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialAllowance">Special Allowance</Label>
                <Input
                  id="specialAllowance"
                  type="number"
                  value={formData.specialAllowance || ''}
                  onChange={(e) => handleChange('specialAllowance', e.target.value)}
                  placeholder="Enter special allowance"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="travelAllowance">Travel Allowance</Label>
                <Input
                  id="travelAllowance"
                  type="number"
                  value={formData.travelAllowance || ''}
                  onChange={(e) => handleChange('travelAllowance', e.target.value)}
                  placeholder="Enter travel allowance"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalAllowance">Medical Allowance</Label>
                <Input
                  id="medicalAllowance"
                  type="number"
                  value={formData.medicalAllowance || ''}
                  onChange={(e) => handleChange('medicalAllowance', e.target.value)}
                  placeholder="Enter medical allowance"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between font-semibold">
                  <span>Total Earnings</span>
                  <span className="text-green-700">₹{formatNumber(calculateTotalEarnings())}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deductions Section */}
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-4 text-red-700">Deductions (₹)</h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pf">Provident Fund (PF)</Label>
                <Input
                  id="pf"
                  type="number"
                  value={formData.pf || ''}
                  onChange={(e) => handleChange('pf', e.target.value)}
                  placeholder="Enter PF"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="professionalTax">Professional Tax</Label>
                <Input
                  id="professionalTax"
                  type="number"
                  value={formData.professionalTax || ''}
                  onChange={(e) => handleChange('professionalTax', e.target.value)}
                  placeholder="Enter professional tax"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tds">TDS (Tax Deducted at Source)</Label>
                <Input
                  id="tds"
                  type="number"
                  value={formData.tds || ''}
                  onChange={(e) => handleChange('tds', e.target.value)}
                  placeholder="Enter TDS"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherDeductions">Other Deductions</Label>
                <Input
                  id="otherDeductions"
                  type="number"
                  value={formData.otherDeductions || ''}
                  onChange={(e) => handleChange('otherDeductions', e.target.value)}
                  placeholder="Enter other deductions"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between font-semibold">
                  <span>Total Deductions</span>
                  <span className="text-red-700">₹{formatNumber(calculateTotalDeductions())}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Effective Date */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="effectiveFrom">Effective From Date</Label>
              <Input
                id="effectiveFrom"
                type="date"
                value={formData.effectiveFrom}
                onChange={(e) => handleChange('effectiveFrom', e.target.value)}
                required
              />
              <p className="text-sm text-gray-500">
                This salary structure will be applied from this date onwards
              </p>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">Net Salary</div>
                  <div className="text-sm text-gray-500">
                    Total Earnings - Total Deductions
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-700">
                  ₹{formatNumber(netSalary)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        className="w-full bg-blue-600 text-white hover:bg-blue-700"
      >
        Save Salary Structure
      </Button>
    </form>
  );
};