import { cookies } from "next/headers";
import ControlSection from "@/components/custom/control-section";
import EngageSection from "@/components/custom/engage-section";
import HeroSection from "@/components/custom/hero-section";
import FeaturesSection from "@/components/custom/features-section";
import BenefitsSection from "@/components/custom/benefits-section";
import NewsSection from "@/components/custom/news-section";
import CTASection from "@/components/custom/cta-section";

export default async function Page() {

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("better-auth.session_token");

  const response = await fetch("http://localhost:8080/api/v1/user/users", {
    headers: {
      Cookie: cookieStore.toString(), // Forward all cookies
      // OR just the session cookie:
      // 'Cookie': `better-auth.session_token=${sessionCookie?.value}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  console.log("data", data);

  return (
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
