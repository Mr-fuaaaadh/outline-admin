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
import ApiService from "../../ApiService";
import Breadcrumbs from "../../components/Common/Breadcrumb";

const FormLayouts = () => {
    document.title = "update news| Outline Kerala";

    const { id } = useParams();
    const token = localStorage.getItem("authToken");
    const [tagsOptions, setTagsOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [existingImage, setExistingImage] = useState(null); // new state
    const editorRef = useRef(null);
    const apiService = new ApiService(token);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [tags, categories] = await Promise.all([
                    apiService.getTags(),
                    apiService.getCategories(),
                ]);
                setTagsOptions(tags.map(tag => ({ value: tag.id, label: tag.name })));
                setCategoryOptions(categories.map(cat => ({ value: cat.id, label: cat.name })));
            } catch (error) {
                console.error("Error fetching options:", error);
            }
        };
        fetchOptions();
    }, []);

    const formik = useFormik({
        enableReinitialize: true,
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
        validate: (values) => {
            const errors = {};
            if (!values.title) errors.title = "Title Required";
            if (!id && !values.image) errors.image = "Image Required";
            if (!values.slug) errors.slug = "Slug Required";
            if (!values.tags.length) errors.tags = "Select at least one tag";
            if (!values.category) errors.category = "Category Required";
            if (!values.status) errors.status = "Status Required";
            if (!values.publish_date) errors.publish_date = "Publish date Required";
            if (!values.content) errors.content = "Content Required";
            // if (!values.check) errors.check = "You must agree before submitting";
            return errors;
        },
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("name", values.name);
            formData.append("slug", values.slug);
            formData.append("content", values.content); // fix here

            if (values.image instanceof File) {
                formData.append("image", values.image);
            }
            

            formData.append("category", values.category);
            formData.append("status", values.status);
            formData.append("publish_date", values.publish_date);

            values.tags.forEach((tag) => {
                formData.append("tags", tag.value);
            });

            // DEBUG: Log form data
            for (let pair of formData.entries()) {
                console.log(pair[0] + ": " + pair[1]);
            }

            try {
                if (id) {
                    await apiService.updateNews(id, formData);
                    alert("News updated successfully!");
                } else {
                    await apiService.createNews(formData);
                    alert("News submitted successfully!");
                    formik.resetForm();
                    editorRef.current?.setContent("");
                }
            } catch (error) {
                if (error.response) {
                    console.error("Backend Error:", error.response.data);
                } else {
                    console.error("Submission Error:", error);
                }
                alert("Submission failed. Check console.");
            }
        },
    });

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                const data = await apiService.getNewsById(id);
                formik.setValues({
                    title: data.title || "",
                    name: data.name || "",
                    slug: data.slug || "",
                    content: data.content || "",
                    image: null,
                    category: data.category || "",
                    tags: (data.tags || []).map(tagId => {
                        const found = tagsOptions.find(t => t.value === tagId);
                        return found || { value: tagId, label: `Tag ${tagId}` };
                    }),
                    status: data.status || "",
                    publish_date: data.publish_date?.split("T")[0] || "",
                    check: false,
                });
                editorRef.current?.setContent(data.content || "");
                setExistingImage(data.image); // store image path
            } catch (error) {
                console.error("Error loading news data:", error);
                alert("Failed to load news data.");
            }
        };

        if (tagsOptions.length > 0) {
            fetchData();
        }
    }, [id, tagsOptions]);

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Forms" breadcrumbItem={id ? "Edit News" : "Create News"} />
                    <Row>
                        <Col xl={12}>
                            <Card>
                                <CardBody>
                                    <CardTitle className="mb-4">News Update </CardTitle>
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
                                                        id="status"
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

                                        {/* TinyMCE Editor */}
                                        <Col xs={12}>
                                            <Card>
                                                <Editor
                                                    apiKey="nmvqklkdox7m69ej8w5jr6bgg5csva7n3n9vvs1w5wsn2ot7"
                                                    onInit={(evt, editor) => (editorRef.current = editor)}
                                                    onEditorChange={(content) => {
                                                        formik.setFieldValue("content", content);
                                                    }}
                                                    value={formik.values.content}
                                                    init={{
                                                        height: 500,
                                                        menubar: true,
                                                        plugins: [
                                                            "advlist", "autolink", "lists", "link", "image", "charmap", "preview",
                                                            "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
                                                            "insertdatetime", "media", "table", "help", "wordcount",
                                                        ],
                                                        toolbar:
                                                            "undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
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

                                                    {id && !formik.values.image && existingImage && (
                                                        <div className="mt-2">
                                                            <strong>Current Image:</strong>
                                                            <br />
                                                            <img
                                                                src={`https://backend.outlinekerala.com${existingImage}`}
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

                                        <div className="form-check mb-3">
                                            <Input
                                                type="checkbox"
                                                id="check"
                                                name="check"
                                                className="form-check-input"
                                                checked={formik.values.check}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            />
                                            <Label className="form-check-label" htmlFor="check">
                                                I confirm the information is correct
                                            </Label>
                                            {formik.touched.check && formik.errors.check && (
                                                <div className="text-danger">{formik.errors.check}</div>
                                            )}
                                        </div>

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
