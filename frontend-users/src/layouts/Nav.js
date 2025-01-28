import React from "react";
import { Link } from "react-router-dom";
const Nav = () => (
    <nav className="navbar navbar-main navbar-expand pl-0">
      <ul className="navbar-nav flex-wrap">
        <li className="nav-item">
          <a className="nav-link" href="#">Khuyến mãi</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="#">Dưới 10$</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="#">Trên 10$</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="#">Trên 100$</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="#">Thương hiệu</a>
        </li>
      </ul>
  </nav> 
)
export default Nav