import axios from 'axios';
import React, { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import { connect } from 'react-redux';
import Resgister from './Resgister';
function Login(props) {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [errorKeys, setErrorKeys] = useState([]);
    const [name, setName] = useState('')
    const [passwordConfirm, setPasswordConfirm] = useState('')


// Hàm xử lý đăng nhập Facebook
const handleFacebookLogin = () => {
    window.FB.login(response => {
      if (response.authResponse) {
        // Lấy thông tin người dùng sau khi đăng nhập thành công
        window.FB.api('/me', { fields: 'name,email' }, function(response) {
          console.log('User:', response);
          // Gửi dữ liệu người dùng lên server của bạn
          axios.post('http://localhost:8000/api/facebook-login', {
            email: response.email,
            name: response.name
          }).then(result => {
            console.log('Đăng nhập thành công:', result);
            // Lưu token hoặc xử lý theo yêu cầu của bạn
            localStorage.setItem('token', result.data.token);
            // Chuyển hướng đến trang chính
            window.location.href = 'http://localhost:8000/';
          }).catch(error => {
            console.log('Đăng nhập thất bại:', error);
          });
        });
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    }, { scope: 'public_profile,email' });
  };
    // Đóng modal
    const handleClose = () => {
        setShow(false);
        props.hideLogin(); // Gọi hàm từ Redux để ẩn modal
    };

    // Mở modal
    const handleShow = () => {
        setShow(true);
    };

    // Submit form login
    function handleLoginSubmit(e) {
        e.preventDefault();
        setLoading(true);
        axios.post('http://localhost:8000/api/login', {
            email: email,
            password: password
        }).then(result => {
            localStorage.setItem('token', result.data.token);
            props.addUser(result.data.user); // Thêm user vào Redux
            setShow(false);
            setLoading(false);
        }).catch(error => {
            setError(true);
            setLoading(false);
        });
    }

    function handleResgisterSubmit(e) {
        e.preventDefault();
        setLoading(true);
        axios.post('http://localhost:8000/api/register', {
            name: name,
            email: email,
            password: password,
            password_confirmation: passwordConfirm
        }).then(result => {
            localStorage.setItem('token', result.data.token);
            props.addUser(result.data.user);
            setShow(false);
            setLoading(false);
        }).catch(err => {
            setLoading(false);
            if (err.response && err.response.data) {
                try {
                    const parsedError = JSON.parse(err.response.data);
                    setErrorKeys(Object.keys(parsedError));
                    setError(parsedError);
                } catch (parseError) {
                    setErrorKeys(['non_field_errors']);
                    setError({non_field_errors: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.' });
            }
            } else {
                setErrorKeys(['general']);
                setError({ general: 'Đã xảy ra lỗi. Vui lòng thử lại sau.' });
            }
        });
    }

    const handleShowRegister = () => {
        setShowRegister(true)
    };

    const handleShowLogin = () => {
        setShowRegister(false)
    };

    // Xử lý các thay đổi trong form
    function handleChange(e) {
        if(e.target.name === 'email')
            setEmail(e.target.value) 
        if(e.target.name === 'password')
            setPassword(e.target.value) 
        if(e.target.name === 'name')
            setName(e.target.value) 
        if(e.target.name === 'password_confirmation')
            setPasswordConfirm(e.target.value) 
    }
    // Toggle hiển thị của Register khi click vào caret icon
    const toggleRegister = () => {
        setShowRegister(!showRegister);  // Đảo ngược trạng thái hiển thị của Register
    };
    
    return (
        <React.Fragment>
             <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="icon" style={{ marginRight: '10px' }}>
                    <i className="text-primary fa fa-lg fa-user"></i>
                </div>
                <div className="text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <small className="text-muted" style={{ marginBottom: '4px' }}>
                    {props.user ? `Hello, ${props.user.name}` : 'Hello.'}
                </small>
                    <div onClick={handleShow} className="auth" style={{ cursor: 'pointer', fontWeight: 'bold', color: '#007bff' }}>
                        Đăng nhập
                    </div>
                    {/* <i onClick={toggleRegister} className="fa fa-caret-down" style={{ cursor: 'pointer', marginTop: '4px' }}></i> */}
                </div>

                {showRegister && (
                    <div className="register-section" style={{
                        display: 'flex', 
                        flexDirection: 'column', 
                        position: 'absolute', 
                        top: '100%', 
                        left: 0, 
                        backgroundColor: '#fff', 
                        padding: '10px', 
                        border: '1px solid #ccc', 
                        borderRadius: '4px', 
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', 
                        marginTop: '5px',
                        zIndex: 10
                    }}>
                        <Resgister />
                    </div>
                )}
            </div>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title className="auth-title">
                        {showRegister ? 'Sign Up' : 'Sign In'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                {showRegister ? (
                     <form  onSubmit={handleResgisterSubmit}>
                     {errorKeys.length > 0 &&
                         errorKeys.map(key => (
                         <div className="form-alert" key={key}>
                             <Alert variant='danger'>
                                 <i className="fa fa-exclamation-triangle"></i>
                                 {error[key]}
                             </Alert>
                         </div>
                     ))}
                     <div className="form-row">
                         <div className="col form-group">
                             <label>Tên người dùng</label>
                             <input type="text" name="name" className="form-control" onChange={handleChange} />
                         </div>
                     </div> 
                     <div className="form-group">
                         <label>Email</label>
                         <input type="email" name="email" className="form-control" onChange={handleChange}/>
                     </div>
                     <div className="form-row">
                         <div className="form-group col-md-6">
                             <label>Nhập mật khẩu</label>
                             <input className="form-control" name="password" type="password"onChange={handleChange}/>
                         </div> 
                         <div className="form-group col-md-6">
                             <label>Nhập lại mật khẩu</label>
                             <input className="form-control" name="password_confirmation" type="password" onChange={handleChange}/>
                         </div> 
                     </div>
                     <div class="form-group">
                         <button type="submit" className="btn btn-primary btn-block">
                             {loading ?
                                 <div className="align-middle">
                                     <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
                                     <span>Đang đăng ký...</span>
                                 </div>
                                 :
                                 <span >Đăng Ký</span>}
                         </button>
                     </div>
                     <div className="register-section" style={{ textAlign: 'center', marginTop: '1rem' }}>
                                <span>Đã có tài khoản? </span>
                                <Button variant="link" onClick={handleShowLogin}>Đăng nhập</Button>
                            </div>
                 </form>
                ):(
                    <form className="auth" onSubmit={handleLoginSubmit}>
                        <a href="#" className="btn btn-facebook btn-block mb-2" onClick={handleFacebookLogin}>
                            <i className="fab fa-facebook-f"></i> &nbsp; Đăng nhập bằng Facebook
                        </a>
                        <a href="#" className="btn btn-google btn-block mb-4">
                            <i className="fab fa-google"></i> &nbsp; Đăng nhập bằng Google
                        </a>
                        {error &&
                            <div className="form-alert">
                                <Alert variant='danger'>
                                    <i className="fa fa-exclamation-triangle"></i>
                                    Thông tin đăng nhập không hợp lệ!
                                </Alert>
                            </div>}
                        <div className="form-group">
                            <input type="email" required
                                className="form-control"
                                name="email"
                                placeholder="Enter Email"
                                onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <input type="password" required
                                className="form-control"
                                name="password"
                                placeholder="Enter Password"
                                onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            
                            <a href="#" className="float-right">Quên mật khẩu?</a>
                            <label className="float-left custom-control custom-checkbox">
                                <input type="checkbox" className="custom-control-input" checked />
                                <div className="custom-control-label"> Ghi Nhớ </div>
                            </label>
                        </div>
                        
                       
                        <button type="submit" className="btn btn-primary btn-block">
                            {loading ?
                                <div className="align-middle">
                                    <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
                                    <span>Đang đăng nhập...</span>
                                </div>
                                :
                                <span >Đăng nhập</span>}
                        </button>
                        <div className="register-section" style={{ textAlign: 'center', marginTop: '1rem' }}>
                                <span>Bạn chưa có tài khoản? </span>
                                <Button variant="link" onClick={handleShowRegister}>Đăng ký</Button>
                        </div>
                        {/* <div className="ddddd" style={{width:"300px",height:"100px",margin:0}}>
                            <div  style={{ width: 'auto', height: 'auto', display: 'block', position: 'static' }} className="g-recaptcha" data-sitekey="6Lcu4UIqAAAAADsyOJOc_WqszXeuRwWZ-lEW4cUI" data-action="LOGIN">
                            </div>
                        </div> */}
                    </form> 
                )}
                   
                </Modal.Body>
            </Modal>
            
        </React.Fragment>
    );
}

// Lấy dữ liệu từ Redux store
const mapStateToProps = state => {
    return {
        showLogin: state.show_login // Trạng thái hiển thị modal login
    };
};

// Gửi action tới Redux store
const mapDispatchToProps = dispatch => {
    return {
        addUser: (user) => dispatch({ type: 'USER', value: user }), // Thêm user vào Redux
        hideLogin: () => dispatch({ type: 'LOGIN_CONTROL', value: false }) // Ẩn modal login
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
