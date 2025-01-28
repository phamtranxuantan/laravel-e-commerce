import axios from 'axios';
import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

function ListCategory(){
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/product/categories');
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch categories. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    const isConfirmed = await Swal.fire({
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

    if (!isConfirmed) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/product/categories/${id}`);
      Swal.fire({
        icon: 'success',
        text: 'Category deleted successfully!',
      });
      fetchCategories(); // Refresh categories after deletion
    } catch (error) {
      console.error("Error deleting category:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete category. Please try again later.',
      });
    }
  };

  return (
    <div className="col-12">
      <div className="card mb-4">
      <div className="card-header pb-0" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h6 style={{ margin: 0 }}>Categories</h6>
              <Link to="/admin/category/create" className="new-product float-end" style={{ marginLeft: 'auto', textDecoration: 'none' }} data-toggle="tooltip" data-original-title="Edit user">
                  New
              </Link>
            </div>
        <div className="card-body px-0 pt-0 pb-2">
          <div className="table-responsive p-0">
            <table className="table align-items-center mb-0">
              <thead>
                <tr>
                  <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">ID</th>
                  <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Name</th>
                  <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Created_at</th>
                  <th className="text-uppercase text-secondary text-xxs font-weight-bolder text-center opacity-7 ps-2">Updated_at</th>
                  
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5">Loading categories...</td>
                  </tr>
                ) : categories.length > 0 ? (
                  categories.map((category, index) => (
                    <tr key={index}>
                      <td>{category.id}</td>
                      <td>{category.name}</td>
                      <td>{category.created_at}</td>
                      <td>{category.updated_at}</td>
                      <td style={{ marginRight: '10px' }}>
                        <Link to={`/admin/category/edit/${category.id}`} className="a1">Edit</Link>
                      </td>
                      <td>
                      <Link style={{ marginLeft: '1px' }}  onClick={() => deleteCategory(category.id)} className="a2">Delete</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No categories found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ListCategory