import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Services from './components/Services.jsx';
import About from './components/About.jsx';
import WhyUs from './components/WhyUs.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import Contact from './components/Contact.jsx';
import Faq from './components/Faq.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <About />
        <WhyUs />
        <HowItWorks />
        <Contact />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
