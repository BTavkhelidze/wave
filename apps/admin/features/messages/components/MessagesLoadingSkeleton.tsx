export function MessagesLoadingSkeleton() {
  return (
    <div className='overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='min-w-full text-left'>
          <thead className='bg-[#F8FAFC]'>
            <tr className='border-b border-[#E5E7EB] text-xs font-medium uppercase tracking-wide text-[#6B7280]'>
              <th scope='col' className='px-5 py-3'>
                Sender
              </th>
              <th scope='col' className='px-5 py-3'>
                Subject
              </th>
              <th scope='col' className='px-5 py-3'>
                Status
              </th>
              <th scope='col' className='px-5 py-3'>
                Received
              </th>
              <th scope='col' className='px-5 py-3'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className='border-b border-[#E5E7EB]'>
                <td className='px-5 py-4'>
                  <div className='h-4 w-36 animate-pulse rounded bg-[#E5E7EB]' />
                  <div className='mt-2 h-3 w-48 animate-pulse rounded bg-[#F3F4F6]' />
                </td>
                <td className='px-5 py-4'>
                  <div className='h-4 w-48 animate-pulse rounded bg-[#E5E7EB]' />
                  <div className='mt-2 h-3 w-64 animate-pulse rounded bg-[#F3F4F6]' />
                </td>
                <td className='px-5 py-4'>
                  <div className='h-6 w-16 animate-pulse rounded-full bg-[#E5E7EB]' />
                </td>
                <td className='px-5 py-4'>
                  <div className='h-4 w-24 animate-pulse rounded bg-[#E5E7EB]' />
                </td>
                <td className='px-5 py-4'>
                  <div className='h-8 w-16 animate-pulse rounded bg-[#E5E7EB]' />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
