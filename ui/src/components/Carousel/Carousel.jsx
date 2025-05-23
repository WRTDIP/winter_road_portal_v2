import React from "react";
import Carousel from "react-bootstrap/Carousel";
import homebg_1 from "../../assets/homebg_1.png"
import homebg_2 from "../../assets/homebg_2.png";
import homebg_3 from "../../assets/homebg_3.1.png";
import homebg_4 from "../../assets/homebg_4.png";
import './styles.css';

function CarouselHome() {
  return (
    <div className="h-75 container-fluid carousel">
      <Carousel>
        <Carousel.Item>
          <img className="carousel-image" src={homebg_1} alt="First slide" /> 
        </Carousel.Item>
        <Carousel.Item>
          <img className="carousel-image" src={homebg_2} alt="Second slide" />       
        </Carousel.Item>
        <Carousel.Item>
          <img className="carousel-image" src={homebg_3} alt="Third slide" />
        </Carousel.Item>
        <Carousel.Item>
          <img className="carousel-image" src={homebg_4} alt="Fourth slide" />
        </Carousel.Item>
      </Carousel>
    </div>
  );
}

export default CarouselHome;