import { Create, SimpleForm, TextInput, NumberInput, ArrayInput, SimpleFormIterator, ReferenceInput, SelectInput, ImageInput, ImageField } from 'react-admin';

const ProductCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source="name" label="Name" />
            <TextInput source="description" label="Description" />
            <TextInput source="details" label="Details" />
            <NumberInput source="price" label="Price" />
            <NumberInput source="discount" label="Discount" />
            <TextInput source="brand" label="Brand" />
            <NumberInput source="weight" label="weight (gram)" />
            {/* Thêm ReferenceInput cho category */}
            <ReferenceInput label="Category" source="category_id" reference="categories">
                <SelectInput optionText="name" />
            </ReferenceInput>
            {/* Tải ảnh với ImageInput */}
            {/* <ImageInput source="photos" label="Upload Images" accept={{ 'image/*': [] }} multiple>
                <ImageField source="src" title="title" />
            </ImageInput> */}
            {/* Thêm thông tin stocks */}
            <ArrayInput source="stocks">
                <SimpleFormIterator>
                    <TextInput source="size" label="Size" />
                    <TextInput source="color" label="Color" />
                    <NumberInput source="quantity" label="Quantity" />
                </SimpleFormIterator>
            </ArrayInput>
        </SimpleForm>
    </Create>
);

export default ProductCreate;
