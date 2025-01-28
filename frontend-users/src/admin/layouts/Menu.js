import { Link } from "react-router-dom"

function Menu(){
    return(

            <aside className="sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3 " id="sidenav-main">
                <div className="sidenav-header">
                <a className="navbar-brand m-0" href=" https://demos.creative-tim.com/soft-ui-dashboard/pages/dashboard.html " target="_blank">
                    
                    <span className="ms-1 font-weight-bold">Admin</span>
                </a>
                </div>
                <div>
                <ul >
                    <li >
                    <Link to="/admin" >
                        <span >Dashboard</span>
                    </Link>
                    </li>
                    <li className="nav-item">
                    <Link to="/admin/table"className="nav-link" >
                        <span className="nav-link-text ms-1">Tables</span>
                    </Link>
                    </li>
                    
                </ul>
                </div>
            </aside>

    )
}
export default Menu