import { List, Datagrid, TextField, Show, SimpleShowLayout, DeleteButton, EditButton, ShowButton, SimpleForm, Edit, TextInput, Create } from "react-admin";

// Component hiển thị danh sách danh mục với tính năng click vào hàng để hiển thị chi tiết
const CategoriesList = () => (
    <List>
        <Datagrid rowClick={false}>
            <TextField source="id" />
            <TextField source="name" />
            <ShowButton /> 
            <EditButton /> 
            <DeleteButton />
        </Datagrid>
    </List>
);

// Component hiển thị chi tiết danh mục
const CategoriesShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="name" />
        </SimpleShowLayout>
    </Show>
);

// Form chỉnh sửa danh mục
const CategoryEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="name" />
        </SimpleForm>
    </Edit>
);

// Form thêm danh mục mới
const CategoryCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="name" />
        </SimpleForm>
    </Create>
);

// Export tất cả component
export { CategoriesList, CategoriesShow, CategoryEdit, CategoryCreate };
export default CategoriesList;
