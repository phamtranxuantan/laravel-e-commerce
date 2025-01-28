import React from "react";
import { Link } from "react-router-dom";

const Banners = () => (
		<section className="padding-bottom">
			<div className="row">
				<aside className="col-md-6">
					<div className="card card-banner-lg bg-dark">
					<img 
									src={require('../../assets/images/banners/banner1.png')} 
							className="card-img opacity" 
							alt="Banner" 
						/>
						<div className="card-img-overlay text-white">
						<h2 className="card-title">Ưu đãi lớn về thiết bị công nghệ</h2>
						<p className="card-text" style={{maxWidth:"80%"}}>Tại TanShop, chúng tôi không chỉ cung cấp những chiếc laptop chất lượng hàng đầu mà còn mang đến cho bạn sự lựa chọn hoàn hảo, từ những mẫu thiết kế tinh tế đến hiệu suất vượt trội, giúp bạn nâng tầm trải nghiệm công nghệ của mình.</p>
						<Link to="/" className="btn btn-light">Xem Sản Phẩm</Link>
						</div>
					</div>
				</aside>
				<div className="col-md-6">
					<div className="card card-banner-lg bg-dark">
						<img src={require('../../assets/images/banners/banner3.png')}  className="card-img opacity"/>
						<div className="card-img-overlay text-white">
						<h2 className="card-title">Sản phẩm chất lượng cao mà giá bèo</h2>
							<p className="card-text" style={{maxWidth:"80%"}}	>Khám phá bộ sưu tập laptop độc quyền tại TanShop, nơi mỗi sản phẩm được chọn lọc kỹ càng để mang đến cho bạn sự kết hợp hoàn hảo giữa hiệu suất mạnh mẽ và thiết kế sang trọng, đáp ứng mọi nhu cầu từ công việc đến giải trí.</p>
						<Link to="/" className="btn btn-light">Xem Sản Phẩm</Link>
						</div>
					</div>
				</div> 
			</div> 
		</section>
 
)
export default Banners



