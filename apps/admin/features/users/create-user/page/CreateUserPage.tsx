import { CreateUserForm } from '../components/CreateUserForm';

function CreateUserPage() {
  return (
    <div className='mx-auto max-w-3xl space-y-6'>
      <section>
        <h2 className='text-2xl font-semibold tracking-tight text-[#111827]'>
          Create user
        </h2>
        <p className='mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]'>
          Create an admin account profile and set whether the user can access
          protected admin functionality.
        </p>
      </section>

      <CreateUserForm />
    </div>
  );
}

export default CreateUserPage;
