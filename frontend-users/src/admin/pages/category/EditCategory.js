import axios from 'axios';
import React, { useCallback, useEffect, useState } from "react";
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
function EditCategory(){
    const navigate = useNavigate();
    const { id } = useParams();
    const [name, setName] = useState("");
    const [validationError, setValidationError] = useState({});

    const fetchCategory = useCallback(async () => {
        try {
            const { data } = await axios.get(`http://localhost:8000/api/product/categories/${id}`);
            const { name } = data.category;
            setName(name);
        } catch (error) {
            Swal.fire({
                text: error.response.data.message,
                icon: "error"
            });
        }
    }, [id]);

    useEffect(() => {
        fetchCategory();
    }, [fetchCategory]);

    const changeHandler = (event) => {
        const { name, value } = event.target;
        setName(value);
    };

    const updateCategory = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8000/api/product/categories/${id}`, { name });
            Swal.fire({
                icon: "success",
                text: "Category updated successfully!"
            });
            navigate("/admin/table");
        } catch (error) {
            if (error.response.status === 422) {
                setValidationError(error.response.data.errors);
            } else {
                Swal.fire({
                    text: error.response.data.message,
                    icon: "error"
                });
            }
        }
    };

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-12 col-sm-12 col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h4 className="card-title">Edit Category</h4>
                            <hr />
                            <div className="form-wrapper">
                                {Object.keys(validationError).length > 0 && (
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="alert alert-danger">
                                                <ul className="mb-0">
                                                    {Object.entries(validationError).map(([key, value]) => (
                                                        <li key={key}>{value[0]}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <Form onSubmit={updateCategory}>
                                    <Row>
                                        <Col>
                                            <Form.Group controlId="Name">
                                                <Form.Label>Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    value={name}
                                                    onChange={changeHandler}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Button variant="primary" className="mt-2" size="lg" block type="submit">
                                        Update
                                    </Button>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default EditCategory