import axios from 'axios'
import React, { Component } from 'react'
import Pagination from 'react-bootstrap/Pagination'
import Spinner from 'react-bootstrap/Spinner'
import { connect } from 'react-redux'
class Wishlist extends Component {
    constructor (props) {
        super(props)
        this.state = {
            userId: '',
            currentPage: 1,
            perPage: 0,
            total: 0,
            loading: true,
            wishlist: []
        }
        this.handleClick = this.handleClick.bind(this)
        this.handleDelete = this.handleDelete.bind(this)
    }
    componentDidMount() {
        if(localStorage.getItem('token')) {
            this.getWishlist(1)
        } else {
            this.props.showLogin()
        }
    }
    getWishlist(pageNumber) {
        this.setState({loading: true})
        axios.get(`http://localhost:8000/api/product/wishlist?page=${pageNumber}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}`}
        }).then(result => {
            if (result.data.data.length > 0)
                this.setState({ 
                    currentPage: result.data.current_page, 
                    perPage: result.data.per_page,
                    total: result.data.total,
                    wishlist: [...result.data.data],
                    loading: false
                })
            this.props.updateWishlistCount(result.data.total)
        }).catch(error => {
            console.log(error)
        })
    }
    componentDidUpdate() {
        if(this.props.user && this.props.user !== 'guest') {
            if(this.props.user.id !== this.state.userId) {
                this.setState({userId: this.props.user.id})
                this.getWishlist(1)
            }
        }
    }
    handleClick(e) {
        let id = e.target.id
        this.props.showQuickView(id)
    }
    handleDelete(e) {
        let id = e.target.id
        axios.delete(`http://localhost:8000/api/product/wishlist/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}`} 
        }).then(response => {
            if(response.status === 200) {
                let page = this.state.currentPage
            if(response.data % this.state.perPage == 0)
                page = this.state.currentPage - 1
                this.getWishlist(page)
                this.props.updateWishlistCount(response.data.total)
            }
        })
    }
    render() {
        return (
            <React.Fragment>
                {/* <!-- BREADCRUMB --> */}
                <section class="section-pagetop bg-gray">
                    <div class="container">
                        <h2 class="title-page">Danh sách yêu thích</h2>
                    </div>
                </section>

                {/* <!-- SECTION --> */}
                <article className="card">
                    <div className="card-body">
                        <div className="row">
                        {/* Hiển thị danh sách yêu thích */}
                        {localStorage.getItem("token") ? (
                            this.state.loading ? (
                            <div className="spinner-container">
                                <Spinner animation="border" />
                            </div>
                            ) : this.state.wishlist.length > 0 ? (
                            this.state.wishlist.map((item) => (
                                <div className="col-md-6" key={item.id}>
                                <figure className="itemside mb-4">
                                    <div className="aside">
                                    <img
                                        src={ `http://localhost:8000/img/${JSON.parse(item.product.photo)[0]}`}
                                        
                                        style={{
                                            width: '100%',
                                            height: '200px',
                                            objectFit: 'cover',
                                            display: 'block'
                                        }}
                                    />
                                    </div>
                                    <figcaption className="info">
                                    <a
                                        href={`/products/${item.product.id}`}
                                        className="title"
                                        style={{
                                        display: "block",
                                        fontWeight: "bold",
                                        marginBottom: "8px",
                                        }}
                                    >
                                        {item.product.name}
                                    </a>
                                    <p className="price mb-2">${item.product.price}</p>
                                    <a
                                        href="#"
                                        id={item.product.id}
                                        onClick={this.handleClick}
                                        className="btn btn-secondary btn-sm"
                                    >
                                        Thêm vào giỏ hàng
                                    </a>
                                    <a
                                        
                                        id={item.id}
                                        onClick={this.handleDelete}
                                        className="btn btn-danger btn-sm"
                                        title="Remove from wishlist"
                                        style={{ marginLeft: "10px" }}
                                    >
                                        <i className="fa fa-times"></i>
                                    </a>
                                    </figcaption>
                                </figure>
                                </div>
                            ))
                            ) : (
                            <h3>
                                Vui lòng đăng nhập để có thể thêm hoặc xem sản phẩm trong danh sách
                                yêu thích của bạn!
                            </h3>
                            )
                        ) : (
                            <h3>Vui lòng đăng nhập để có thể thêm hoặc xem sản phẩm trong danh sách yêu thích của bạn!</h3>
                        )}

                        {/* Hiển thị phân trang nếu có */}
                        {this.state.wishlist.length > 0 && this.state.total > this.state.perPage && (
                            <div className="pagination-container">
                            <Pagination
                                activePage={this.state.currentPage}
                                itemsCountPerPage={this.state.perPage}
                                totalItemsCount={this.state.total}
                                pageRangeDisplayed={5}
                                onChange={(pageNumber) => this.getWishlist(pageNumber)}
                                itemClass="page-item"
                                linkClass="page-link"
                                firstPageText="First"
                                lastPageText="Last"
                            />
                            </div>
                        )}
                        </div>
                    </div>
                    </article>

                {/* <!-- /SECTION --> */}
            </React.Fragment>
        )
    }
}
const mapStateToProps = state => {
    return {
        user: state.user_data
    }
}
const mapDispatchToProps = dispatch => {
    return {
        showLogin: (() => dispatch({type: 'LOGIN_CONTROL', value: true})),
        showQuickView: ((id) => dispatch({type: 'QUICKVIEW_CONTROL', value: id})),
        updateWishlistCount: ((count) => dispatch({type: 'WISHLIST_COUNT', value: count}))
    }
}
export default connect (mapStateToProps, mapDispatchToProps) (Wishlist)