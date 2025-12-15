import { useEffect, useState } from "react";
import '../App.css'

const interval = 4000

interface CarouselItem {
  type: "image" | "feature";
  src?: string;
  title?: string;
  subtitle?: string;
  description?: string;
}

interface Props {
  items: CarouselItem[];
  interval?: number;
}

const items: CarouselItem[] = [
  {
    type: "feature",
    src: "/test.jpeg",
    title: "Beautiful Landscape",
    subtitle: "Nature at its best",
    description: "A stunning view of mountains and lakes"
  },
    {
    type: "image",
    src: "/test.jpeg",
    title: "Beautiful Landscape",
    subtitle: "Nature at its best",
    description: "A stunning view of mountains and lakes"
  },
    {
    type: "image",
    src: "/test.jpeg",
    title: "Beautiful Landscape",
    subtitle: "Nature at its best",
    description: "A stunning view of mountains and lakes"
  },
    {
    type: "image",
    src: "/test.jpeg",
    title: "Beautiful Landscape",
    subtitle: "Nature at its best",
    description: "A stunning view of mountains and lakes"
  },
    {
    type: "image",
    src: "/test.jpeg",
    title: "Beautiful Landscape",
    subtitle: "Nature at its best",
    description: "A stunning view of mountains and lakes"
  },
]

export default function EditorialCarousel() {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (hovered) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, interval);

    return () => clearInterval(timer);
  }, [hovered, items.length]);

  return (
    <section
      className="editorial-section"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button className="nav-btn left" onClick={() => setIndex(i => Math.max(i - 1, 0))}>
        ‹
      </button>

      <div className="carousel-window">
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${index * 22}%)` }}
        >
          {items.map((item, i) =>
            item.type === "image" ? (
              <img key={i} src={item.src} className="carousel-image" />
            ) : (
              <div key={i} className="feature-card">
                <span className="meta">{item.subtitle}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <button className="cta">Learn more →</button>
              </div>
            )
          )}
        </div>
      </div>

      <button className="nav-btn right" onClick={() => setIndex(i => i + 1)}>
        ›
      </button>
    </section>
  );
}


