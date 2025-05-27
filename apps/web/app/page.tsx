// import SignInButton from "@/components/sign-button";
import ControlSection from "@/components/custom/control-section";
import EngageSection from "@/components/custom/engage-section";
import HeroSection from "@/components/custom/hero-section";
import FeaturesSection from "@/components/custom/features-section";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import BenefitsSection from "@/components/custom/benefits-section";
import NewsSection from "@/components/custom/news-section";
import CTASection from "@/components/custom/cta-section";

export default async function Page() {
  return (
    // <div className="flex items-center justify-center min-h-svh">
    //    <h1>Hello world</h1>
    //    <Link href="/sign-up">Sing up page</Link>
    //    {/* <SignInButton/> */}
    // </div>
    <>
      <HeroSection />
      <EngageSection />
      <ControlSection />
      <FeaturesSection />
      <BenefitsSection />
      <NewsSection />
      <CTASection />
    </>
  );
}
