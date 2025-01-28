// FontendRouter.js
import Home from "../layouts/Home";
import Account from "../pages/auth/Account";
import ShoppingCart from "../pages/cart/ShoppingCart";
import Checkout from "../pages/checkout/Checkout";
import ProductDetail from "../pages/detail/ProductDetail";
import Wishlist from "../pages/wishlist/Wishlist";
import Login from "../pages/auth/Login";
import Resgister from "../pages/auth/Resgister";
import CheckoutForm from "../pages/test/CheckoutForm";
import VNPAY from "../pages/stripe/VNPAY";
import PaymentCallback from "../pages/stripe/PaymentCallback";
import Orders from "../pages/stripe/Orders";
import UserOrders from "../pages/stripe/UserOrders";
const UserRouter = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/wishlist",
    component: Wishlist,
  },
  {
    path: "/product-detail/:productId",
    component: ProductDetail,
  },
  {
    path: "/shopping-cart",
    component: ShoppingCart,
  },
  {
    path: "/checkout",
    component: Checkout,
  },
  {
    path: "/Resgister",
    component: Resgister,
  },
  {
    path: "/account",
    component:Account,
  },
  {
    path: "/Login",
    component: Login,
  },
  {
    path: "/VNPAY",
    component: VNPAY,
  },
  {
    path: "/payment-callback",
    component: PaymentCallback,
  },
  {
    path: "/CheckoutForm",
    component: CheckoutForm,
  },
  {
    path: "/orders",
    component: Orders,
  },
  {
    path: "/track-my-order",
    component: Home,
  },
];

export default UserRouter;
