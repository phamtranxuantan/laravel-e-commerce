import axios from 'axios';
import React, { Component } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Login from './Login';

class Authentication extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: '',
        };
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        if (localStorage.getItem('token')) {
            this.getAuth(localStorage.getItem('token'));
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.user && this.props.user.name !== this.state.user.name) {
            this.setState({ user: this.props.user });
        }
    }

    getAuth(token) {
        axios.get('http://localhost:8000/api/auth', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(result => {
            this.setState({
                user: result.data.user
            });
        }).catch(error => {
            this.logout();
        });
    }

    logout() {
        localStorage.removeItem('token');
        this.setState({
            user: ''
        });
        this.props.removeUser(); // Call removeUser from props
    }

    handleClick(e) {
        if (e.target.id === '3') {
            this.logout();
        }
    }
    render() {
        return (
            <ul style={{ listStyle: 'none', margin: '0', padding: '0', display: 'flex', alignItems: 'center' }}>
                {this.props.user !== 'guest' && localStorage.getItem('token') ? (
                    <li style={{ position: 'relative', margin: '0', padding: '0' }}>
                        <Dropdown>
                            <Dropdown.Toggle
                                variant="toggle"
                                id="dropdown-basic"
                            >
                                <i className="fa fa-user-o" style={{ marginRight: '8px' }}></i>
                                <span>{this.state.user.name}</span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: '0',
                                    backgroundColor: '#fff',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                    borderRadius: '4px',
                                    padding: '10px 0',
                                    zIndex: '1000',
                                    minWidth: '200px' // Độ rộng tối thiểu của menu
                                }}
                            >
                                <Dropdown.Item
                                    as={Link}
                                    to="/account"
                                    style={{
                                        padding: '10px 20px',
                                        color: '#333',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        display: 'block'
                                    }}
                                >
                                    Thông tin tài khoản
                                </Dropdown.Item>
                                <Dropdown.Item
                                    as={Link}
                                    to="/track-my-order"
                                    style={{
                                        padding: '10px 20px',
                                        color: '#333',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        display: 'block'
                                    }}
                                >
                                    Quản lý đơn hàng
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item
                                    id="3"
                                    onClick={this.handleClick}
                                    style={{
                                        padding: '10px 20px',
                                        color: '#d9534f',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <i className="fa fa-sign-out" aria-hidden="true" style={{ marginRight: '8px' }}></i>
                                    Đăng Xuất
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </li>
                ) : (
                    <React.Fragment>
                        <li style={{ margin: '0 10px' }}>
                            <Login />
                        </li>
                        {/* <li>
                            <Resgister />
                        </li> */}
                    </React.Fragment>
                )}
            </ul>
        );
    }
}
const mapStateToProps = state => ({
    user: state.user_data
});

const mapDispatchToProps = dispatch => ({
    removeUser: () => dispatch({ type: 'USER', value: 'guest' })
});

export default connect(mapStateToProps, mapDispatchToProps)(Authentication);
