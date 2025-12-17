import React, { useState } from "react";
import { PageLayout } from "@voilajsx/uikit/page";
import { Card, CardContent, CardHeader, CardTitle } from "@voilajsx/uikit/card";
import { Button } from "@voilajsx/uikit/button";
import { ArrowLeft, Calendar, AlertCircle } from "lucide-react";
import { Header, Footer, SEO } from "../../../shared/components";
import { AuthGuard, useAuth } from "../../auth";
import { ApplyLeaveForm } from "../components/ApplyLeaveForm";
import { leaveApi } from "../services/leave.api";
import { useNavigate } from "react-router-dom";
import LeaveBalanceCard from "../components/LeaveBalanceCard";
import { useLeaveBalance } from "../hooks/useLeaveBalance";
import { LeaveBalance } from "../types/leave";

const ApplyLeavePage: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [, setSubmitting] = useState(false); // Changed to ignore unused setter
  const [error, setError] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const { balance, loading: balanceLoading } = useLeaveBalance(user?.id || 0, currentYear);

  // Convert the balance from useLeaveBalance to the proper type
  const leaveBalance: LeaveBalance | null = balance ? {
    id: balance.id || 0,
    userId: balance.userId || user?.id || 0,
    year: balance.year || currentYear,
    casualTotal: balance.casualTotal || 0,
    casualUsed: balance.casualUsed || 0,
    sickTotal: balance.sickTotal || 0,
    sickUsed: balance.sickUsed || 0,
    annualTotal: balance.annualTotal || 0,
    annualUsed: balance.annualUsed || 0,
    createdAt: balance.createdAt || new Date().toISOString(),
    updatedAt: balance.updatedAt || new Date().toISOString(),
    user: balance.user || { name: user?.name || '', email: user?.email || '' }
  } : null;

  const handleSubmit = async (data: any) => {
    if (!token || !user) {
      setError("Authentication required. Please login again.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await leaveApi.applyLeave(user.id, data, token);
      
      if (response.success) {
        alert("✅ Leave application submitted successfully!");
        navigate("/leaves");
      } else {
        setError(response.error || "Failed to submit leave application");
      }
    } catch (error: any) {
      setError(error.message || "Failed to submit leave application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <PageLayout>
        <SEO title="Apply for Leave" />
        <Header />

        <PageLayout.Content>
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Apply for Leave</h1>
                <p className="text-gray-600 mt-1">
                  Submit a new leave request for approval
                </p>
              </div>

              <Button asChild variant="outline">
                <a href="/leaves">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Leaves
                </a>
              </Button>
            </div>

            {/* Leave Balance */}
            <LeaveBalanceCard 
              balance={leaveBalance} 
              loading={balanceLoading} 
              year={currentYear} 
            />

            {/* Important Information */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">Important Notes Before Applying:</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Submit leave applications at least 24 hours in advance for approval</li>
                      <li>• Emergency leaves will be reviewed on priority basis</li>
                      <li>• Half-day leaves should be selected when taking only morning or afternoon off</li>
                      <li>• Check your leave balance above before applying</li>
                      <li>• You will receive email notification when your leave is approved/rejected</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Application Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Leave Application Form
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user ? (
                  <ApplyLeaveForm 
                    userId={user.id} 
                    onSubmit={handleSubmit}
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-red-400 mb-4 text-5xl">🔒</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
                    <p className="text-gray-500">Please login to apply for leave.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">How long does approval take?</h4>
                    <p className="text-gray-600">
                      Leave requests are typically reviewed within 24 hours. Emergency leaves are prioritized.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Can I cancel a leave request?</h4>
                    <p className="text-gray-600">
                      Yes, you can cancel pending leave requests from the "My Leaves" page before they are approved.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">What if my leave is rejected?</h4>
                    <p className="text-gray-600">
                      If your leave is rejected, you'll receive comments explaining why. You can discuss with your manager and reapply if needed.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">How are half-day leaves calculated?</h4>
                    <p className="text-gray-600">
                      Half-day leaves count as 0.5 days. Choose "First Half" for morning leave or "Second Half" for afternoon leave.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-800 mb-2">Error Submitting Leave</h3>
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </PageLayout.Content>

        <Footer />
      </PageLayout>
    </AuthGuard>
  );
};

export default ApplyLeavePage;