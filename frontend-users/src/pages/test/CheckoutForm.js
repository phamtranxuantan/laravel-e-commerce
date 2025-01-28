import React, { Component } from 'react';
import axios from 'axios';

class CheckoutForm extends Component {
  state = {
    provinces: [],
    districts: [],
    wards: [],
    selectedProvince: '',
    selectedDistrict: '',
    selectedProvinceName: '', 
    selectedDistrictName: '', 
  };

  componentDidMount() {
    this.fetchProvinces();
  }

  // Fetch list of provinces
  fetchProvinces = () => {
    axios.get('https://vapi.vnappmob.com/api/province/')
      .then(response => {
        if (response.data && response.data.results) {
          this.setState({ provinces: response.data.results });
        } else {
          console.error('Invalid data structure:', response.data);
        }
      })
      .catch(error => {
        console.error('Error fetching provinces:', error);
      });
  };

  // Fetch list of districts by province_id
  fetchDistricts = (provinceId) => {
    axios.get(`https://vapi.vnappmob.com/api/province/district/${provinceId}`)
      .then(response => {
        if (response.data && response.data.results) {
          this.setState({ districts: response.data.results });
        } else {
          console.error('Invalid data structure:', response.data);
        }
      })
      .catch(error => {
        console.error('Error fetching districts:', error);
      });
  };

  // Fetch list of wards by district_id
  fetchWards = (districtId) => {
    axios.get(`https://vapi.vnappmob.com/api/province/ward/${districtId}`)
      .then(response => {
        if (response.data && response.data.results) {
          this.setState({ wards: response.data.results });
        } else {
          console.error('Invalid data structure:', response.data);
        }
      })
      .catch(error => {
        console.error('Error fetching wards:', error);
      });
  };

  handleProvinceChange = (event) => {
    const provinceId = event.target.value;
    const selectedProvince = this.state.provinces.find(province => province.province_id === parseInt(provinceId));
    
    this.setState({ 
      selectedProvince: provinceId,
      selectedProvinceName: selectedProvince ? selectedProvince.province_name : '',
      districts: [],
      wards: []
    });

    if (provinceId) {
      this.fetchDistricts(provinceId);
    }
  };

  handleDistrictChange = (event) => {
    const districtId = event.target.value;
    const selectedDistrict = this.state.districts.find(district => district.district_id === parseInt(districtId));
    
    this.setState({ 
      selectedDistrict: districtId,
      selectedDistrictName: selectedDistrict ? selectedDistrict.district_name : '',
      wards: []
    });

    if (districtId) {
      this.fetchWards(districtId);
    }
  };

  render() {
    const { provinces, districts, wards, selectedProvince, selectedDistrict } = this.state;

    return (
      <div>
        <h1>Checkout Form</h1>
        <form>
          <div>
            <label>Tỉnh/Thành phố:</label>
            <select onChange={this.handleProvinceChange} value={selectedProvince}>
              <option value="">Chọn tỉnh/thành phố</option>
              {provinces.map(province => (
                <option key={province.province_id} value={province.province_id}>
                  {province.province_name}
                </option>
              ))}
            </select>
          </div>

          {selectedProvince && (
            <div>
              <label>Quận/Huyện:</label>
              <select onChange={this.handleDistrictChange} value={selectedDistrict}>
                <option value="">Chọn quận/huyện</option>
                {districts.map(district => (
                  <option key={district.district_id} value={district.district_id}>
                    {district.district_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedDistrict && (
            <div>
              <label>Phường/Xã:</label>
              <select>
                <option value="">Chọn phường/xã</option>
                {wards.map(ward => (
                  <option key={ward.ward_id} value={ward.ward_id}>
                    {ward.ward_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </form>
      </div>
    );
  }
}

export default CheckoutForm;
