import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";

import Portfolio from "@/components/Portfolio";
import ContactForm from "@/components/ContactForm";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Stats />
      <Services />
      <Testimonials />
      <Portfolio />
      <ContactForm />
    </main>
  );
}
