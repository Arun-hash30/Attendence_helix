import { useState, useEffect } from "react";
import { PageLayout } from "@voilajsx/uikit/page";
import { Card, CardContent, CardHeader, CardTitle } from "@voilajsx/uikit/card";
import { Button } from "@voilajsx/uikit/button";
import { ArrowLeft, Users, Mail, User, Hash } from "lucide-react";
import { Header, Footer, SEO } from "../../../shared/components";
import { AuthGuard, useAuth } from "../../auth";
import { SalaryForm } from "../components/SalaryForm";
import { payslipApi } from "../services/payslip.api";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@voilajsx/uikit/select";
import { Label } from "@voilajsx/uikit/label";
import { UserForPayslip } from "../types/payslip";

const SalaryPage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState<number>(0);
  const [users, setUsers] = useState<UserForPayslip[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserForPayslip | null>(null);

  if (user?.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

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

  const handleUserSelect = (userId: string) => {
    const id = parseInt(userId);
    setSelectedUserId(id);
    const user = users.find(u => u.id === id);
    setSelectedUser(user || null);
  };

  const handleSubmit = async (data: any) => {
    if (!token || selectedUserId === 0) return;
    
    try {
      const response = await payslipApi.createSalary(selectedUserId, data, token);
      
      if (response.success) {
        alert("✅ Salary structure created successfully!");
        navigate("/payslips");
      } else {
        alert(`❌ ${response.error || "Failed to create salary structure"}`);
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message || "Failed to create salary structure"}`);
    }
  };

  return (
    <AuthGuard>
      <PageLayout>
        <SEO title="Create Salary Structure" />
        <Header />

        <PageLayout.Content>
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Create Salary Structure</h1>
                <p className="text-gray-600 mt-1">
                  Define earnings and deductions for employee salary calculation
                </p>
              </div>

              <Button asChild variant="outline">
                <a href="/payslips">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Payslips
                </a>
              </Button>
            </div>

            {/* Employee Selection Card */}
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Select Employee</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="employee" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Select Employee
                    </Label>
                    
                    {loadingUsers ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
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
                              {user.name} ({user.employeeId || `ID: ${user.id}`}) - {user.department || 'No Department'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {selectedUser && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium mb-3">Selected Employee Details:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Name</div>
                              <div className="font-medium">{selectedUser.name}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Hash className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Employee ID</div>
                              <div className="font-medium">{selectedUser.employeeId || `EMP${selectedUser.id.toString().padStart(4, '0')}`}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Mail className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Email</div>
                              <div className="font-medium">{selectedUser.email}</div>
                            </div>
                          </div>
                          
                          {selectedUser.department && (
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                <Users className="h-4 w-4 text-orange-600" />
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Department</div>
                                <div className="font-medium">{selectedUser.department}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {selectedUser.designation && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="text-xs text-gray-500">Designation</div>
                          <div className="font-medium">{selectedUser.designation}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Salary Form */}
            {selectedUserId > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Step 2: Define Salary Structure for {selectedUser?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SalaryForm 
                    userId={selectedUserId}
                    onSubmit={handleSubmit}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="text-gray-400 mb-4">👤</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Select an Employee</h3>
                  <p className="text-gray-500">Please select an employee from the dropdown above to continue.</p>
                </CardContent>
              </Card>
            )}

            {/* Information Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-blue-800">About Salary Structure:</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Salary structure defines all earnings (basic, allowances) and deductions (taxes, PF)</li>
                    <li>• This structure will be used to automatically calculate payslips</li>
                    <li>• You can create payslips only after setting up the salary structure</li>
                    <li>• The effective date determines when this salary becomes applicable</li>
                    <li>• You can update the salary structure anytime; new payslips will use the latest structure</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </PageLayout.Content>

        <Footer />
      </PageLayout>
    </AuthGuard>
  );
};

export default SalaryPage;