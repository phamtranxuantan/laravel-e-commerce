// App.js
import { Route, Routes } from "react-router-dom";
import UserRouter from "./router/UserRouter";
import User from "./User"; // Đảm bảo User được nhập


function App() {
  return (
    <Routes>
        <Route path="/" element={<User />}>
            {UserRouter.map((route, index) => {
                const Page = route.component;
                return <Route key={index} path={route.path} element={<Page />} />;
            })}
        </Route>
        
         {/* <Route path="/admin/*" element={<AdminPage />} /> */}
    </Routes>
  );
}

export default App;
