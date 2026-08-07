// import BlogsLanding from '@/components/LandingPage/BlogsLanding';
import CompanyName from '@/components/LandingPage/companyName';

import SingleService from '@/components/LandingPage/HeroSwiper/SingleService';
import VentilationCalculatorHero from '@/components/LandingPage/VentilationCalculatorHero';
import { WellcomeScrollSect2 } from '@/components/LandingPage/WellcomeScrollSect2';

import MotionInViewSection from '@/components/ui/MotionInViewSectionProps';

export default function Home() {
  return (
    <main className='overflow-hidden'>
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
