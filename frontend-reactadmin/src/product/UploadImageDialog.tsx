import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNotify } from 'react-admin';

const UploadImageDialog = ({ open, onClose, productId }) => {
    const [file, setFile] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [imageToUpdate, setImageToUpdate] = useState(null); // Lưu ảnh cần cập nhật
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const notify = useNotify();

    useEffect(() => {
        if (open && productId) {
            axios.get(`http://localhost:8000/api/product/photo/${productId}`)
                .then((response) => {
                    setPhotos(response.data.photo || []);
                })
                .catch((error) => {
                    console.error(error);
                    notify('Lỗi khi lấy ảnh.', 'warning');
                });
        }
    }, [open, productId]);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpdate = async () => {
        console.log('File:', file);
        console.log('Image to update:', imageToUpdate);

        // Kiểm tra xem đã chọn ảnh và ảnh cần cập nhật hay chưa
        if (!file || !imageToUpdate) {
            notify('Vui lòng chọn ảnh và ảnh cần cập nhật.', 'warning');
            return;
        }

        const formData = new FormData();
        // Thêm ảnh cũ vào formData
        formData.append('old_image', imageToUpdate); // URL của ảnh cần cập nhật
        // Thêm ảnh mới vào formData
        formData.append('photo', file); // File ảnh mới

        try {
            const response = await axios.post(`http://localhost:8000/api/product/photo/${productId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            notify('Cập nhật ảnh thành công.', 'info');
            // Cập nhật ảnh trong danh sách
            setPhotos(photos.map(photo => photo === imageToUpdate ? response.data.photos : photo));
            setFile(null); // Reset lại file sau khi cập nhật thành công
            setImageToUpdate(null); // Reset lại ảnh cần cập nhật
            onClose(); // Đóng modal hoặc popup
            window.location.reload(); // Tải lại trang để xem thay đổi
        } catch (error) {
            console.error(error);
            notify('Lỗi khi cập nhật ảnh.', 'warning');
        }
    };

    const handlePhotoSelect = (photo) => {
        setSelectedPhoto(photo);
        setImageToUpdate(photo); // Cập nhật ảnh cần cập nhật
    };
    const handleUpload = async () => {
        if (!file) {
            notify('Vui lòng chọn ảnh.', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('photo', file);

        try {
            const response = await axios.post(`http://localhost:8000/api/products/${productId}/upload-image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            notify('Thêm ảnh thành công.', 'info');
            setPhotos([...photos, response.data.photo]); // Thêm ảnh mới vào danh sách
            setFile(null); // Reset lại file sau khi tải lên thành công
            onClose();
            
        } catch (error) {
            console.error(error);
            notify('Lỗi.', 'warning');
        }
        window.location.reload();
    };

    const handleDelete = async () => {
        if (!selectedPhoto) {
            notify('Vui lòng chọn ảnh để xóa.', 'warning');
            return;
        }
        try {
            await axios.delete(`http://localhost:8000/api/product/photo/${productId}`, {
                data: { photo: selectedPhoto },
            });
            notify('Xóa ảnh thành công.', 'info');
            setPhotos(photos.filter((photo) => photo !== selectedPhoto)); // Xóa ảnh khỏi danh sách
            
        } catch (error) {
            console.error(error);
            notify('Lỗi khi xóa ảnh.', 'warning');
        }
        window.location.reload();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Thêm ảnh</DialogTitle>
            <DialogContent>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <div style={{ marginTop: '20px' }}>
                    {photos.length > 0 ? (
                        photos.map((photo, index) => (
                            <div 
                                key={index} 
                                style={{ marginBottom: '10px', cursor: 'pointer' }} 
                                onClick={() => handlePhotoSelect(photo)} // Gọi hàm khi người dùng nhấp vào
                            >
                                <img 
                                    src={photo} 
                                    alt={`Product ${index}`} 
                                    width={100} 
                                    height={100} 
                                    style={{ border: selectedPhoto === photo ? '2px solid #99FFFF' : 'none', borderRadius: '5px' }} // Đánh dấu ảnh đang chọn
                                />
                            </div>
                        ))
                    ) : (
                        <p>Chưa có ảnh nào.</p>
                    )}
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button onClick={handleUpload} color="primary">
                Thêm
                </Button>
                <Button onClick={handleUpdate} color="primary" disabled={!selectedPhoto || !file}>
                    Cập nhật
                </Button>
                <Button onClick={handleDelete} color="secondary" disabled={!selectedPhoto}>
                Xóa
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UploadImageDialog;
