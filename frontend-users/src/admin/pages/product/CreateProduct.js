// src/components/AddProduct.js
import axios from 'axios';
import React, { useState } from 'react';

const CreateProduct = () => {
    const [formData, setFormData] = useState({
        category_id: '',
        deal_id: null,
        photos: [],
        brand: '',
        name: '',
        description: '',
        details: '',
        price: '',
        discount: '',
        price_before:null,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'deal_id' ? parseInt(value) || null : value, // Chuyển đổi thành số nguyên
        });
    };

    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            photos: Array.from(e.target.files),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const data = new FormData();
      // Thêm các trường dữ liệu khác vào FormData
      for (const key in formData) {
        if (key !== 'photos') {  // Không thêm trực tiếp mảng photos
            data.append(key, formData[key]);
        }
    }
        for (const key in formData) {
            if (key === 'deal_id') {
                const dealIdValue = formData[key] ? parseInt(formData[key], 10) : null;
                data.append('deal_id', dealIdValue === null ? '' : dealIdValue);  // Gán '' cho null thay vì giá trị không hợp lệ
            } else {
                data.append(key, formData[key]);
            }
        }
    // Thêm từng ảnh vào FormData
    formData.photos.forEach((file, index) => {
        data.append(`photos[${index}]`, file);  // Thêm từng file ảnh với tên photos[]
    });
        data.append('user_id', 1);
    
        // Log dữ liệu để kiểm tra
        for (let [key, value] of data.entries()) {
            console.log(`${key}: ${value}`);
        }
    
        try {
            const response = await axios.post('http://localhost:8000/api/productsUser', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }); 
            console.log('Product added successfully:', response.data);
        } catch (error) {
            console.error('Error adding product:', error.response ? error.response.data : error.message);
        }
    };
    

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="category_id" placeholder="Category ID" onChange={handleChange} required />
            {/* <input type="text" name="deal_id" placeholder="Deal ID" onChange={handleChange} /> */}
            <input type="file" name="photo" onChange={handleFileChange} required />
            <input type="text" name="brand" placeholder="Brand" onChange={handleChange} required />
            <input type="text" name="name" placeholder="Product Name" onChange={handleChange} required />
            <textarea name="description" placeholder="Description" onChange={handleChange} required />
            <textarea name="details" placeholder="Details" onChange={handleChange} required />
            <input type="number" name="price" placeholder="Price" onChange={handleChange} required />
            <input type="number" name="discount" placeholder="Discount" onChange={handleChange} />
            {/* <input type="number" name="price_before" placeholder="Price Before Discount" onChange={handleChange} /> */}
            <button type="submit">Add Product</button>
        </form>
    );
};

export default CreateProduct;
