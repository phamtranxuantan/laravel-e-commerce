import React from "react";
import { Route, Routes } from "react-router-dom";
import Account from "../pages/auth/Account";
import Resgister from "../pages/auth/Resgister";
import ShoppingCart from "../pages/cart/ShoppingCart";
import Checkout from "../pages/checkout/Checkout";
import ProductDetail from "../pages/detail/ProductDetail";
import Wishlist from "../pages/wishlist/Wishlist";
import Home from "./Home";
import Login from "../pages/auth/Login";
import CheckoutForm from "../pages/test/CheckoutForm";
import VNPAY from "../pages/stripe/VNPAY";
import PaymentCallback from "../pages/stripe/PaymentCallback";
import Orders from "../pages/stripe/Orders";
import UserOrders from "../pages/stripe/UserOrders";
const Main = () => (
    <main>
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/wishlist" element={<Wishlist/>}/>
            <Route path="/product-detail/:productId" element={<ProductDetail/>}/>
            <Route path="/shopping-cart" element={<ShoppingCart/>}/>
            <Route path="/checkout" element={<Checkout/>}/>
            <Route path="/Resgister" element={<Resgister/>}/>
            <Route path="/account" element={<Account/>}/>
            <Route path="/Login" element={<Login/>}/>
            <Route path="/CheckoutForm" element={<CheckoutForm/>}/>
            <Route path="/VNPAY" element={<VNPAY/>}/>
            <Route path="/payment-callback" element={<PaymentCallback/>}/>
            <Route path="/orders" element={<Orders/>}/>
            <Route path="/track-my-order" element={<UserOrders/>}/>

        </Routes>
    </main>
) 
export default Main