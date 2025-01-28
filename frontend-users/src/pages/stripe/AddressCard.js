import React, { Component } from 'react';
import { Link } from 'react-router-dom';
class AddressCard extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { address } = this.props; // Destructuring props để dễ dàng truy cập

        return (
            <div id="address-card">
                <i className="fa fa-map-marker" aria-hidden="true"></i>
                <p>{address.fullname}</p> {/* Hiển thị họ tên đầy đủ */}
                <p>{address.address}</p> {/* Hiển thị địa chỉ cụ thể */}
                <p>{address.province}, {address.district}, {address.ward},{address.address}</p> {/* Hiển thị tỉnh/thành phố, quận/huyện, phường/xã */}
                <p>{address.phone}</p> {/* Hiển thị số điện thoại */}
                <Link to="/" className="btn btn-light">
												<i className="fa fa-chevron-left"></i> Tiếp tục mua hàng
											</Link>
            </div>
            
        );
    }
}

export default AddressCard;





// import React, { Component } from 'react';

// class AddressCard extends Component {
//     constructor(props) {
//         super(props);
//     }

//     getProvinceName = (code) => {
//         const { provinces } = this.props; // Danh sách các tỉnh thành phố
//         const province = provinces.find(p => p.code === code);
//         return province ? province.name : code; // Trả về tên hoặc mã nếu không tìm thấy
//     }
   
//     getDistrictName = (code) => {
//         const { districts } = this.props; // Danh sách các quận huyện
//         const district = districts.find(d => d.code === code);
//         return district ? district.name : code; // Trả về tên hoặc mã nếu không tìm thấy
//     }

//     getWardName = (code) => {
//         const { wards } = this.props; // Danh sách các xã phường
//         const ward = wards.find(w => w.code === code);
//         return ward ? ward.name : code; // Trả về tên hoặc mã nếu không tìm thấy
//     }

//     render() {
//         const { address, provinces, districts, wards } = this.props; // Destructuring props để dễ dàng truy cập

//         return (
//             <div id="address-card">
//                 <i className="fa fa-map-marker" aria-hidden="true"></i>
//                 <p>Họ Tên Người Nhận: {address.fullname}</p> {/* Hiển thị họ tên đầy đủ */}

//                 <p>Địa Chỉ Người Nhận: {this.getProvinceName(provinces.provinces)}, {this.getDistrictName(districts.districts)}, {this.getWardName(wards.wards)},{address.address}</p> {/* Hiển thị tỉnh/thành phố, quận/huyện, phường/xã */}
//                 <p>Số Điện Thoại: {address.phone}</p> {/* Hiển thị số điện thoại */}
//             </div>
//         );
//     }
// }

// export default AddressCard;
