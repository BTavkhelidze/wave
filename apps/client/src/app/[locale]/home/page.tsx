import dynamic from 'next/dynamic';

const CompanyName = dynamic(() => import('@/components/LandingPage/companyName'));
const MotionInViewSection = dynamic(
  () => import('@/components/ui/MotionInViewSectionProps'),
);
const SingleService = dynamic(
  () => import('@/components/LandingPage/HeroSwiper/SingleService'),
);
const VentilationCalculatorHero = dynamic(
  () => import('@/components/LandingPage/VentilationCalculatorHero'),
);
const WellcomeScrollSect2 = dynamic(() =>
  import('@/components/LandingPage/WellcomeScrollSect2').then(
    (mod) => mod.WellcomeScrollSect2,
  ),
);

export default function Home() {
  return (
    <main className='overflow-hidden '>
      <div className='min-h-[100dvh] overflow-hidden  h-full w-full   flex flex-col'>
        <CompanyName />
        <WellcomeScrollSect2 />
      </div>

      <MotionInViewSection delay={0.3}>
        <SingleService />
      </MotionInViewSection>
      <MotionInViewSection delay={0.3}>
        <VentilationCalculatorHero />
      </MotionInViewSection>
    </main>
  );
}
