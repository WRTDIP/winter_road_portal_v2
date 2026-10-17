import React from "react";
import Carousel from "react-bootstrap/Carousel";
import homebg_1 from "../../assets/homebg_1.png"
import homebg_2 from "../../assets/homebg_2.png";
import homebg_3 from "../../assets/homebg_3.1.png";
import homebg_4 from "../../assets/homebg_4.png";
import './styles.css';

const SLIDES = [
  { src: homebg_1, alt: "A plowed winter road crossing snow-covered ground" },
  { src: homebg_2, alt: "Snowmobile tracks leading across open tundra" },
  { src: homebg_3, alt: "A wide ice road through boreal forest under a blue sky" },
  { src: homebg_4, alt: "Cleared lanes of clear blue ice on a winter road" },
];

function CarouselHome() {
  return (
    <div className="carousel-frame">
      <Carousel interval={6000}>
        {SLIDES.map((slide) => (
          <Carousel.Item key={slide.src}>
            <img className="carousel-image" src={slide.src} alt={slide.alt} />
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
}

export default CarouselHome;
