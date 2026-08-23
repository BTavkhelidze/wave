import dynamic from 'next/dynamic';

const CompanyName = dynamic(() => import('@/components/LandingPage/companyName'));
const ServisesListS2 = dynamic(
  () => import('@/components/services/ServisesListS2'),
);

function page() {
  return (
    <main className='relative xl:px-[8%] flex-1   w-full  justify-center items-center  flex flex-col pt-0 md:pt-30    pb-[50px]'>
      <div className='w-full' id='top'></div>
      <div className='w-full'>
        <CompanyName />
      </div>
      <div className='my-20 w-full'>
        <ServisesListS2 />
      </div>
    </main>
  );
}

export default page;
