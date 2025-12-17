import { useEffect, useState, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";
import type { SlideShowItem } from "../llm/db"
import { loadSlideShowItems } from "../llm/db"
import ReactMarkdown from "react-markdown";


import '../App.css'

// time between carousell spins
const interval = 4500;

const emblaOptions: EmblaOptionsType = {
  loop: true,
  align: "center",
  skipSnaps: false,
};

export default function EditorialCarousel() {
  // load slides
  const [slides, setSlides] = useState<SlideShowItem[] | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      const data = await loadSlideShowItems()
      setSlides(data)
    };

    fetchData();
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions);
  const [hovered, setHovered] = useState(false);

  // effect for central slide
  useEffect(() => {
    if (!emblaApi) return;

    const slides = emblaApi.slideNodes();

    const wrapDistance = (a: number, b: number) => {
      const diff = Math.abs(a - b);
      return Math.min(diff, 1 - diff);
    };

    const onScroll = () => {
      const progress = emblaApi.scrollProgress();
      const snapPoints = emblaApi.scrollSnapList();

      let closestIndex = 0;
      let minDistance = Infinity;

      snapPoints.forEach((snap, index) => {
        const distance = wrapDistance(progress, snap);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      slides.forEach((slide, index) => {
        const inner = slide.querySelector('.embla__slide-inner') as HTMLElement;

        const distance = wrapDistance(progress, snapPoints[index]);
        const scale = Math.max(0.85, 1 - distance * 1.4);

        // scale effect
        inner.style.transform = `scale(${scale})`;

        // center state
        slide.classList.toggle('is-centered', index === closestIndex);
      });
    };

    emblaApi.on('scroll', onScroll);
    emblaApi.on('reInit', onScroll);
    onScroll();

    return () => {
      emblaApi.off('scroll', onScroll);
      emblaApi.off('reInit', onScroll);
    };
  }, [emblaApi]);


  // detect when embla is in view
  const carouselRef = useRef(null);
  const [inView, setInView] = useState(false);


  useEffect(() => {
    if (!carouselRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      {
        threshold: 0.4, // run when 40% visible
      }
    );

    observer.observe(carouselRef.current);

    return () => observer.disconnect();
  }, []);


  // Autoplay
  useEffect(() => {
    if (!emblaApi || hovered || !inView) return;

    const timer = setInterval(() => {
      emblaApi.scrollNext();
    }, interval);

    return () => clearInterval(timer);
  }, [emblaApi, hovered, interval]);

  return (
    <section
      className="editorial-section embla"
    >
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container" ref={carouselRef}>
          {slides && slides.map((item, index) => (
            <div 
              className="embla__slide" 
              key={index}
            >
              <div
                className="embla__slide-inner"
                style={{ backgroundImage: `url(${item.src})` }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                <div className="slide-overlay">
                  <h3 className="slide-title">
                    <strong>{item.title}</strong>
                  </h3>
                  <p className="slide-description">{item.synopsis}</p>
                  <div className="full-description">
                    <ReactMarkdown>{item.description}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <button
        className="nav-btn left"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => emblaApi?.scrollPrev()}
      >
        ‹
      </button>
      <button
        className="nav-btn right"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => emblaApi?.scrollNext()}
      >
        ›
      </button>

    </section>
  );
}



