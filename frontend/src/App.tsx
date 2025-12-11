import ChatbotPopup from "./components/ChatbotPopup";
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
            <h1>Hey, I’m Alex!</h1>
            <p>
              Ask my chatbot anything you want to know about me!<br />
              It might not work on all devices 😢.
            </p>
          </div>
        </div>
      </section>

      {/* CHATBOT */}
      <ChatbotPopup />

      {/* ABOUT ME */}
      <h1>About Me</h1>
      <section id="about-me" className="aboutme-section">
        
        <div className="aboutme-container">
          {/* LEFT COLUMN */}
          <div className="aboutme-info">
            <ul className="info-list">
              <li>
                <strong>Name:</strong>
                <span>Alexander Oh</span>
              </li>

              <li>
                <strong>Pronouns:</strong>
                <span>He/Him</span>
              </li>

              <li>
                <strong>School:</strong>
                <span>National University of Singapore</span>
              </li>

              <li>
                <strong>Major:</strong>
                <span>Computer Science</span>
              </li>

              <li>
                <strong>Interests:</strong>
                <span>Tennis, Basketball, Hiking and Pokemon Showdown</span>
              </li>

              <li className="social-row">
                <ul className="social-icons">
                  <li><a href="https://github.com/alexandtheoh" target="_blank"><FaGithub /></a></li>
                  <li><a href="https://www.linkedin.com/in/alexander-oh-zj/" target="_blank"><FaLinkedin /></a></li>
                </ul>
              </li>
            </ul>
          </div>

          {/* RIGHT COLUMN */}
          <div className="aboutme-text">
            <p>
              I'm an undergraduate Computer Science student at the National University of Singapore, 
              where I focus on networks, distributed systems, and concurrent programming. I love 
              thinking about how systems behave at scale and how we can build software that is fast, 
              resilient, and elegant.
            </p>

            <p>
              Outside academics, I enjoy working on side projects, making espresso, playing sports, and spending time in nature.
              I also enjoy meeting new people, whether it’s for a good conversation or a good cup of coffee.
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
          <div 
            className="experience-card"
            style={{ transitionDelay: `${index * 0.1}s` }} // stagger
            onClick={() => window.open(exp.website, "_blank")}
            key={index}
          >
            <h2>{exp.name}</h2>
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
            style={{ transitionDelay: `${index * 0.1}s` }}
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
          <p>© 2025 Alexander Oh</p>
          <div className="footer-links">
            <a href="https://github.com/alexandtheoh" target="_blank">GitHub</a>
            <a href="https://www.linkedin.com/in/alexander-oh-zj/" target="_blank">LinkedIn</a>
            <a href="mailto:alexander.oh@u.nus.edu">Email</a>
          </div>
          <p className="footer-credit">Designed & built by Alex ✨</p>
        </div>
      </section>

    </div>
  );
}
