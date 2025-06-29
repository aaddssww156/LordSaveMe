import React, { useState } from 'react';

import '../css/slider.css';

import menu from '../images/menu.jpg';
import slide1 from '../images/slide1.jpg';
import slide2 from '../images/slide2.jpg';
import slide3 from '../images/slide3.jpg';

const sliderImages = [menu, slide1, slide2, slide3];

function Slider({ images = sliderImages }) {
  const [current, setCurrent] = useState(0);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="slider">
      <div 
        className="slider-images-wrapper"
        style={{
          transform: `translateX(-${current * 100}%)`, 
        }}
      >
        {images.map((image, index) => (
          <img key={index} src={image} alt={`slide-${index}`} className="slider-image" />
        ))}
      </div>

      <button className="slider-btn prev" onClick={prevSlide}>&#10094;</button>
      <button className="slider-btn next" onClick={nextSlide}>&#10095;</button>
    </div>
  );
}

export default Slider;
