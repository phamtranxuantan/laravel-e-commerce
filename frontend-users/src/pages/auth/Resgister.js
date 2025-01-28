import axios from 'axios';
import React, { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Register (props) {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [errorKeys, setErrorKeys] = useState([]);
    const [error, setError] = useState({}); // Changed to object
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    function handleSubmit(e) {
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
            toast.success('Đăng ký thành công!');
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
    function handleChange(e) {
        const { name, value} = e.target;
        if (name === 'name') setName(value);
        else if (name === 'email') setEmail(value);
        else if (name === 'password') setPassword (value);
        else if (name === 'password_confirmation') setPasswordConfirm (value);
    }
    return (
        <React.Fragment>
            <div onClick={handleShow} bsPrefix="auth" style={{fontSize:'15px'}}>Đăng ký</div>            {successMessage && (
                <Alert variant='success'>
                    <i className="fa fa-check-circle"></i> {successMessage}
                </Alert>
            )}
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title className="mb-4"><h4 className="card-title">Đăng Ký</h4></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form  onSubmit={handleSubmit}>
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
                        
                    </form>
                </Modal.Body>
            </Modal>
        </React.Fragment>
        
    );
}
const mapDispatchToProps = dispatch => {
    return {
        addUser: (user) => dispatch({ type: 'USER', value: user })
    };
};
export default connect(null, mapDispatchToProps)(Register);