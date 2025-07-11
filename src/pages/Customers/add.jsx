import React from "react";
import axios from "axios";
import { Alert } from "reactstrap";


import {
    Card,
    Col,
    Container,
    Row,
    CardBody,
    CardTitle,
    Label,
    Form,
    Input,
    FormFeedback,
} from "reactstrap";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ for redirect

// Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

const FormLayouts = () => {
    // meta title
    document.title =
        "Form Layouts | Skote - Vite React Admin & Dashboard Template";

    const [successMessage, setSuccessMessage] = React.useState("");
    const [errorMessage, setErrorMessage] = React.useState("");

    const navigate = useNavigate();


    useEffect(() => {
        const token = localStorage.getItem("authToken");

        if (!token) {
            console.warn("No auth token found. Redirecting to login...");
            navigate("/login"); // ✅ redirect to login
            return;
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios.defaults.headers.common['Accept'] = 'application/json';
        

    }, []);

    

    const formik = useFormik({
        initialValues: {
            first_name: "",
            last_name: "",
            username: "",
            role: "",
            email: "",
            bio: "",
            profile_picture: null,
            password: "",
            confirm_password: ""
        },
        validationSchema: Yup.object({
            first_name: Yup.string().required("This field is required"),
            last_name: Yup.string().required("This field is required"),
            username: Yup.string().required("This field is required"),
            role: Yup.string().oneOf(["admin", "reader"], "Invalid role").required("This field is required"),
            email: Yup.string().email("Invalid email").required("Please enter your email"),
            bio: Yup.string().required("This field is required"),
            profile_picture: Yup.mixed()
                .required("Profile picture is required")
                .test("fileSize", "File too large (max 5 MB)", (value) => value && value.size <= 5 * 1024 * 1024)
                .test("fileType", "Unsupported Format", (value) => value && ["image/jpeg", "image/png", "image/webp"].includes(value.type)),
            password: Yup.string()
                .required("Password is required")
                .min(6, "Password must be at least 6 characters"),
            confirm_password: Yup.string()
                .oneOf([Yup.ref("password"), null], "Passwords must match")
                .required("Confirm Password is required")
        }),

        onSubmit: async (values) => {
            try {
                const formData = new FormData();
                Object.entries(values).forEach(([key, value]) => {
                    formData.append(key, value);
                });

                const response = await axios.post(
                    "https://backend.outlinekerala.com/admin_app/api/users/",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                console.log("Form submitted successfully:", response.data);
                setSuccessMessage("User created successfully!");
                setErrorMessage("");
                formik.resetForm(); // Optional: reset form on success
            } catch (error) {
                const errorText = error.response?.data?.detail || "Something went wrong.";
                setErrorMessage(errorText);
                setSuccessMessage("");
                console.error("Form submission error:", error.response?.data || error.message);
            }
        }

    });

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid={true}>
                    <Breadcrumbs title="Forms" breadcrumbItem="Form Layouts" />
                    <Row>
                        <Col xl={12}>
                            <Card>
                                <CardBody>
                                    <CardTitle className="mb-4">User Profile Form</CardTitle>

                                    <Form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                                        {successMessage && (
                                            <Alert color="success" className="mt-3">
                                                {successMessage}
                                            </Alert>
                                        )}
                                        {errorMessage && (
                                            <Alert color="danger" className="mt-3">
                                                {errorMessage}
                                            </Alert>
                                        )}

                                        <Row>
                                            <Col md={6}>
                                                <div className="mb-3">
                                                    <Label htmlFor="firstName">First Name</Label>
                                                    <Input
                                                        type="text"
                                                        name="first_name"
                                                        id="firstName"
                                                        placeholder="Enter First Name"
                                                        value={formik.values.first_name}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        invalid={
                                                            formik.touched.first_name && formik.errors.first_name
                                                                ? true
                                                                : false
                                                        }
                                                    />
                                                    {formik.touched.first_name && formik.errors.first_name ? (
                                                        <FormFeedback type="invalid">
                                                            {formik.errors.first_name}
                                                        </FormFeedback>
                                                    ) : null}
                                                </div>
                                            </Col>

                                            <Col md={6}>
                                                <div className="mb-3">
                                                    <Label htmlFor="lastName">Last Name</Label>
                                                    <Input
                                                        type="text"
                                                        name="last_name"
                                                        id="lastName"
                                                        placeholder="Enter Last Name"
                                                        value={formik.values.last_name}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        invalid={
                                                            formik.touched.last_name && formik.errors.last_name
                                                                ? true
                                                                : false
                                                        }
                                                    />
                                                    {formik.touched.last_name && formik.errors.last_name ? (
                                                        <FormFeedback type="invalid">
                                                            {formik.errors.last_name}
                                                        </FormFeedback>
                                                    ) : null}
                                                </div>
                                            </Col>

                                            <Col md={4}>
                                                <div className="mb-3">
                                                    <Label htmlFor="username">Username</Label>
                                                    <Input
                                                        type="text"
                                                        name="username"
                                                        id="username"
                                                        placeholder="Enter Username"
                                                        value={formik.values.username}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        invalid={
                                                            formik.touched.username && formik.errors.username
                                                                ? true
                                                                : false
                                                        }
                                                    />
                                                    {formik.touched.username && formik.errors.username ? (
                                                        <FormFeedback type="invalid">
                                                            {formik.errors.username}
                                                        </FormFeedback>
                                                    ) : null}
                                                </div>
                                            </Col>


                                            <Col md={4}>
                                                {/* Role */}
                                                <div className="mb-3">
                                                    <Label htmlFor="roleSelect">Role</Label>
                                                    <select
                                                        name="role"
                                                        id="roleSelect"
                                                        className="form-control"
                                                        value={formik.values.role}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                    >
                                                        <option value="">Choose...</option>
                                                        <option value="admin">Admin</option>
                                                        <option value="reader">Reader</option>
                                                    </select>
                                                    {formik.touched.role && formik.errors.role ? (
                                                        <span className="text-danger">{formik.errors.role}</span>
                                                    ) : null}
                                                </div>

                                            </Col>


                                            <Col md={4}>
                                                {/* Email */}
                                                <div className="mb-3">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input
                                                        type="email"
                                                        name="email"
                                                        id="email"
                                                        placeholder="Enter Email"
                                                        value={formik.values.email}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        invalid={
                                                            formik.touched.email && formik.errors.email ? true : false
                                                        }
                                                    />
                                                    {formik.touched.email && formik.errors.email ? (
                                                        <FormFeedback type="invalid">
                                                            {formik.errors.email}
                                                        </FormFeedback>
                                                    ) : null}
                                                </div>
                                            </Col>
                                        </Row>


                                        <Row>
                                            <Col md={6}>
                                                <div className="mb-3">
                                                    <Label htmlFor="password">Password</Label>
                                                    <Input
                                                        type="password"
                                                        name="password"
                                                        id="password"
                                                        placeholder="Enter Password"
                                                        value={formik.values.password}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        invalid={formik.touched.password && formik.errors.password ? true : false}
                                                    />
                                                    {formik.touched.password && formik.errors.password ? (
                                                        <FormFeedback type="invalid">{formik.errors.password}</FormFeedback>
                                                    ) : null}
                                                </div>
                                            </Col>
                                            <Col md={6}>
                                                <div className="mb-3">
                                                    <Label htmlFor="confirm_password">Confirm Password</Label>
                                                    <Input
                                                        type="password"
                                                        name="confirm_password"
                                                        id="confirm_password"
                                                        placeholder="Confirm Password"
                                                        value={formik.values.confirm_password}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        invalid={formik.touched.confirm_password && formik.errors.confirm_password ? true : false}
                                                    />
                                                    {formik.touched.confirm_password && formik.errors.confirm_password ? (
                                                        <FormFeedback type="invalid">{formik.errors.confirm_password}</FormFeedback>
                                                    ) : null}
                                                </div>
                                            </Col>
                                        </Row>


                                        {/* Bio */}
                                        <div className="mb-3">
                                            <Label htmlFor="bio">Bio</Label>
                                            <Input
                                                type="textarea"
                                                name="bio"
                                                id="bio"
                                                rows="4"
                                                placeholder="Tell us something about yourself"
                                                value={formik.values.bio}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                invalid={
                                                    formik.touched.bio && formik.errors.bio ? true : false
                                                }
                                            />
                                            {formik.touched.bio && formik.errors.bio ? (
                                                <FormFeedback type="invalid">
                                                    {formik.errors.bio}
                                                </FormFeedback>
                                            ) : null}
                                        </div>

                                        {/* Profile Picture */}
                                        <div className="mb-4">
                                            <Label htmlFor="profilePicture">Profile Picture</Label>
                                            <Input
                                                type="file"
                                                name="profile_picture"
                                                id="profilePicture"
                                                accept="image/*"
                                                onChange={(event) => {
                                                    formik.setFieldValue(
                                                        "profile_picture",
                                                        event.currentTarget.files[0]
                                                    );
                                                }}
                                                onBlur={formik.handleBlur}
                                                invalid={
                                                    formik.touched.profile_picture && formik.errors.profile_picture
                                                        ? true
                                                        : false
                                                }
                                            />
                                            {formik.touched.profile_picture && formik.errors.profile_picture ? (
                                                <FormFeedback type="invalid">
                                                    {formik.errors.profile_picture}
                                                </FormFeedback>
                                            ) : null}
                                        </div>

                                        <div>
                                            <button type="submit" className="btn btn-primary w-md">
                                                Submit
                                            </button>
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
