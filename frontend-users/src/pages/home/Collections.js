import React, { useState, useEffect } from "react";

const Collections = () => {
    const images = [
        // require("../../assets/images/1.png"),
        // require("../../assets/images/dien1.png"),
        // require("../../assets/images/lap5.png"),
    ];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 2000);

        return () => clearInterval(interval);
    }, [images.length]);

    const handlePrev = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const handleNext = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    return (
        <div className="section" style={{ position: 'relative' }}>
  <div className="container" style={{ position: 'relative' }}>
    
    <div className="row" style={{ position: 'relative' }}>
      <img
        src={images[currentImageIndex]}
        alt="slideshow"
        style={{
          width: '100%',
          height: '30%',
          aspectRatio: '2 / 1',
          display: 'block',
        }}
        className="slideshow-img"
      />
    </div>
    
  </div>
</div>

    );
};

export default Collections;
