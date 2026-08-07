import RefineClientProvider from '../../../../fetures/refine/components/RefineClientProvider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RefineClientProvider>{children}</RefineClientProvider>;
}
