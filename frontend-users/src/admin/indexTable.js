import ListProduct from "./pages/product/ListProduct";
import ListCategory from "./pages/category/ListCategory";
function indexTable(){
    return(
      <div className="container-fluid py-4">
        <ListProduct/>
        <ListCategory/>
      </div>
        
    )
}
export default indexTable;