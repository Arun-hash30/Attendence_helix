import React from 'react';
import { Button } from '@voilajsx/uikit/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@voilajsx/uikit/dropdown-menu';
import { useAuth } from '../../auth';
import { route } from '../../../shared/utils';

export const PayslipsNavDropdown: React.FC = () => {
  const { user } = useAuth();

  const isAdmin =
    user &&
    ['admin.tenant', 'admin.org', 'admin.system'].includes(
      `${user.role}.${user.level}`
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          Payslips
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="bottom" align="start" className="min-w-[200px]">
        {/* All users */}
        <DropdownMenuItem>
          <a href={route('/payslips')}>My Payslips</a>
        </DropdownMenuItem>

        {/* Admin-only */}
        {isAdmin && (
          <>
            <DropdownMenuItem>
              <a href={route('/payslips/salary')}>Salary Structure</a>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <a href={route('/payslips/generate')}>Generate Payslip</a>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
