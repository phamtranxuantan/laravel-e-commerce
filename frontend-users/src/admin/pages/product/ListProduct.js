import axios from 'axios';
import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

function ListProduct(){
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProducts(currentPage);
    }, [currentPage]);
  
    const fetchProducts = async (page) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://localhost:8000/api/productsAdmin?page=${page}&per_page=5`); // Thêm tham số per_page=5 để chỉ lấy 5 sản phẩm mỗi trang
            setProducts(response.data.data); // Sử dụng response.data.data
            setLastPage(response.data.last_page || 1);
        } catch (error) {
            console.error("There was an error fetching the products!", error);
            setError('Error fetching products: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
  
    const deleteProduct = async (id) => {
        const isConfirm = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            return result.isConfirmed;
        });
  
        if (!isConfirm) {
            return;
        }
  
        try {
            const { data } = await axios.delete(`http://localhost:8000/api/productsAdmin/${id}`);
            Swal.fire({
                icon: 'success',
                text: data.message
            });
            fetchProducts(currentPage);
        } catch (error) {
            Swal.fire({
                text: error.response.data.message,
                icon: 'error'
            });
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
  
    return (
      <div className="row">
        <div className="col-12">
          <div className="card mb-4">
            <div className="card-header pb-0" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h6 style={{ margin: 0 }}>Product</h6>
              <Link to="/admin/product/create" className="new-product float-end" style={{ marginLeft: 'auto', textDecoration: 'none' }} data-toggle="tooltip" data-original-title="Edit user">
                  New
              </Link>
            </div>
            <div className="card-body px-0 pb-2">
              <div className="table-responsive p-0">
                <table className="table align-items-center mb-0">
                  <thead>
                    <tr>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Name</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Description</th>
                      <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Price</th>
                      <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Image</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="5">Loading...</td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan="5">{error}</td>
                        </tr>
                    ) : products && products.length > 0 ? (
                        products.map((product, key) => {
                            let photos = []; // Khởi tạo một mảng rỗng
                            if (product.photo) {
                                // Kiểm tra nếu product.photo là chuỗi JSON
                                try {
                                    photos = JSON.parse(product.photo); // Chuyển đổi chuỗi JSON thành mảng
                                } catch (e) {
                                    // Nếu không phải JSON, hãy đặt photos thành một mảng chứa chuỗi đó
                                    photos = [product.photo]; // Giả sử product.photo là một đường dẫn ảnh đơn
                                    console.error("Error parsing photo JSON:", e);
                                }
                            }

                            return (
                                <tr key={key}>
                                    <td>{product.name}</td>
                                    <td>{product.description}</td>
                                    <td>{product.price}</td>
                                    <td>
                                        {photos.length > 0 ? (
                                            photos.map((photo, index) => (
                                                <img 
                                                    key={index} 
                                                    src={`http://localhost:8000/img/${photo}`} // Sửa lại đường dẫn
                                                    alt={product.name} 
                                                    width="80px" 
                                                    height="80px" 
                                                    style={{ marginRight: '5px' }} 
                                                />
                                            ))
                                        ) : (
                                            <img src='default-placeholder.jpg' alt={product.name} width="80px" height="80px" />
                                        )}
                                    </td>
                                    <td style={{ marginRight: '10px' }}>
                                        <Link to={`/admin/product/edit/${product.id}`} className="a1">Edit</Link>
                                    </td>
                                    <td>
                                        <Link style={{ marginLeft: '1px' }} className="a2" onClick={() => deleteProduct(product.id)}>Delete</Link>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="5">No products found</td>
                        </tr>
                    )}
                </tbody>





                </table>
              </div>
              <div className="pagination">
                {Array.from({ length: lastPage }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={currentPage === index + 1 ? 'active' : ''}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}
export default ListProduct;
