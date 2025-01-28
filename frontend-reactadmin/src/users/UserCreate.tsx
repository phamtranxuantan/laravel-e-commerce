import { Create, CreateProps, SimpleForm, TextInput, required } from 'react-admin';
import { JSX } from 'react/jsx-runtime';

const UserCreate = (props: JSX.IntrinsicAttributes & CreateProps<any, Error, any>) => (
     <Create {...props}>
        <SimpleForm>
            <TextInput label="Tên" source="name" validate={required()} />
            <TextInput source="email" validate={required()} type="email" />
            <TextInput label="Mật Khẩu" source="password" validate={required()} type="password" />
            <TextInput label="Nhập lại mật khẩu" source="password_confirmation" validate={required()} type="password" /> {/* Trường xác nhận mật khẩu */}
        </SimpleForm>
    </Create>
);

export default UserCreate;
