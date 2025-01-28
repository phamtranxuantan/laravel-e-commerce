import { Edit, SimpleForm, TextInput, NumberInput, ArrayInput, SimpleFormIterator, ReferenceInput, SelectInput, EditProps } from 'react-admin';


const ProductEdit = () => (
    <Edit > {/* Thay đổi từ Create thành Edit */}
        <SimpleForm>
            <TextInput source="name" label="Name" />
            <TextInput source="description" label="Description" />
            <TextInput source="details" label="Details" />
            <NumberInput source="price" label="Price" />
            <NumberInput source="discount" label="Discount" />
            <TextInput source="brand" label="Brand" />
            <NumberInput source="weight" label="Trọng lượng" />
            {/* Thêm ReferenceInput cho category */}
            <ReferenceInput label="Category" source="category_id" reference="categories">
                <SelectInput optionText="name" />
            </ReferenceInput>
            {/* Thêm thông tin stocks */}
            <ArrayInput source="stocks">
                <SimpleFormIterator>
                    <TextInput source="size" label="Size" />
                    <TextInput source="color" label="Color" />
                    <NumberInput source="quantity" label="Quantity" />
                </SimpleFormIterator>
            </ArrayInput>
        </SimpleForm>
    </Edit>
);

export default ProductEdit;
