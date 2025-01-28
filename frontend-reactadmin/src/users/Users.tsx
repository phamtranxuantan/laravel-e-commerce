import { List, Datagrid, TextField, EmailField ,DeleteButton, EditButton,  } from "react-admin";


// Component hiển thị danh sách người dùng với tính năng click vào hàng để hiển thị chi tiết
const UserList = () => (
    <List>
        <Datagrid rowClick={false}>
            <TextField source="id" />
            <TextField  label="Vai trò"source="role_id" />
            <TextField label="Tên" source="name" />
            <EmailField source="email" />
            <TextField label="Ngày Sinh" source="birthdate" />
            <TextField label="Giới tính" source="gender" />
            <TextField  label="Sdt" source="phone.phone_number" />
            <TextField  label="Ngày Tạo TK"source="created_at" />
            <TextField  label="Địa chỉ"source="shipping_address" />
            <EditButton label="Sửa"/>
            <DeleteButton label="Xóa"/>
        </Datagrid>
    </List>
);

// Component hiển thị chi tiết người dùng


// Export cả hai component ra ngoài
export { UserList };
