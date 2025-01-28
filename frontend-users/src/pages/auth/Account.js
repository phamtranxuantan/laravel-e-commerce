import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from "react-toastify";

const Account = () => {
    const [user, setUser] = useState({
        name: '',
        email: '',
        phone_id: null,  // Thêm phone_id để biết người dùng đã có số điện thoại hay chưa
        phone_number: '',
        birthdate: '',
        gender: '',
        shipping_address: '',
        password: ''
    });
    const [loading, setLoading] = useState(true);
    const [isPasswordChange, setIsPasswordChange] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/auth', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data.user);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user data', error);
            }
        };

        fetchUserData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({
            ...prevUser,
            [name]: value
        }));
    };
    // Hàm kiểm tra số điện thoại
const checkPhoneExists = async (phoneNumber) => {
    try {
        const response = await axios.get(`http://localhost:8000/api/check-phone/${phoneNumber}`);
        return response.data.exists;
    } catch (error) {
        console.error('Error checking phone number:', error);
        return false;
    }
};

const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
        // Kiểm tra số điện thoại trước khi thực hiện các thao tác khác
        const checkPhoneResponse = await axios.get(`http://localhost:8000/api/check-phone/${user.phone_number}`);
        if (checkPhoneResponse.data.exists && !user.phone_id) {
            toast.error('Số điện thoại đã được sử dụng bởi người dùng khác!');
            return;
        }

        let phoneId = user.phone_id;

        if (phoneId) {
            // Cập nhật số điện thoại hiện tại
            await axios.put(`http://localhost:8000/api/phones/${phoneId}`, { phone_number: user.phone_number }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } else {
            // Thêm số điện thoại mới
            const phoneResponse = await axios.post('http://localhost:8000/api/phones', { phone_number: user.phone_number }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Cập nhật lại phone_id cho user sau khi thêm số điện thoại mới
            phoneId = phoneResponse.data.phone.id;
        }

        // Cập nhật phone_id và các thông tin khác của người dùng trong bảng users
        await axios.put(`http://localhost:8000/api/update/${user.id}`, {
            name: user.name,
            email: user.email,
            phone_id: phoneId, // Cập nhật phone_id sau khi thêm/cập nhật số điện thoại
            birthdate: user.birthdate,
            gender: user.gender,
            shipping_address: user.shipping_address
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        alert('Thông tin đã được cập nhật!');
        //toast.success('Thông tin đã được cập nhật!');
    } catch (error) {
        if (error.response) {
            console.log('Full Error Response:', error.response); // Log toàn bộ response để xem chi tiết
            if (error.response.status === 422) {
                console.log('Validation error details:', error.response.data.errors); // Hiển thị lỗi validation chi tiết
                toast.error('Có lỗi trong dữ liệu bạn nhập. Vui lòng kiểm tra lại.');
            }
        } else {
            console.error('Error updating user data:', error);
        }
    }
};



    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm((prevPasswordForm) => ({
            ...prevPasswordForm,
            [name]: value
        }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra mật khẩu xác nhận
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp!');
            return;
        }

        // Kiểm tra các trường đầu vào
        if (!passwordForm.oldPassword || !passwordForm.newPassword) {
            toast.error('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:8000/api/update-password', {
                old_password: passwordForm.oldPassword,
                new_password: passwordForm.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Mật khẩu đã được thay đổi!');
            setIsPasswordChange(false);
        } catch (error) {
            console.error('Error changing password', error.response ? error.response.data : error.message);
            toast.error('Có lỗi xảy ra khi thay đổi mật khẩu.');
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '20px', textAlign: 'center', color: '#333' }}>Thông tin tài khoản</h2>
            {!isPasswordChange ? (
                <form onSubmit={handleSubmit}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                        Tên:
                        <input
                            type="text"
                            name="name"
                            value={user.name}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </label>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                        Email:
                        <input
                            type="email"
                            name="email"
                            value={user.email}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </label>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                        Số điện thoại:
                        <input
                            type="text"
                            name="phone_number"
                            value={user.phone_number || ''}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </label>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                        Ngày sinh:
                        <input
                            type="date"
                            name="birthdate"
                            value={user.birthdate}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </label>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                        Giới tính:
                        <select
                            name="gender"
                            value={user.gender}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                        >
                            <option value="nam">Nam</option>
                            <option value="nữ">Nữ</option>
                            <option value="khác">Khác</option>
                        </select>
                    </label>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                        Địa chỉ giao hàng:
                        <input
                            type="text"
                            name="shipping_address"
                            value={user.shipping_address}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </label>
                    <button type="submit" style={{ padding: '10px 20px', marginTop: '10px', border: 'none', borderRadius: '4px', backgroundColor: '#007bff', color: 'white', cursor: 'pointer', fontSize: '16px', transition: 'background-color 0.3s' }}>Cập nhật thông tin</button>
                    <button type="button" onClick={() => setIsPasswordChange(true)} style={{ padding: '10px 20px', marginTop: '10px', border: 'none', borderRadius: '4px', backgroundColor: '#007bff', color: 'white', cursor: 'pointer', fontSize: '16px', transition: 'background-color 0.3s' }}>Thay đổi mật khẩu</button>
                </form>
            ) : (
                <form onSubmit={handlePasswordSubmit}>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                        Mật khẩu cũ:
                        <input
                            type="password"
                            name="oldPassword"
                            value={passwordForm.oldPassword}
                            onChange={handlePasswordChange}
                            required
                            style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </label>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                        Mật khẩu mới:
                        <input
                            type="password"
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            required
                            style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </label>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                        Xác nhận mật khẩu mới:
                        <input
                            type="password"
                            name="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                            style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </label>
                    <button type="submit" style={{ padding: '10px 20px', marginTop: '10px', border: 'none', borderRadius: '4px', backgroundColor: '#007bff', color: 'white', cursor: 'pointer', fontSize: '16px', transition: 'background-color 0.3s' }}>Cập nhật mật khẩu</button>
                    <button type="button" onClick={() => setIsPasswordChange(false)} style={{ padding: '10px 20px', marginTop: '10px', border: 'none', borderRadius: '4px', backgroundColor: '#007bff', color: 'white', cursor: 'pointer', fontSize: '16px', transition: 'background-color 0.3s' }}>Hủy bỏ</button>
                </form>
            )}
        </div>
    );
};

export default Account;
