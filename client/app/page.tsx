import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { Highlights } from "@/components/landing/highlights";
import { FeaturedCourses } from "@/components/landing/featured-courses";
import { Categories } from "@/components/landing/categories";
import { WhyRelay } from "@/components/landing/why-relay";
import { LessonPreview } from "@/components/landing/lesson-preview";
import { Community } from "@/components/landing/community";
import { InstructorCTA } from "@/components/landing/instructor-cta";
import { FinalCTA } from "@/components/landing/final-cta";
import { FooterSection } from "@/components/landing/footer-section";
import { FadeInSection } from "@/components/shared/fade-in-wrapper";

export default function LandingPage() {
  return (
    <>
      <Nav />
      <FadeInSection><Hero /></FadeInSection>
      <FadeInSection><Highlights /></FadeInSection>
      <FadeInSection><FeaturedCourses /></FadeInSection>
      <FadeInSection><Categories /></FadeInSection>
      <FadeInSection><WhyRelay /></FadeInSection>
      <FadeInSection><LessonPreview /></FadeInSection>
      <FadeInSection><Community /></FadeInSection>
      <FadeInSection><InstructorCTA /></FadeInSection>
      <FadeInSection><FinalCTA /></FadeInSection>
      <FooterSection />
    </>
  );
}
