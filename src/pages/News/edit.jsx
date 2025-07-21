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
import axios from "axios";
import { useParams } from "react-router-dom";

// Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

const FormLayouts = () => {
    document.title = "update news| Outline Kerala";

    const { id } = useParams(); // get id from URL params

    const [tagsOptions, setTagsOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const editorRef = useRef(null);

    // Fetch tags and categories options on mount
    useEffect(() => {
        // Fetch tags
        axios
            .get("https://backend.outlinekerala.com/admin_app/api/tags/") // Adjust this URL to your tags endpoint
            .then((response) => {
                const options = response.data.map((tag) => ({
                    value: tag.id,
                    label: tag.name,
                }));
                setTagsOptions(options);
            })
            .catch((error) => {
                console.error("Error fetching tags:", error);
            });

        // Fetch categories
        axios
            .get("https://backend.outlinekerala.com/admin_app/api/subcategories/")
            .then((response) => {
                const options = response.data.map((category) => ({
                    value: category.id,
                    label: category.name,
                }));
                setCategoryOptions(options);
            })
            .catch((error) => {
                console.error("Error fetching categories:", error);
            });
    }, []);

    // Formik setup with enableReinitialize to update form when initialValues change
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            title: "",
            name: "",
            slug: "",
            content: "",
            image: null, // file object
            category: "",
            tags: [],
            status: "",
            publish_date: "",
            check: false,
        },
        validate: (values) => {
            const errors = {};
            if (!values.title) errors.title = "Title Required";
            if (!id && !values.image) errors.image = "Image required"; // require image only on create
            if (!values.slug) errors.slug = "Slug Required";
            if (!values.tags || values.tags.length === 0) errors.tags = "Select at least one tag";
            if (!values.category) errors.category = "Category Required";
            if (!values.status) errors.status = "Status Required";
            if (!values.publish_date) errors.publish_date = "Publish date Required";
            if (!values.content) errors.content = "Content Required";
            if (!values.check) errors.check = "You must agree before submitting";
            return errors;
        },
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("name", values.name);
            formData.append("slug", values.slug);
            formData.append("content", editorRef.current.getContent());

            if (values.image instanceof File) {
                formData.append("image", values.image);
            }

            formData.append("category", values.category);
            formData.append("status", values.status);
            formData.append("publish_date", values.publish_date);

            values.tags.forEach((tag) => {
                formData.append("tags", tag.value);
            });

            try {
                if (id) {
                    await axios.patch(
                        `https://backend.outlinekerala.com/admin_app/api/news/${id}/update/`,
                        formData,
                        {
                            headers: { "Content-Type": "multipart/form-data" },
                        }
                    );
                    alert("News updated successfully!");
                } else {
                    await axios.post(
                        "https://backend.outlinekerala.com/admin_app/api/news/create/",
                        formData,
                        {
                            headers: { "Content-Type": "multipart/form-data" },
                        }
                    );
                    alert("News submitted successfully!");
                    formik.resetForm();
                    editorRef.current?.setContent("");
                }
            } catch (error) {
                console.error("Submission Error:", error);
                console.error("Response Data:", error.response?.data);
                alert("Submission failed. Check console for details.");
            }
        }

    });

    // Fetch data for edit form
    useEffect(() => {
        if (!id) return; // do nothing if no id

        axios
            .get(`https://backend.outlinekerala.com/admin_app/api/news/${id}/`)
            .then((response) => {
                const data = response.data;

                // Set form values with fetched data
                formik.setValues({
                    title: data.title || "",
                    name: data.name || "",
                    slug: data.slug || "",
                    content: data.content || "",
                    image: null, // file input can't be programmatically set
                    category: data.category || "",
                    tags:
                        data.tags && Array.isArray(data.tags)
                            ? data.tags.map((tagId) => {
                                // Find tag object from options by id
                                const tagOption = tagsOptions.find((t) => t.value === tagId);
                                return tagOption || { value: tagId, label: `Tag ${tagId}` };
                            })
                            : [],
                    status: data.status || "",
                    publish_date: data.publish_date
                        ? data.publish_date.split("T")[0]
                        : "",
                    check: false,
                });

                // Set TinyMCE content
                if (editorRef.current) editorRef.current.setContent(data.content || "");
            })
            .catch((error) => {
                console.error("Error loading news data:", error);
                alert("Failed to load news data.");
            });
    }, [id, tagsOptions]); // re-run when id or tagsOptions change (tagsOptions needed to map tags)

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Forms" breadcrumbItem={id ? "Edit News" : "Create News"} />
                    <Row>
                        <Col xl={12}>
                            <Card>
                                <CardBody>
                                    <CardTitle className="mb-4">Form Grid Layout</CardTitle>

                                    <Form onSubmit={formik.handleSubmit} encType="multipart/form-data">
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
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        invalid={formik.touched.slug && !!formik.errors.slug}
                                                    />
                                                    <FormFeedback>{formik.errors.slug}</FormFeedback>
                                                </div>
                                            </Col>
                                            <Col lg={6}>
                                                <div className="mb-3">
                                                    <Label htmlFor="status">Status</Label>
                                                    <select
                                                        name="status"
                                                        id="slug"
                                                        className={`form-control ${formik.touched.status && formik.errors.status ? "is-invalid" : ""
                                                            }`}
                                                        value={formik.values.status}
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                    >
                                                        <option value="">Select status</option>
                                                        <option value="draft">Draft</option>
                                                        <option value="published">Published</option>
                                                    </select>
                                                    {formik.touched.status && formik.errors.status && (
                                                        <div className="invalid-feedback">{formik.errors.status}</div>
                                                    )}
                                                </div>
                                            </Col>
                                        </Row>

                                        {/* TinyMCE Content */}
                                        <Col xs={12}>
                                            <Card>
                                                <Editor
                                                    apiKey="nmvqklkdox7m69ej8w5jr6bgg5csva7n3n9vvs1w5wsn2ot7"
                                                    onInit={(evt, editor) => (editorRef.current = editor)}
                                                    onEditorChange={(content) => {
                                                        formik.setFieldValue("content", content);
                                                    }}
                                                    initialValue={formik.values.content}
                                                    init={{
                                                        height: 350,
                                                        menubar: true,
                                                        plugins: [
                                                            "advlist",
                                                            "autolink",
                                                            "lists",
                                                            "link",
                                                            "image",
                                                            "charmap",
                                                            "preview",
                                                            "anchor",
                                                            "searchreplace",
                                                            "visualblocks",
                                                            "code",
                                                            "fullscreen",
                                                            "insertdatetime",
                                                            "media",
                                                            "table",
                                                            "help",
                                                            "wordcount",
                                                        ],
                                                        toolbar:
                                                            "undo redo | blocks | bold italic forecolor | " +
                                                            "alignleft aligncenter alignright alignjustify | " +
                                                            "bullist numlist outdent indent | removeformat | help",
                                                        content_style:
                                                            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
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
                                                        value={categoryOptions.find((option) => option.value === formik.values.category) || null}
                                                        onChange={(selected) => formik.setFieldValue("category", selected.value)}
                                                        onBlur={() => formik.setFieldTouched("category", true)}
                                                    />
                                                    {formik.touched.category && formik.errors.category && (
                                                        <div className="text-danger">{formik.errors.category}</div>
                                                    )}
                                                </div>
                                            </Col>

                                            <Col lg={4}>
                                                <div className="mb-3">
                                                    <Label htmlFor="image">Image (upload new to replace)</Label>
                                                    <Input
                                                        type="file"
                                                        name="image"
                                                        id="image"
                                                        onChange={(event) => formik.setFieldValue("image", event.currentTarget.files[0])}
                                                        onBlur={formik.handleBlur}
                                                        invalid={formik.touched.image && !!formik.errors.image}
                                                    />
                                                    <FormFeedback>{formik.errors.image}</FormFeedback>

                                                    {/* Show current image preview if editing */}
                                                    {id && !formik.values.image && (
                                                        <div className="mt-2">
                                                            <strong>Current Image:</strong>
                                                            <br />
                                                            <img
                                                                src={`https://backend.outlinekerala.com${formik.values.image || ""}`}
                                                                alt="Current"
                                                                style={{ width: "150px", marginTop: "5px" }}
                                                            />
                                                        </div>
                                                    )}
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
                                        <button type="submit" className="btn btn-primary w-md">
                                            {id ? "Update" : "Submit"}
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
