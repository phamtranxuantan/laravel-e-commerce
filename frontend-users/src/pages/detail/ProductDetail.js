import axios from "axios";
import React, { Component } from "react";
import { Spinner } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { useParams } from "react-router-dom";
import Product from "./Product";
import RelatedProducts from "./RelatedProducts";
// Functional component to wrap class component and pass params as props function withRouter (Component)
function withRouter(Component) {
    function ComponentWithRouterProps(props) {
        const params = useParams();
        return <Component {...props} params={params} />;
    }
    return ComponentWithRouterProps;
}
class DetailProduct extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: "",
            loading: true,
            cartLoading: false,
            cartButtonInit: false,
            productId: "",
            product: "",
            stocks: [],
            selectedSize: "",
            selectedColor: "",
            cartCount: "",
            quantity: 1,
            avaibleQuantity: "",
            settings: {
                dots: true,
                arrows: true,
                infinite: false,
                speed: 300,
                slidesToShow: 1,
                slidesToScroll: 1,
            },
        };
        // Binding event handlers to 'this'
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleWishlist = this.handleWishlist.bind(this);
    }

    getProduct(id) {
        this.setState({ loading: true });
        console.log("Fetching product with ID: ", id);
        axios
            .get(`http://localhost:8000/api/productssss/${id}`)
            .then((response) => {
                console.log("API call successful:", response);
                this.setState({
                    productId: id,
                    product: response.data,
                    stocks: [...response.data.stocks],
                    loading: false,
                });
            })
            .catch((error) => {
                this.setState({ loading: false });
                console.error("API call failed: ", error);
            });
    }

    handleMouseLeave() {
        this.setState({ cartButtonInit: true });
    }

    handleWishlist(e) {
        e.preventDefault();

        if (!localStorage.getItem("token")) {
            this.props.showLogin();
        } else {
            axios
                .post(
                    "http://localhost:8000/api/product/wishlist",
                    {
                        productId: e.target.id,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                )
                .then((response) => {
                    if (response.status === 200) {
                        this.props.updateWishlistCount(response.data);
                        this.props.showToast("Added to wishlist!");
                    }
                })
                .catch((error) => {
                    this.props.showToast("Product is already in the wishlist!");
                });
        }
    }

    componentDidMount() {
        const { productId } = this.props.params; // Accessing productId from params
        this.getProduct(productId);
    }

    componentDidUpdate(prevProps) {
        const { productId } = this.props.params; // Accessing productId from params
        if (productId !== prevProps.params.productId) {
            this.getProduct(productId);
        }
    }
    
    render() {
        const { productId } = this.props.params; // Accessing productId from params const {
        const {
            loading,
            product,
            settings,
            avaibleQuantity,
            quantity,
            cartButtonInit,
            cartLoading,
            stocks, 
            selectedSize, 
            selectedColor,
        }= this.state;

        if (loading) {
            return <Spinner animation="border" />;
        }
        return (
            <div>
                <div className="py-3 bg-light"></div>
                
                <Modal.Body>
                    <div className="section">
                        <Product product={product} settings={settings}/>
                    </div>
                </Modal.Body>
                <div className="section">
                    <RelatedProducts products={product}/>
                </div>
                <section className="padding-y-lg bg-light border-top">
                    <div className="container">

                    <p className="pb-2 text-center">Delivering the latest product trends and industry news straight to your inbox</p>

                    <div className="row justify-content-md-center">
                    <div className="col-lg-4 col-sm-6">
                    <form className="form-row">
                        <div className="col-8">
                        <input className="form-control" placeholder="Your Email" type="email"/>
                        </div>
                        <div className="col-4">
                        <button type="submit" className="btn btn-block btn-warning"> <i className="fa fa-envelope"></i> Subscribe </button>
                        </div> 
                    </form>
                    <small className="form-text">We’ll never share your email address with a third-party. </small>
                    </div>
                    </div>
                    

                    </div>
                    </section>
            </div>
        );
    }
}
export default withRouter(DetailProduct);