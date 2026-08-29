import { CreateBlogForm } from '../components/CreateBlogForm';

export function CreateBlogPage() {
  return (
    <div className='mx-auto max-w-6xl space-y-6'>
      <section>
        <h2 className='text-2xl font-semibold tracking-tight text-[#111827]'>
          Create Blog
        </h2>
        <p className='mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]'>
          Draft a new article, prepare publication settings, upload a cover
          image, and save it through the Blog API.
        </p>
      </section>

      <CreateBlogForm />
    </div>
  );
}
