import { MessagesList } from '../components/MessagesList';

export function MessagesPage() {
  return (
    <div className='mx-auto max-w-6xl space-y-6'>
      <section>
        <h2 className='text-2xl font-semibold tracking-tight text-[#111827]'>
          Messages
        </h2>
        <p className='mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]'>
          Review and manage public contact form submissions.
        </p>
      </section>

      <MessagesList />
    </div>
  );
}
