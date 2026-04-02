import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import TechStackSection from '@/components/TechStackSection';
import ExperienceSection from '@/components/ExperienceSection';
import ProjectsSection from '@/components/ProjectsSection';
import EducationSection from '@/components/EducationSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-[100dvh]">
      <Navbar />
      <main>
        <HeroSection />
        <div className="section-divider" />
        <AboutSection />
        <div className="section-divider" />
        <TechStackSection />
        <div className="section-divider" />
        <ExperienceSection />
        <div className="section-divider" />
        <ProjectsSection />
        <div className="section-divider" />
        <EducationSection />
        <div className="section-divider" />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
