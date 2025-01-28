import React from "react";
import Header from "../admin/layouts/Header";
import Menu from "../admin/layouts/Menu";
import Main from "../admin/layouts/Main";
import Footer from "../admin/layouts/Footer";
import Home from "../admin/layouts/Home";
import { Outlet } from "react-router-dom";
function IndexAdmin(){
    return (
        <div>
            <Menu/>
            <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
            {/* <Header/> */}
                <div className="container-fluid py-4">
                    <Main/>
                    <Outlet/>
                </div>
            {/* <Footer/> */}
            </main>
        </div>
    )
}
export default IndexAdmin;