import React, { useState, useRef } from "react";
import axios from "axios";
import { Alert, Card, Col, Container, Row, CardBody, Label, Form, Input, FormFeedback } from "reactstrap";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useEffect } from "react";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useNavigate } from "react-router-dom";

const FormLayouts = () => {
    document.title = "Add Category | Outline Kerala";

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const fileInputRef = useRef(null); // Ref for file input

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            console.warn("No auth token found. Redirecting to login...");
            navigate("/login");
            return;
        }
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios.defaults.headers.common['Accept'] = 'application/json';
    }, [navigate]);

    const formik = useFormik({
        initialValues: {
            name: "",
            slug: "",
            image: null,
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Name is required"),
            slug: Yup.string().required("Slug is required"),
            // image validation REMOVED
        }),
        onSubmit: async (values, { resetForm }) => {
            try {
                const formData = new FormData();
                formData.append("name", values.name);
                formData.append("slug", values.slug);
                if (values.image) {
                    formData.append("image", values.image);
                }
                const currentTime = new Date().toISOString();
                formData.append("created_at", currentTime);

                // Debug output
                for (let pair of formData.entries()) {
                    console.log(`${pair[0]}:`, pair[1]);
                }

                const response = await axios.post(
                    "https://backend.outlinekerala.com/admin_app/api/categories/",
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                setSuccessMessage("Category added successfully!");
                setErrorMessage("");

                resetForm(); // Clears Formik values
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""; // Clears file input
                }
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    console.warn("Invalid or expired token. Redirecting to login...");
                    localStorage.removeItem("authToken");
                    window.location.replace("/login");
                } else {
                    const errorText = error.response?.data || error.message;
                    console.error("POST error:", errorText);
                    setErrorMessage(JSON.stringify(errorText));
                    setSuccessMessage("");
                }
            }
        }
    });

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Forms" breadcrumbItem="Add Category" />
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardBody>
                                    {successMessage && <Alert color="success">{successMessage}</Alert>}
                                    {errorMessage && <Alert color="danger">{errorMessage}</Alert>}

                                    <Form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                                        <div className="mb-3">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                type="text"
                                                id="name"
                                                name="name"
                                                placeholder="Enter name"
                                                value={formik.values.name}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                invalid={formik.touched.name && formik.errors.name ? true : false}
                                            />
                                            <FormFeedback>{formik.errors.name}</FormFeedback>
                                        </div>
                                        <div className="mb-3">
                                            <Label htmlFor="slug">Slug</Label>
                                            <Input
                                                type="text"
                                                id="slug"
                                                name="slug"
                                                placeholder="Enter slug"
                                                value={formik.values.slug}
                                                onChange={(e) => {
                                                    const formattedSlug = e.target.value
                                                        .toLowerCase()
                                                        .replace(/\s+/g, '-')
                                                        .replace(/[^a-z0-9-]/g, '');
                                                    formik.setFieldValue("slug", formattedSlug);
                                                }}
                                                onBlur={formik.handleBlur}
                                                invalid={formik.touched.slug && formik.errors.slug ? true : false}
                                            />
                                            <FormFeedback>{formik.errors.slug}</FormFeedback>
                                            <small className="text-muted">
                                                Slug should contain only lowercase English letters, numbers, and hyphens. No Malayalam or special characters. Example: <code>new-category</code>
                                            </small>
                                        </div>
                                        <div className="mb-3">
                                            <Label htmlFor="image">Image</Label>
                                            <Input
                                                type="file"
                                                id="image"
                                                name="image"
                                                accept="image/*"
                                                innerRef={fileInputRef}
                                                onChange={(event) => {
                                                    formik.setFieldValue("image", event.currentTarget.files[0]);
                                                }}
                                                onBlur={formik.handleBlur}
                                                invalid={formik.touched.image && formik.errors.image ? true : false}
                                            />
                                            {/* No image validation */}
                                        </div>
                                        <div>
                                            <button type="submit" className="btn btn-primary">Submit</button>
                                        </div>
                                    </Form>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default FormLayouts;