import React, { useState } from 'react';
import Collections from "../pages/home/Collections";

// import ToastMessage from "../assets/js/components/home/ToastMessage";
import HotDeals from "../pages/home/HotDeals";
import Widgets from "../pages/home/Widgets";
import CategoryFilter from "../pages/home/CategoryFilter";

import Slider from '../pages/home/Slider';
import Banners from '../pages/home/Banners';
import AllProducts from '../pages/products/AllProducts';
import DiscountedProducts from '../pages/products/DiscountedProducts';
import NewProducts from '../pages/products/NewProducts';
const Home=()=> {
    const [currentCategory, setCurrentCategory] = useState(null);
    return(
        <home id="home">
            <div className="container">
                {/* <div id="top-header">
                    <div className="container" style={{ backgroundColor: '#EEEEEE', position: 'relative', height: '150px', border: '1px solid #ccc', borderRadius: '15px' }}>
                        <h4 style={{ position: 'absolute', top: 0, left: 0, margin: '10px',textTransform: 'uppercase',color: '#4a90e2',fontWeight:'bold' }}>Danh mục nổi bật</h4>
                        <div className="row">
                        <CategoryFilter
                            currentCategory={currentCategory}
                            setCurrentCategory={setCurrentCategory} // Truyền setCurrentCategory vào đây
                        />
                        </div>
                    </div>
                </div> */}
                <Slider/>
                <div
                    style={{
                    height: '40px', // Thay đổi chiều cao theo nhu cầu của bạn
                    margin: '20px 0', // Thay đổi khoảng cách trên và dưới theo nhu cầu
                    }}
                ></div>
                <div class="section-heading heading-line"><h4 class="title-section text-uppercase">Sản phẩm hiện có</h4></div>
                    <AllProducts currentCategory={currentCategory}/>
                {/* <ProductPage  currentCategory={currentCategory} id = "2"/> */}
                <div class="section-heading heading-line"><h4 class="title-section text-uppercase"></h4></div>

                <Banners/>
                {/* <div class="section-heading heading-line"><h4 class="title-section text-uppercase">Sản phẩm mới nhất</h4></div>
                <NewProducts/>
                <div className='huhu' style={{height: '40px', backgroundColor: '#f0f0f0', margin: '20px 0', }}></div>
                <div class="section-heading heading-line"><h4 class="title-section text-uppercase">Sản phẩm khuyến mãi</h4></div>
                <DiscountedProducts/> */}
                {/* <Collections/> */}
                {/* <ToastMessage/> */}
                
                {/* <HotDeals/>
                <Carousel title="Top Selling" id = "2"/>
                <Widgets/> */}
                <section className="padding-y-lg bg-light border-top">
                    <div className="container">

                    <p className="pb-2 text-center">Delivering the latest product trends and industry news straight to your inbox</p>

                    <div className="row justify-content-md-center">
                    <div className="col-lg-4 col-sm-6">
                    <form className="form-row">
                        <div className="col-8">
                        <input className="form-control" placeholder="Your Email" type="email"/>
                        </div>
                        <div className="col-4">
                        <button type="submit" className="btn btn-block btn-warning"> <i className="fa fa-envelope"></i> Subscribe </button>
                        </div> 
                    </form>
                    <small className="form-text">We’ll never share your email address with a third-party. </small>
                    </div>
                    </div>
                    

                    </div>
                    </section>
            </div>
        </home>
        
    )
}
export default Home