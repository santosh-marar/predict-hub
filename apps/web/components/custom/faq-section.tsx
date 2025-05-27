import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";

export default function FAQSection() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* FAQ Heading */}
        <h2 className="text-3xl font-bold text-[#262626] mb-12">FAQs</h2>

        {/* FAQ Accordion */}
        <Accordion type="multiple" className="space-y-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <AccordionItem value="item-1" className="border-0">
              <AccordionTrigger className="text-left text-lg font-semibold text-[#262626] hover:no-underline px-6 py-6 border-gray-200">
                What is Skill-Based All events Gaming?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed px-6 pb-6">
                Skill-based All events gaming is an event-based activity where
                you can showcase your knowledge and expertise by making informed
                decisions about All events-related questions. Your insights and
                skills will be rewarded based on their accuracy and depth.
              </AccordionContent>
            </AccordionItem>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <AccordionItem value="item-2" className="border-0">
              <AccordionTrigger className="text-left text-lg font-semibold text-[#262626] hover:no-underline px-6 py-6 border-gray-200">
                Why Play All events Skill-Based Gaming on Probo?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed px-6 pb-6">
                Joining All events skill-based gaming contests on Probo is an
                engaging way to put your All events knowledge and expertise to
                the test.
              </AccordionContent>
            </AccordionItem>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <AccordionItem value="item-3" className="border-0">
              <AccordionTrigger className="text-left text-lg font-semibold text-[#262626] hover:no-underline px-6 py-6 border-gray-200">
                Can I Win Rewards by Sharing My Insights on All events?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed px-6 pb-6">
                Yes, by demonstrating your knowledge and skills in All events
                through skill-based gaming, you can earn rewards and prizes.
                Your ability to provide accurate insights and informed decisions
                is what sets you apart.
              </AccordionContent>
            </AccordionItem>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <AccordionItem value="item-4" className="border-0">
              <AccordionTrigger className="text-left text-lg font-semibold text-[#262626] hover:no-underline px-6 py-6  border-gray-200">
                How Can I Play the All events Skill-Based Gaming on Probo?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed px-6 pb-6">
                To play All events skill-based gaming on Probo, simply download
                the app, sign up, choose the event you want to participate in
                and start applying your knowledge and skills to make informed
                decisions about the outcomes.
              </AccordionContent>
            </AccordionItem>
          </div>
        </Accordion>
      </div>
    </section>
  );
}
