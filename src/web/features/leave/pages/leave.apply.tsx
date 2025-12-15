import React from 'react';
import { PageLayout } from '@voilajsx/uikit/page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { ArrowLeft } from 'lucide-react';
import { Header, Footer, SEO } from '../../../shared/components';
import { route } from '../../../shared/utils';
import { useLeave } from '../hooks/useLeave';
import { ApplyLeaveForm } from '../components/ApplyLeaveForm';
import { LeaveBalanceCard } from '../components/LeaveBalanceCard';

const AdminLeavePage: React.FC = () => {
  const { leaves = [], balance, applyLeave, approveLeave, rejectLeave, loading } = useLeave();

  return (
    <PageLayout>
      <SEO title="Leave Management" description="Manage and apply leave requests" />
      <Header />

      <PageLayout.Content>
        <div className="space-y-8 max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
              <p className="text-muted-foreground mt-1">
                Apply for leave and manage requests from users.
              </p>
            </div>
            <Button asChild variant="outline" className="gap-2">
              <a href={route('/dashboard')}>
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </a>
            </Button>
          </div>

          {/* Top Section: Leave Balance + Apply Leave Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <LeaveBalanceCard balance={balance} />
            </div>
            <div>
              <ApplyLeaveForm onSubmit={applyLeave} />
            </div>
          </div>

          {/* Leave Requests Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Leave Requests</h2>
            {loading ? (
              <p className="text-center text-muted-foreground">Loading leave requests...</p>
            ) : leaves.length === 0 ? (
              <p className="text-center text-muted-foreground">No leave requests found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leaves.map((l) => (
                  <Card key={l.id} className="flex flex-col justify-between h-full">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">{l.userName || 'User'}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {l.fromDate} → {l.toDate} ({l.days} day{l.days > 1 ? 's' : ''})
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-between flex-1">
                      <p className="mb-4">{l.reason}</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => approveLeave(l.id)}
                          className="bg-green-500 hover:bg-green-600 text-white flex-1"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => rejectLeave(l.id)}
                          className="bg-red-500 hover:bg-red-600 text-white flex-1"
                        >
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageLayout.Content>

      <Footer />
    </PageLayout>
  );
};

export default AdminLeavePage;