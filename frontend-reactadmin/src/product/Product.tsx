
import {
    List,
    Datagrid,
    TextField,
    NumberField,
    TextInput,
    ReferenceInput,
    AutocompleteInput,
    NumberInput,
    DeleteButton,
    EditButton,
    useRecordContext,
} from 'react-admin';
import {Link as RouterLink} from 'react-router-dom'
import UploadImageDialog from './UploadImageDialog';
import { useEffect, useState } from 'react';

const ProductFilter = [
    <TextInput source="q" label="Name" alwaysOn />,
    <ReferenceInput
        source="description"
        label="Description"
        reference="products"
        allowEmpty
        filterToQuery={(searchText: any) => ({ description: searchText })} // Thêm phương thức lọc
    >
        <AutocompleteInput
            optionText="description" // Hiển thị tên mô tả
            optionValue="id" // Giá trị sẽ được gửi lên là ID
        />
    </ReferenceInput>,
    <NumberInput source="price" label="Price" />,
];

const CustomImageField = ({ source }: { source: string }) => {
    const record = useRecordContext();
    const [openDialog, setOpenDialog] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Kiểm tra và log record và images
    // console.log('Record:', record);
    // console.log('Images:', record ? record[source] : null); // Tránh lỗi khi record là null

    // Kiểm tra xem record có tồn tại và có chứa thông tin hình ảnh
    if (!record) {
        return <span>No Record</span>; // Trả về thông báo nếu không có record
    }

    const images = Array.isArray(record[source]) ? record[source] : []; // Đảm bảo images là mảng

    // Nếu không có hình ảnh, hiển thị thông báo
    if (images.length === 0) {
        return <span>No Images</span>;
    }

    // Thay đổi ảnh sau mỗi 3 giây
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    //     }, 3000); // 3000ms = 3s

    //     return () => clearInterval(interval); // Clear interval khi component unmount
    // }, [images.length]); // Chỉ phụ thuộc vào chiều dài của images

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    return (
        <>
            <RouterLink 
                to={`/products/${record.id}/upload-image`} 
                onClick={(event) => {
                    event.preventDefault();
                    handleOpenDialog();
                }}
                style={{ display: 'inline-block', position: 'relative', width: '100px', height: '100px' }}
            >
                <img 
                    src={images[currentIndex]} 
                    alt={`Product ${currentIndex + 1}`} 
                    style={{
                        width: '100px',
                        height: 'auto',
                        transition: 'opacity 1s ease-in-out',
                    }}
                />
            </RouterLink>
            <UploadImageDialog
                open={openDialog}
                onClose={handleCloseDialog}
                productId={record.id}
            />
        </>
    );
};

const ProductList = (props: any) => {
    
    return (
        <List {...props} filters={ProductFilter} >
            <Datagrid rowClick={false} >
                <TextField source="id" />
                <TextField source="name" label="Tên sản phẩm"/>
                <TextField source="category.name" label="Danh mục" />
                <NumberField source="price" />
                <CustomImageField source="photo"/>
                <TextField source="brand" label="Thương hiệu"/>
                <EditButton />
                <DeleteButton />
            </Datagrid>
        </List>
    );
};





export default ProductList; // Xuất ProductList là mặc định
