import axios from 'axios';
import React, { useEffect, useState } from 'react';
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
const RelatedProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:8000/api/discounted-products')
            .then(response => {
                setProducts(response.data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    // Cấu hình cho react-slick
    const settings = {
        dots: true,              // Hiển thị các dấu chấm
        infinite: true,          // Vòng lặp vô hạn
        speed: 500,              // Tốc độ chuyển slide
        slidesToShow: 4,         // Hiển thị 4 sản phẩm mỗi lần
        slidesToScroll: 1,       // Cuộn 1 sản phẩm mỗi lần
        autoplay: true,          // Tự động cuộn
        autoplaySpeed: 3000,     // Tốc độ tự động cuộn (3 giây)
        responsive: [            // Tương thích trên các màn hình nhỏ hơn
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    };

    return (
        <div>
            <div className="section-heading heading-line" >
    
    {/* Tiêu đề h4 */}
    <h4 
        style={{ 
            textAlign: 'center', 
            backgroundColor: '#fff',  
            padding: '0 15px',         
            fontWeight: 'bold',
            fontSize: '18px',
        }} 
        className="title-section text-uppercase"
    >
        Sản phẩm liên quan
    </h4>
</div>

        <div>
            {/* <Slider {...settings}>
                {products.map(product => (
                    <div key={product.id} style={{
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        width: '250px',
                        margin: '15px'
                    }}>
                        <div style={{ position: 'relative' }}>
                            <img
                                src={product.photo ? `http://localhost:8000/storage/sliders/${JSON.parse(product.photo)[0]}` : 'default-placeholder.jpg'}
                                alt={product.name}
                                style={{
                                    width: '100%',
                                    height: '180px',
                                    objectFit: 'cover',
                                    borderTopLeftRadius: '8px',
                                    borderTopRightRadius: '8px'
                                }}
                            />
                            {product.discount > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    left: '10px',
                                    backgroundColor: '#ff5722',
                                    color: '#fff',
                                    padding: '5px 10px',
                                    borderRadius: '3px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    zIndex: '10'
                                }}>
                                    - {product.discount}% 
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '10px', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '16px', margin: '10px 0', color: '#333', fontWeight: 'bold' }}>
                                {product.name}
                            </h3>
                            <p style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>
                                {product.description}
                            </p>
                            {product.price_before > product.discounted_price && (
                                <>
                                    <p style={{ fontSize: '14px', color: '#888', textDecoration: 'line-through' }}>
                                        ${product.price_before.toFixed(2)}
                                    </p>
                                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#e91e63', marginBottom: '10px' }}>
                                        ${product.discounted_price.toFixed(2)}
                                    </h4>
                                </>
                            )}
                            {product.price_before === product.discounted_price && (
                                <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#e91e63', marginBottom: '10px' }}>
                                    ${product.discounted_price.toFixed(2)}
                                </h4>
                            )}
                        </div>
                        <div style={{ padding: '15px', borderTop: '1px solid #ddd', textAlign: 'center' }}>
                            <button
                                style={{
                                    backgroundColor: '#e91e63',
                                    border: 'none',
                                    color: '#fff',
                                    padding: '10px 15px',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    transition: 'background-color 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#ff3366'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#e91e63'}
                            >
                                <i className="fa fa-shopping-cart"></i> Add to cart
                            </button>
                        </div>
                    </div>
                ))}
            </Slider> */}
        </div>
        </div>
        
    );
};

export default RelatedProducts;
