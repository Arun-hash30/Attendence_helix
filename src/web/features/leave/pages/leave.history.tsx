import React from 'react';
import { PageLayout } from '@voilajsx/uikit/page';
import { Header, Footer, SEO } from '../../../shared/components';
import { useLeave } from '../hooks/useLeave';
import { LeaveList } from '../components/LeaveList';

const LeaveHistoryPage: React.FC = () => {
  const { leaves, loading } = useLeave();

  return (
    <PageLayout>
      <SEO title="Leave History" description="View all your leave requests" />
      <Header />

      <PageLayout.Content>
        <div className="max-w-5xl mx-auto space-y-6 py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Leave History</h1>
            <p className="text-muted-foreground">
              Review your past leave requests and their statuses.
            </p>
          </div>

          {/* Loading or empty state */}
          {loading ? (
            <p className="text-center text-muted-foreground">Loading leaves...</p>
          ) : leaves.length === 0 ? (
            <p className="text-center text-muted-foreground">No leave history found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <LeaveList leaves={leaves} />
            </div>
          )}
        </div>
      </PageLayout.Content>

      <Footer />
    </PageLayout>
  );
};

export default LeaveHistoryPage;