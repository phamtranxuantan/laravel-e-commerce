import axios from 'axios';
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';

function EditProduct() {
    const navigate = useNavigate();
    const { id } = useParams(); 
    const [productData, setProductData] = useState({
        user_id: '',
        category_id: '',
        deal_id: '',
        photos: [], // Để chứa nhiều ảnh
        brand: '',
        name: '',
        description: '',
        details: '',
        price: '',
        discount: ''
    });
    const [imagePreviews, setImagePreviews] = useState([]); // Để xem trước nhiều ảnh
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [categories, setCategories] = useState([]);

    // Lấy dữ liệu sản phẩm và danh sách categories khi component mount
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/productsUser/${id}`);
                setProductData(response.data.product);
                if (response.data.product.photos) {
                    const parsedPhotos = JSON.parse(response.data.product.photos);
                    setImagePreviews(parsedPhotos.map(photo => `http://localhost:8000/img/${photo}`));
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/product/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        if (id) {
            fetchProduct();
            fetchCategories();
        }
    }, [id]);

    // Xử lý thay đổi dữ liệu từ input
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'photos') {
            setProductData({ ...productData, [name]: files });
        } else {
            setProductData({ ...productData, [name]: value });
        }
    };

    // Xử lý thay đổi file ảnh
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setProductData({ ...productData, photos: files });
        setImagePreviews(files.map(file => URL.createObjectURL(file)));
    };

    // Xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('user_id', productData.user_id);
        formData.append('category_id', productData.category_id);
        formData.append('brand', productData.brand);
        formData.append('name', productData.name);
        formData.append('description', productData.description);
        formData.append('details', productData.details);
        formData.append('price', productData.price);
        formData.append('discount', productData.discount);

        // Nếu có ảnh, append từng file ảnh vào formData
        if (productData.photos.length > 0) {
            Array.from(productData.photos).forEach((photo, index) => {
                formData.append(`photos[${index}]`, photo);
            });
        }

        try {
            const response = await axios.post(`http://localhost:8000/api/productsUser/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMessage('Product updated successfully!');
            setLoading(false);
            navigate('/admin/table'); // Chuyển hướng đến trang danh sách sản phẩm
        } catch (error) {
            console.error('Error updating product', error.response.data);
            setMessage('Failed to update product.');
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Update Product</h2>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Brand:</label>
                    <input
                        type="text"
                        name="brand"
                        value={productData.brand}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={productData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Description:</label>
                    <textarea
                        name="description"
                        value={productData.description}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Details:</label>
                    <textarea
                        name="details"
                        value={productData.details}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Price:</label>
                    <input
                        type="number"
                        name="price"
                        value={productData.price}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Discount:</label>
                    <input
                        type="number"
                        name="discount"
                        value={productData.discount}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="category_id">Category:</label>
                    <select 
                        name="category_id" 
                        value={productData.category_id} 
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Photos:</label>
                    <input type="file" name="photos" onChange={handleFileChange} multiple />
                    {imagePreviews.map((preview, index) => (
                        <img key={index} src={preview} alt={`Preview ${index}`} width="100" />
                    ))}
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Product'}
                </button>
            </form>
        </div>
    );
}

export default EditProduct;
