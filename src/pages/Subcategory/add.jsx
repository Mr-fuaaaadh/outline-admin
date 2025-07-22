import React, { useState, useEffect } from "react";
import axios from "axios";
import { Alert, Card, Col, Container, Row, CardBody, Label, Form, Input, FormFeedback } from "reactstrap";
import * as Yup from "yup";
import { useFormik } from "formik";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { useNavigate } from "react-router-dom";

const FormLayouts = () => {
    document.title = "Add Category | Outline Kerala";

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            navigate("/login");
            return;
        }
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios.defaults.headers.common['Accept'] = 'application/json';
    }, [navigate]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("https://backend.outlinekerala.com/admin_app/api/categories/");
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    const formik = useFormik({
        initialValues: {
            name: "",
            slug: "",
            image: null,
            category: "",
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Name is required"),
            slug: Yup.string().required("Slug is required"),
            category: Yup.string().required("Category is required"),
            // Image validation REMOVED
        }),
        onSubmit: async (values, { resetForm, setFieldValue }) => {
            try {
                const formData = new FormData();
                formData.append("name", values.name);
                formData.append("slug", values.slug);
                formData.append("category", values.category);

                // ✅ Only append image if it exists
                if (values.image) {
                    formData.append("image", values.image);
                }

                const response = await axios.post(
                    "https://backend.outlinekerala.com/admin_app/api/subcategories/",
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                setSuccessMessage("Category added successfully!");
                setErrorMessage("");

                resetForm({ values: { name: "", slug: "", image: null, category: "" } });
                setFieldValue("image", null);
                document.getElementById("image").value = "";
            } catch (error) {
                if (error.response?.status === 401) {
                    localStorage.removeItem("authToken");
                    window.location.replace("/login");
                } else {
                    let errMsg = "Submission failed. Please try again.";

                    if (error.response?.data) {
                        const data = error.response.data;
                        if (typeof data === "object") {
                            const messages = Object.entries(data)
                                .map(([field, msg]) => `${field}: ${Array.isArray(msg) ? msg.join(', ') : msg}`)
                                .join(" | ");
                            errMsg = messages;
                        } else if (typeof data === "string") {
                            errMsg = data;
                        }
                    }

                    setErrorMessage(errMsg);
                    setSuccessMessage("");
                    console.error("Submission error:", error);
                }
            }
        }

    });

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Forms" breadcrumbItem="Add Sub Category" />
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
                                                invalid={formik.touched.name && !!formik.errors.name}
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
                                                invalid={formik.touched.slug && !!formik.errors.slug}
                                            />
                                            <FormFeedback>{formik.errors.slug}</FormFeedback>
                                            <small className="text-muted">
                                                Slug should contain only lowercase English letters, numbers, and hyphens. No Malayalam or special characters. Example: <code>new-subcategory</code>
                                            </small>
                                        </div>
                                        <div className="mb-3">
                                            <Label htmlFor="category">Category</Label>
                                            <Input
                                                type="select"
                                                id="category"
                                                name="category"
                                                value={formik.values.category}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                invalid={formik.touched.category && !!formik.errors.category}
                                            >
                                                <option value="">-- Select Category --</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </Input>
                                            <FormFeedback>{formik.errors.category}</FormFeedback>
                                        </div>
                                        <div className="mb-3">
                                            <Label htmlFor="image">Image</Label>
                                            <Input
                                                type="file"
                                                id="image"
                                                name="image"
                                                accept="image/*"
                                                onChange={(event) => {
                                                    formik.setFieldValue("image", event.currentTarget.files[0]);
                                                }}
                                                onBlur={formik.handleBlur}
                                            // No validation for image
                                            />
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