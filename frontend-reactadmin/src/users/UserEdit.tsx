import { useState } from "react";  
import { Edit, SimpleForm, TextInput, PasswordInput, SelectInput, Toolbar, SaveButton} from "react-admin";

const UserEdit = () => {
    const [password, setPassword] = useState("");

    return (
        <Edit>
            <SimpleForm toolbar={<CustomToolbar />}>
                {/* Trường Name */}
                <TextInput source="name" label="Tên" fullWidth />

                {/* Trường Email */}
                <TextInput source="email" label="Email" fullWidth />

                {/* Trường Password */}
                <PasswordInput 
                    source="password" 
                    label="Mật khẩu" 
                    fullWidth 
                    onChange={(e) => setPassword(e.target.value)} 
                />

                {/* Trường Role */}
                <SelectInput 
                    source="role_id" 
                    label="Vai trò" 
                    choices={[
                        { id: 1, name: 'Admin' },
                        { id: 0, name: 'User' },
                    ]}
                    optionText="name"
                    optionValue="id"
                />
            </SimpleForm>
        </Edit>
    );
};

// Custom Toolbar để xử lý việc hiển thị nút "Save"
const CustomToolbar = () => (
    <Toolbar >
        <SaveButton />
    </Toolbar>
);

export default UserEdit;
