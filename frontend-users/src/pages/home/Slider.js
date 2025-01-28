import axios from "axios";
import React, { useEffect, useState } from "react";

const Slider = () => {
    const [sliders, setSliders] = useState([]);

    useEffect(() => {
        // Gọi API để lấy dữ liệu slider
        axios.get('http://localhost:8000/api/sliders')
            .then(response => {
                setSliders(response.data);
            })
            .catch(error => {
                console.error('Có lỗi xảy ra khi tải dữ liệu slider:', error);
            });
    }, []);

    return (
        <div id="carousel1_indicator" className="slider-home-banner carousel slide" data-ride="carousel">
            <ol className="carousel-indicators">
                {sliders.map((slider, index) => (
                    <li key={index} data-target="#carousel1_indicator" data-slide-to={index} className={index === 0 ? "active" : ""}></li>
                ))}
            </ol>
            <div className="carousel-inner">
                {sliders.map((slider, index) => (
                    <div key={index} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                        <img src={slider.image_url} alt={`Slide ${index + 1}`} />
                    </div>
                ))}
            </div>
            <a className="carousel-control-prev" href="#carousel1_indicator" role="button" data-slide="prev">
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="sr-only">Previous</span>
            </a>
            <a className="carousel-control-next" href="#carousel1_indicator" role="button" data-slide="next">
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="sr-only">Next</span>
            </a>
        </div>
    );
};

export default Slider;
