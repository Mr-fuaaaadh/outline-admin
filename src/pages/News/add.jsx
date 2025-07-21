import React, { useEffect, useState, useRef } from "react";
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
import Select from "react-select";
import { Editor } from "@tinymce/tinymce-react";
import { useNavigate } from "react-router-dom"; // ✅ for redirect

import axios from "axios";

// Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

const FormLayouts = () => {
    document.title = "add news | Outline Kerala";

    const [tagsOptions, setTagsOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const editorRef = useRef(null);
    const navigate = useNavigate(); // ✅ for redirect

    useEffect(() => {
        const token = localStorage.getItem("authToken");

        if (!token) {
            navigate("/login"); // ✅ redirect to login
            return;
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        axios.defaults.headers.common['Content-Type'] = 'application/json';
        axios.defaults.headers.common['Accept'] = 'application/json';


    }, []);


    useEffect(() => {
        // Fetch tags
        axios.get("https://backend.outlinekerala.com/admin_app/api/tags/")
            .then(response => {
                const options = response.data.map(tag => ({
                    value: tag.id,
                    label: tag.name
                }));
                setTagsOptions(options);
            })
            .catch(error => {
                console.error("Error fetching tags:", error);
            });

        // Fetch categories
        axios.get("https://backend.outlinekerala.com/admin_app/api/subcategories/")
            .then(response => {
                const options = response.data.map(category => ({
                    value: category.id,
                    label: category.name
                }));
                setCategoryOptions(options);
            })
            .catch(error => {
                console.error("Error fetching categories:", error);
            });
    }, []);

    const formik = useFormik({
        initialValues: {
            title: "",
            name: "",
            slug: "",
            content: "",
            image: null,
            category: "",
            tags: [],
            status: "",
            publish_date: "",
            check: false,
        },
        // validationSchema: Yup.object({
        //     title: Yup.string().required("This field is required"),
        //     name: Yup.string().required("This field is required"),
        //     slug: Yup.string().required("This field is required"),
        //     content: Yup.string().required("This field is required"),
        //     image: Yup.string().required("This field is required"),
        //     category: Yup.string().required("This field is required"),
        //     tags: Yup.array()
        //         .min(1, "At least one tag is required")
        //         .of(
        //             Yup.object().shape({
        //                 value: Yup.string().required(),
        //                 label: Yup.string().required(),
        //             })
        //         )
        //         .required("This field is required"),
        //     status: Yup.string().required("This field is required"),
        //     publish_date: Yup.string().required("This field is required"),
        //     check: Yup.boolean().oneOf([true], "You must agree before submitting"),
        // }),
        validate: values => {
            const errors = {};
            if (!values.title) errors.title = "Title Required";
            if (!values.image) errors.image = "Image required";
            if (!values.slug) errors.slug = "Slug Required";
            if (!values.tags || values.tags.length === 0) errors.tags = "Select at least one tag";
            if (!values.category) errors.category = "Category Required";
            if (!values.status) errors.status = "Status Required";
            if (!values.publish_date) errors.publish_date = "Publish date Required";
            if (!values.content) errors.content = "Content Required";

            return errors;
        },

        onSubmit: async (values, { resetForm }) => {
            try {
                const formData = new FormData();
                formData.append("title", values.title);
                formData.append("name", values.name);
                formData.append("slug", values.slug);
                formData.append("content", values.content); // uncommented to send content
                formData.append("image", values.image);
                formData.append("category", values.category);
                formData.append("status", values.status);
                formData.append("publish_date", values.publish_date);

                // Append each tag with the same key 'tags'
                values.tags.forEach(tag => {
                    formData.append('tags', tag.value);
                });

                // Debug log
                for (let pair of formData.entries()) {
                    console.log(pair[0], pair[1]);
                }

                const response = await axios.post(
                    "https://backend.outlinekerala.com/admin_app/api/news/create/",
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                alert("News submitted successfully!");
                formik.resetForm();
                editorRef.current?.setContent("");
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    console.warn("Invalid or expired token. Redirecting to login...");
                    localStorage.removeItem("authToken");
                    window.location.replace("/login");
                } else {
                    console.error("Backend response error:", error.response?.data || error);
                    alert("Submission failed.");
                }
            }
        }


    });

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Forms" breadcrumbItem="Add News" />
                    <Row>
                        <Col xl={12}>
                            <Card>
                                <CardBody>
                                    {/* <CardTitle className="mb-4">Form Grid Layout</CardTitle> */}

                                    <Form onSubmit={formik.handleSubmit}>
                                        <div className="mb-3">
                                            <Label htmlFor="title">Title</Label>
                                            <Input
                                                type="text"
                                                name="title"
                                                id="title"
                                                value={formik.values.title}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                invalid={formik.touched.title && !!formik.errors.title}
                                            />
                                            <FormFeedback>{formik.errors.title}</FormFeedback>
                                        </div>

                                        <Row>
                                            <Col lg={6}>
                                                <div className="mb-3">
                                                    <Label htmlFor="slug">Slug</Label>
                                                    <Input
                                                        type="text"
                                                        name="slug"
                                                        id="slug"
                                                        value={formik.values.slug}
                                                        onChange={(e) => {
                                                            const formattedSlug = e.target.value
                                                                .toLowerCase()
                                                                .replace(/\s+/g, '-')         // Replace spaces with hyphens
                                                                .replace(/[^a-z0-9-]/g, '');   // Remove non-English & special characters
                                                            formik.setFieldValue("slug", formattedSlug);
                                                        }}
                                                        onBlur={formik.handleBlur}
                                                        invalid={formik.touched.slug && !!formik.errors.slug}
                                                    />
                                                    <FormFeedback>{formik.errors.slug}</FormFeedback>
                                                    <small className="text-muted">
                                                        Slug must contain only lowercase English letters, numbers, and hyphens. Malayalam and special characters are not allowed. Example: <code>latest-news</code>
                                                    </small>
                                                </div>

                                            </Col>
                                            <Col lg={6}>
                                                <div className="mb-3">
                                                    <Label htmlFor="status">Status</Label>
                                                    <select
                                                        name="status"
                                                        id="content"
                                                        className="form-control"
                                                        value={formik.values.status}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                    >
                                                        <option value="">Select status</option>
                                                        <option value="draft">Draft</option>
                                                        <option value="published">Published</option>
                                                    </select>
                                                    {formik.touched.status && formik.errors.status && (
                                                        <div className="text-danger">{formik.errors.status}</div>
                                                    )}
                                                </div>
                                            </Col>
                                        </Row>

                                        {/* content value */}
                                        <Col xs={12}>
                                            <Card>
                                                <Editor
                                                    apiKey="nmvqklkdox7m69ej8w5jr6bgg5csva7n3n9vvs1w5wsn2ot7"
                                                    onInit={(evt, editor) => (editorRef.current = editor)}
                                                    onEditorChange={(content) => {
                                                        formik.setFieldValue("content", content);
                                                    }}
                                                    init={{
                                                        height: 350,
                                                        menubar: true,
                                                        plugins: [
                                                            "advlist", "autolink", "lists", "link", "image", "charmap", "preview", "anchor",
                                                            "searchreplace", "visualblocks", "code", "fullscreen",
                                                            "insertdatetime", "media", "table", "help", "wordcount"
                                                        ],
                                                        toolbar:
                                                            "undo redo | blocks | bold italic forecolor | " +
                                                            "alignleft aligncenter alignright alignjustify | " +
                                                            "bullist numlist outdent indent | removeformat | help",
                                                        content_style:
                                                            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }"
                                                    }}
                                                />
                                                {formik.touched.content && formik.errors.content && (
                                                    <div className="text-danger">{formik.errors.content}</div>
                                                )}

                                            </Card>
                                        </Col>


                                        <Row>
                                            <Col lg={4}>
                                                <div className="mb-3">
                                                    <Label htmlFor="tags">Tags</Label>
                                                    <Select
                                                        isMulti
                                                        name="tags"
                                                        options={tagsOptions}
                                                        value={formik.values.tags}
                                                        onChange={(selected) => formik.setFieldValue("tags", selected)}
                                                        onBlur={() => formik.setFieldTouched("tags", true)}
                                                    />
                                                    {formik.touched.tags && formik.errors.tags && (
                                                        <div className="text-danger">{formik.errors.tags}</div>
                                                    )}
                                                </div>
                                            </Col>

                                            <Col lg={4}>
                                                <div className="mb-3">
                                                    <Label htmlFor="category">Category</Label>
                                                    <Select
                                                        name="category"
                                                        options={categoryOptions}
                                                        value={categoryOptions.find(
                                                            (option) => option.value === formik.values.category
                                                        )}
                                                        onChange={(selected) =>
                                                            formik.setFieldValue("category", selected.value)
                                                        }
                                                        onBlur={() => formik.setFieldTouched("category", true)}
                                                    />
                                                    {formik.touched.category && formik.errors.category && (
                                                        <div className="text-danger">{formik.errors.category}</div>
                                                    )}
                                                </div>
                                            </Col>



                                            <Col lg={4}>
                                                <div className="mb-3">
                                                    <Label htmlFor="image">Image URL</Label>
                                                    <Input
                                                        type="file"
                                                        name="image"
                                                        id="image"
                                                        onChange={(event) => formik.setFieldValue("image", event.currentTarget.files[0])}
                                                        onBlur={formik.handleBlur}
                                                        invalid={formik.touched.image && !!formik.errors.image}
                                                    />
                                                    <FormFeedback>{formik.errors.image}</FormFeedback>

                                                    <FormFeedback>{formik.errors.image}</FormFeedback>
                                                </div>
                                            </Col>

                                            <Col lg={4}>
                                                <div className="mb-3">
                                                    <Label htmlFor="publish_date">Publish Date</Label>
                                                    <Input
                                                        type="date"
                                                        name="publish_date"
                                                        id="publish_date"
                                                        value={formik.values.publish_date}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        invalid={formik.touched.publish_date && !!formik.errors.publish_date}
                                                    />
                                                    <FormFeedback>{formik.errors.publish_date}</FormFeedback>
                                                </div>
                                            </Col>
                                        </Row>

                                        <div className="mb-3 form-check">
                                            <Input
                                                type="checkbox"
                                                name="check"
                                                id="check"
                                                className="form-check-input"
                                                checked={formik.values.check}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                invalid={formik.touched.check && !!formik.errors.check}
                                            />
                                            <Label className="form-check-label" htmlFor="check">
                                                Check me out
                                            </Label>
                                            {formik.touched.check && formik.errors.check && (
                                                <div className="text-danger">{formik.errors.check}</div>
                                            )}
                                        </div>

                                        <button type="submit" className="btn btn-primary w-md">
                                            Submit
                                        </button>
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
