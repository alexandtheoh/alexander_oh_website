import ChatbotPopup from "./components/ChatbotPopup";
import EditorialCarousel from "./components/SlideShow"
import './App.css'
import { useEffect, useState } from "react";
import { loadWorkExps, loadProjExps, loadPersonalLinks } from "./llm/db"
import type { WorkExp, ProjExp, PersonalLinks } from "./llm/db"
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";


export default function Home() {

  // load work experiences
  const [workExps, setWorkExps] = useState<WorkExp[] | null>(null);
  const [projExps, setProjExps] = useState<ProjExp[] | null>(null);
  const [personalLinks, setPersonalLinks] = useState<PersonalLinks | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // load work experiences
      const wExps = await loadWorkExps()
      setWorkExps(wExps)

      // load project experiences
      const pExps = await loadProjExps()
      setProjExps(pExps)

      // load personal links
      const pLinks = await loadPersonalLinks()
      setPersonalLinks(pLinks)
    };

    fetchData();
  }, []);


  // animating cards
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 } // trigger when 10% visible
    );

    // Select all experience cards after render
    const cards = document.querySelectorAll(".experience-card, .project-card, .reveal");
    cards.forEach((card) => observer.observe(card));

    // Cleanup on unmount
    return () => {
      cards.forEach((card) => observer.unobserve(card));
    };
  }, [workExps, projExps]); // <-- dependency ensures it runs after workExps are rendered

  return (
    <div className="page-container">
      {/* INTRO */}
      <section id="about" className="section about-section">
        <div className="about-image-container">
          <div className="about-text reveal">
            <h1>Hi, I’m Gillian!</h1>
            <p>
              Ask my chatbot anything you want to know about me!
            </p>

            <div className="button-container">
              {/* resume button */}
              <a href={personalLinks?.resume} className="discover-btn" target="_blank">Download Resume</a>

              {/* discover more button */}
              <a 
                href="#about-me-section"
                className="discover-btn"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("about-me-section")?.scrollIntoView({ 
                    behavior: "smooth" 
                  });
                }}
              >
                Discover more ↓
              </a>

            </div>
          </div>
        </div>
      </section>

      {/* CHATBOT */}
      < ChatbotPopup />

      {/* ABOUT ME */}
      <section id="about-me-section" className="about-me reveal">
        <h1>About Me</h1>
        <EditorialCarousel />
      </section>



      {/* EXPERIENCES */}
      <section id="experience" className="section experience-section">
        <h1 className="reveal">Work Experiences</h1>

        {workExps && workExps.map((exp, index) => (
          <div className="experience-card"
            onClick={() => window.open(exp.website)}
            key={index}
          >
            <div className="exp-header">
              <img src={exp.logo} alt={`${exp.name} logo`} />
              <h2>{exp.name}</h2>
            </div>
            <p>{exp.description}</p>
          </div>

        ))}
      </section>


      {/* PROJECTS */}
      <section id="projects" className="section projects-section">
        <h1 className="reveal">Extra Curriculars</h1>

        {projExps && projExps.map((proj, index) => (
          <div
            key={index}
            className="project-card"
          >
            {/* Background overlay */}
            <div
              className="background-hover"
              style={{ backgroundImage: `url(${proj.src})` }}
            ></div>

            {/* Content on top */}
            <div className="content">
              <h2>{proj.name}</h2>
              <p>{proj.description}</p>
            </div>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <section className="footer">
        <div className="footer-content reveal">
          <p>© 2025 Gillian Lee</p>
          <div className="footer-links">
            <a href={personalLinks?.github} target="_blank"><FaGithub /></a>
            <a href={personalLinks?.linkedin} target="_blank"><FaLinkedin /></a>
            <a href={`mailto:${personalLinks?.email}`} target="_blank"><FaEnvelope /></a>
          </div>
        </div>
      </section>

    </div>
  );
}
