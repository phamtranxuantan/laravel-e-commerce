import { AuthProvider } from 'react-admin';

export const authProvider: AuthProvider = {
    login: async ({ username, password }) => {
        const request = new Request('http://localhost:8000/api/login', {
            method: 'POST',
            body: JSON.stringify({ email: username, password }),
            headers: new Headers({ 'Content-Type': 'application/json' }),
        });

        const response = await fetch(request);
        if (response.status < 200 || response.status >= 300) {
            throw new Error('Đăng nhập không thành công');
        }

        const { token, role_id } = await response.json();

        // Kiểm tra nếu role_id null hoặc bằng 0, không cho phép truy cập
        if (role_id === null || role_id === 0) {
            throw new Error('Bạn không có quyền truy cập');
        }

        // Nếu role_id là 1 (admin), cho phép truy cập và lưu token
        localStorage.setItem('auth_token', token);
        localStorage.setItem('role_id', role_id);
    },

    checkAuth: () => {
        const token = localStorage.getItem('auth_token');
        const role_id = localStorage.getItem('role_id');
        
        if (token && role_id === '1') {
            return Promise.resolve();
        } else {
            return Promise.reject({ redirectTo: '/login' });
        }
    },

    logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('role_id');
        return Promise.resolve();
    },

    checkError: (error) => {
        if (error.status === 401 || error.status === 403) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('role_id');
            return Promise.reject();
        }
        return Promise.resolve();
    },

    getPermissions: () => Promise.resolve(),
};
