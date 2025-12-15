import ChatbotPopup from "./components/ChatbotPopup";
import EditorialCarousel from "./components/SlideShow"
import './App.css'
import { useEffect, useState } from "react";
import { loadWorkExps, loadProjExps } from "./llm/db"
import type { WorkExp, ProjExp } from "./llm/db"
import { FaGithub, FaLinkedin } from "react-icons/fa";


export default function Home() {

  // load work experiences
  const [workExps, setWorkExps] = useState<WorkExp[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const exps = await loadWorkExps()
      setWorkExps(exps)
    };

    fetchData();
  }, []);


  // load project experiences
  const [projExps, setProjExps] = useState<ProjExp[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const exps = await loadProjExps()
      setProjExps(exps)
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
            <button
              className="discover-btn"
              onClick={() =>
                document.getElementById("about-me-section")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Discover more ↓
            </button>
          </div>
        </div>
      </section>

      {/* CHATBOT */}
      < ChatbotPopup />

      {/* ABOUT ME */}
      <h1 id="about-me-section">About Me</h1>
      < EditorialCarousel />

      <section id="about-me" className="aboutme-section">
        
        <div className="aboutme-container">
          {/* LEFT COLUMN */}
          <div className="aboutme-info">
            <ul className="info-list">
              <li>
                <strong>Name:</strong>
                <span>Gillian Lee</span>
              </li>

              <li>
                <strong>Pronouns:</strong>
                <span>She/Her</span>
              </li>

              <li>
                <strong>School:</strong>
                <span>Boston University</span>
              </li>

              <li>
                <strong>Degree:</strong>
                <span>Data Science Major & Mathematics Minor</span>
              </li>

              <li>
                <strong>Interests:</strong>
                <span> Scuba Diving (PADI Rescue Diver), Hiking, Indoor Cycling, Modern Literature, Heavy Metal</span>
              </li>

              <li className="social-row">
                <ul className="social-icons">
                  <li><a href="https://github.com/alexandtheoh" target="_blank"><FaGithub /></a></li>
                  <li><a href="https://www.linkedin.com/in/glslee/" target="_blank"><FaLinkedin /></a></li>
                </ul>
              </li>
            </ul>
          </div>

          {/* RIGHT COLUMN */}
          <div className="aboutme-text">
            <p>
              From research labs to consulting rooms and product teams, I've learned I'm energized by work that spans disciplines, 
              moves quickly, and creates tangible impact! I love the rigor of mathematical modeling and technical problem-solving, 
              but what excites me most is translating meaningful problems into strategic solutions that will drive sustainable growth and positive change.
            </p>

            <a href="/resume.pdf" className="resume-btn" target="_blank">
              Download Resume
            </a>
          </div>

        </div>
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
        <h1 className="reveal">Personal Projects</h1>

        {projExps && projExps.map((proj, index) => (
          <div
            key={index}
            className="project-card"
            onClick={() => window.open(proj.link, "_blank")}
          >
            <h2>{proj.name}</h2>
            <p>{proj.description}</p>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <section className="footer">
        <div className="footer-content reveal">
          <p>© 2025 Gillian Lee</p>
          <div className="footer-links">
            <a href="https://github.com/alexandtheoh" target="_blank">GitHub</a>
            <a href="https://www.linkedin.com/in/alexander-oh-zj/" target="_blank">LinkedIn</a>
            <a href="mailto:alexander.oh@u.nus.edu">Email</a>
          </div>
        </div>
      </section>

    </div>
  );
}
