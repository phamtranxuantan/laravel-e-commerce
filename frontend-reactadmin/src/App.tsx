import {
  Admin,
  Resource,
  
} from "react-admin";
import UserIcon from "@mui/icons-material/Group";
import { Layout } from "./Layout";
import { dataProvider } from "./dataProvider";
import { authProvider } from "./authProvider";
import { Dashboard } from "./Dashboard";
import { UserList} from "./users/Users";
import UserCreate from "./users/UserCreate";
import ProductList  from "./product/Product";
import ProductCreate from "./product/ProductCreate";
import ProductEdit from "./product/ProductEdit";
import CategoriesList,{CategoriesShow ,CategoryCreate,CategoryEdit} from "./categories/Categories";
import UserEdit from "./users/UserEdit";
export const App = () => (
  <Admin layout={Layout} authProvider={authProvider} dataProvider={dataProvider} dashboard={Dashboard}>
   
    <Resource name="users" list={UserList} create={UserCreate} icon={UserIcon} edit={UserEdit}/>
    <Resource name="products" list={ProductList}  create={ProductCreate} edit={ProductEdit}/>
    <Resource name="categories" list={CategoriesList} show={CategoriesShow} create={CategoryCreate} edit={CategoryEdit}/>
  </Admin>
);
