import { PageLayout } from "@voilajsx/uikit/page";
import { Card, CardContent, CardHeader, CardTitle } from "@voilajsx/uikit/card";
import { Button } from "@voilajsx/uikit/button";
import { ArrowLeft } from "lucide-react";
import { Header, Footer, SEO } from "../../../shared/components";
import { AuthGuard, useAuth } from "../../auth";
import { GeneratePayslipForm } from "../components/GeneratePayslipForm";
import { payslipApi } from "../services/payslip.api";
import { useNavigate } from "react-router-dom";

const GeneratePage = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

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

  const handleSubmit = async (data: any) => {
    if (!token) return;
    
    try {
      const response = await payslipApi.generatePayslips(data, token);
      
      if (response.success) {
        alert(`✅ ${response.message}`);
        navigate("/payslips");
      } else {
        alert(`❌ ${response.error || "Failed to generate payslips"}`);
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message || "Failed to generate payslips"}`);
    }
  };

  return (
    <AuthGuard>
      <PageLayout>
        <SEO title="Generate Payslips" />
        <Header />

        <PageLayout.Content>
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Generate Payslips</h1>
                <p className="text-gray-600 mt-1">
                  Create salary slips for employees for specific months
                </p>
              </div>

              <Button asChild variant="outline">
                <a href="/payslips">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Payslips
                </a>
              </Button>
            </div>

            {/* Information Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-blue-800">Before You Generate Payslips:</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Ensure the employee has a salary structure created</li>
                    <li>• You can generate payslips for multiple months at once</li>
                    <li>• Each payslip will be created as a separate record</li>
                    <li>• Generated payslips can be viewed, downloaded, or marked as paid</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Main Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Payslip Generation Form</CardTitle>
              </CardHeader>
              <CardContent>
                <GeneratePayslipForm onSubmit={handleSubmit} />
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-1">What happens if a payslip already exists for a month?</h4>
                    <p className="text-gray-600">The system will skip generating payslips for months that already have a payslip for the selected employee and year.</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Can I edit a payslip after generating it?</h4>
                    <p className="text-gray-600">Yes, you can update the status and payment details of generated payslips from the main payslips page.</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">How do employees access their payslips?</h4>
                    <p className="text-gray-600">Employees can view and download their payslips from the "My Payslips" section after they are generated.</p>
                  </div>
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

export default GeneratePage;