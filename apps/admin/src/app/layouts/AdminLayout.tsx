import AdminShell from '../../../features/AdminShell/page/AdminShell';
import { AdminSidebar } from '../../../Widgets/AsidePanel';
import { useMediaQuery } from '../../shared/hooks/useMediaQuery';
import { DesktopRequiredOverlay } from '../../shared/ui/desktop-required';

const ADMIN_DESKTOP_MEDIA_QUERY = '(max-width: 1140px)';

export function AdminLayout() {
  const shouldShowDesktopRequiredOverlay = useMediaQuery(
    ADMIN_DESKTOP_MEDIA_QUERY,
  );

  return (
    <div className='flex'>
      <AdminSidebar />
      <div className='flex-1'>
        <AdminShell />
      </div>
      {shouldShowDesktopRequiredOverlay && <DesktopRequiredOverlay />}
    </div>
  );
}
