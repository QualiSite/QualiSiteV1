import Hero from "@/components/Hero/Hero";
import Stats from "@/components/Stats/Stats";
import Services from "@/components/Services/Services";
import Testimonials from "@/components/Testimonials/Testimonials";

import Portfolio from "@/components/PortFolio/Portfolio";
import ContactForm from "@/components/ContactForm/ContactForm";

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
