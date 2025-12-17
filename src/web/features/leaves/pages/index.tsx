import React from "react";
import { PageLayout } from "@voilajsx/uikit/page";
import { Header, Footer, SEO } from "../../../shared/components";
import { useAuth } from "../../auth";
import { Button } from "@voilajsx/uikit/button";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@voilajsx/uikit/card";
import { Calendar, FileText, CheckCircle, AlertCircle, Clock } from "lucide-react";

const LeavesIndexPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <PageLayout>
      <SEO title="Leaves" />
      <Header />

      <PageLayout.Content>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center py-8">
            <h1 className="text-4xl font-bold mb-4">Leave Management System</h1>
            <p className="text-gray-600 text-lg">
              Manage your leaves, track balance, and submit requests all in one place
            </p>
            {user?.name && (
              <p className="text-gray-500 mt-2">
                Welcome back, <span className="font-semibold">{user.name}</span>
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold">My Leave History</h3>
                  <p className="text-gray-600">
                    View all your past and current leave applications
                  </p>
                  <Button asChild className="w-full">
                    <Link to="/leaves/my-leaves">
                      View History
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Apply for Leave</h3>
                  <p className="text-gray-600">
                    Submit a new leave request for approval
                  </p>
                  <Button asChild className="w-full">
                    <Link to="/leaves/apply">
                      Apply Now
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Leave Balance</h3>
                  <p className="text-gray-600">
                    Check your available leave days and usage
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/leaves/my-leaves?tab=balance">
                      View Balance
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Section */}
          {user?.role === "admin" && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800">Admin Access Available</h3>
                    <p className="text-yellow-700">
                      As an administrator, you can manage all employee leave requests
                    </p>
                    <Button asChild variant="outline" className="mt-2 border-yellow-300 text-yellow-700">
                      <Link to="/leaves/manage">
                        Go to Leave Management
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">15</div>
                    <div className="text-sm text-gray-600">Annual Leave</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-sm text-gray-600">Sick Leave</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-sm text-gray-600">Casual Leave</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">3</div>
                    <div className="text-sm text-gray-600">Maternity</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Information Section */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">About Our Leave Policy</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Leave Types</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• <strong>Annual Leave:</strong> 15 days per year for vacations</li>
                    <li>• <strong>Sick Leave:</strong> 12 days per year for medical reasons</li>
                    <li>• <strong>Casual Leave:</strong> 12 days per year for personal work</li>
                    <li>• <strong>Maternity Leave:</strong> 90 days for childbirth</li>
                    <li>• <strong>Paternity Leave:</strong> 5 days for new fathers</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Important Guidelines</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Submit leave applications at least 24 hours in advance</li>
                    <li>• Emergency leaves require manager approval</li>
                    <li>• Half-day leaves count as 0.5 days</li>
                    <li>• Unused leave days may be carried forward (check policy)</li>
                    <li>• All leaves are subject to manager approval</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout.Content>

      <Footer />
    </PageLayout>
  );
};

export default LeavesIndexPage;