import React from 'react';
import { PageLayout } from '@voilajsx/uikit/page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { ArrowLeft } from 'lucide-react';
import { Header, Footer, SEO } from '../../../shared/components';
import { route } from '../../../shared/utils';
import { useLeave } from '../hooks/useLeave';

const AdminLeavePage: React.FC = () => {
  const { leaves = [], approveLeave, rejectLeave, loading } = useLeave();

  return (
    <PageLayout>
      <SEO title="Admin Leave Requests" description="Manage leave requests from employees" />
      <Header />

      <PageLayout.Content>
        <div className="space-y-6">
          {/* Page Title */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Leave Requests</h1>
              <p className="text-muted-foreground">
                Approve or reject leave requests submitted by users.
              </p>
            </div>
            <Button asChild variant="outline" className="gap-2">
              <a href={route('/dashboard')}>
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </a>
            </Button>
          </div>

          {/* Leave Cards */}
          {loading ? (
            <p className="text-center text-muted-foreground">Loading leaves...</p>
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
      </PageLayout.Content>

      <Footer />
    </PageLayout>
  );
};

export default AdminLeavePage;