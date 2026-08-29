import {
  getAdminLogActionLabel,
  getAdminLogEntityLabel,
} from '../model/adminLogs.constants';
import type { AdminLog } from '../model/adminLogs.types';

type AdminLogsTableProps = {
  logs: AdminLog[];
};

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function AdminLogsTable({ logs }: AdminLogsTableProps) {
  return (
    <div className='overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='min-w-full text-left'>
          <thead className='bg-[#F8FAFC]'>
            <tr className='border-b border-[#E5E7EB] text-xs font-medium uppercase tracking-wide text-[#6B7280]'>
              <th scope='col' className='px-5 py-3'>
                Date and time
              </th>
              <th scope='col' className='px-5 py-3'>
                Admin
              </th>
              <th scope='col' className='px-5 py-3'>
                Role
              </th>
              <th scope='col' className='px-5 py-3'>
                Action
              </th>
              <th scope='col' className='px-5 py-3'>
                Entity
              </th>
              <th scope='col' className='px-5 py-3'>
                Target ID
              </th>
              <th scope='col' className='px-5 py-3'>
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr
                key={log.id}
                className='border-b border-[#E5E7EB] last:border-b-0'
              >
                <td className='whitespace-nowrap px-5 py-4 text-sm text-[#111827]'>
                  {formatDateTime(log.createdAt)}
                </td>
                <td className='whitespace-nowrap px-5 py-4 text-sm font-medium text-[#111827]'>
                  {log.user?.email ?? 'Deleted user'}
                </td>
                <td className='whitespace-nowrap px-5 py-4'>
                  {log.user ? (
                    <Badge tone='neutral'>{formatRole(log.user.role)}</Badge>
                  ) : (
                    <span className='text-sm text-[#6B7280]'>Unavailable</span>
                  )}
                </td>
                <td className='whitespace-nowrap px-5 py-4'>
                  <Badge tone={getActionTone(log.action)}>
                    {getAdminLogActionLabel(log.action)}
                  </Badge>
                </td>
                <td className='whitespace-nowrap px-5 py-4 text-sm text-[#6B7280]'>
                  {getAdminLogEntityLabel(log.entity)}
                </td>
                <td className='max-w-[220px] truncate px-5 py-4 font-mono text-xs text-[#6B7280]'>
                  {log.entityId ?? '-'}
                </td>
                <td className='min-w-[240px] px-5 py-4 text-sm text-[#6B7280]'>
                  {getLogDescription(log)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type BadgeTone = 'danger' | 'neutral' | 'success' | 'warning';

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: BadgeTone;
}) {
  const classNameByTone: Record<BadgeTone, string> = {
    danger: 'bg-[#FEF2F2] text-[#B91C1C]',
    neutral: 'bg-[#F8FAFC] text-[#6B7280]',
    success: 'bg-[#ECFDF5] text-[#047857]',
    warning: 'bg-[#FFFBEB] text-[#B45309]',
  };

  return (
    <span
      className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${classNameByTone[tone]}`}
    >
      {children}
    </span>
  );
}

function formatDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}

function formatRole(role: string): string {
  return role
    .split('_')
    .map((part) => part[0] + part.slice(1).toLowerCase())
    .join(' ');
}

function getActionTone(action: AdminLog['action']): BadgeTone {
  if (action === 'DELETE' || action === 'ARCHIVE') {
    return 'danger';
  }

  if (action === 'CREATE' || action === 'LOGIN' || action === 'PUBLISH') {
    return 'success';
  }

  if (action === 'PASSWORD_CHANGE' || action === 'UPDATE') {
    return 'warning';
  }

  return 'neutral';
}

function getLogDescription(log: AdminLog): string {
  const actor = log.user?.email ?? 'A deleted user';
  const action = getAdminLogActionLabel(log.action).toLowerCase();
  const entity = getAdminLogEntityLabel(log.entity).toLowerCase();

  return `${actor} performed ${action} on ${entity}.`;
}
