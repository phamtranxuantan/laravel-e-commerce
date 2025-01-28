import React from 'react';
import { Routes, Route} from 'react-router-dom';
// admin 
import Home from './Home';
import indexTable from '../indexTable';
import CreateCategory from '../pages/category/CreateCategory';
import EditCategory from '../pages/category/EditCategory';
import CreateProduct from '../pages/product/CreateProduct';
import EditProduct from '../pages/product/EditProduct';
const MainAdmin = () => (
  <main>
    <Routes>
        <Route path="/admin" element={<Home />} />
        <Route path="/admin/table" element={<indexTable />} />

        {/* product */}
        <Route path="/admin/product/create" element={<CreateProduct />} />
        <Route path="/admin/product/edit" element={<EditProduct />} />
        {/* category */}
        <Route path="/admin/category/create" element={<CreateCategory />} />
        <Route path="/admin/category/edit" element={<EditCategory />} />
    </Routes>
  </main>
);

export default MainAdmin;