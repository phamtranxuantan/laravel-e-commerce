
import axios from 'axios';
import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function CreateCategory(){
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [validationError, setValidationError] = useState({});

    const changeHandler = (event) => {
        const { name, value } = event.target;
        if (name === "name") {
            setName(value);
        } else if (name === "description") {
            setDescription(value);
        }
    };

    const createCategory = async (e) => {
        e.preventDefault();
        const formData = {
            name: name,
            description: description
        };

        try {
            const { data } = await axios.post('http://localhost:8000/api/product/categories', formData);
            Swal.fire({
                icon: "success",
                text: data.message
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
                            <h4 className="card-title">Create Category</h4>
                            <hr />
                            <div className="form-wrapper">
                                {Object.keys(validationError).length > 0 && (
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="alert alert-danger">
                                                <ul className="mb-0">
                                                    {Object.entries(validationError).map(([key, value]) => (
                                                        <li key={key}>{value}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <Form onSubmit={createCategory}>
                                    <Row>
                                        <Col>
                                            <Form.Group controlId="Name">
                                                <Form.Label>Name</Form.Label>
                                                <Form.Control type="text" name="name" value={name} onChange={changeHandler} />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row className="my-3">
                                        <Col>
                                            <Form.Group controlId="Description">
                                                <Form.Label>Description</Form.Label>
                                                <Form.Control as="textarea" rows={3} name="description" value={description} onChange={changeHandler} />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Button variant="primary" className="mt-2" size="lg" block type="submit">Save</Button>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default CreateCategory