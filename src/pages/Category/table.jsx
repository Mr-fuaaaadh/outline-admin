// src/components/filter/DatatableTables.jsx
import React, { useMemo, useEffect, useState } from "react";
import PropTypes from 'prop-types';
import axios from 'axios';
import { useNavigate } from "react-router-dom"; 

// Import components
import Breadcrumbs from '../../components/Common/Breadcrumb';
import TableContainer from '../../components/Common/TableContainer';

const DatatableTables = () => {
    const [category, setCategory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: "", slug: "", image: "" });
    const [editId, setEditId] = useState(null);

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
        

        fetchData();
    }, []);



    // Fetch data with Axios
    const fetchData = () => {
        setLoading(true);
        axios.get("https://backend.outlinekerala.com/admin_app/api/categories/")
            .then(response => {
                const users = response.data.map((user, index) => ({
                    id: index + 1,
                    realId: user.id,
                    name: user.name || 'N/A',
                    slug: user.slug || 'N/A',
                    image: user.image ? `https://backend.outlinekerala.com${user.image}` : 'N/A',
                }));
                setCategory(users);
                setLoading(false);
            })
            .catch(error => {
                if (error.response && error.response.status === 401) {
                    console.warn("Invalid or expired token. Redirecting to login...");
                    localStorage.removeItem("authToken");
                    window.location.replace("/login");
                } else {
                    console.error("Error fetching user data:", error);
                    setError("Failed to load data.");
                    setLoading(false);
                }
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = (realId) => {
        console.log("Deleting category with ID:", realId);
        if (window.confirm("Are you sure you want to delete this category?")) {
            axios.delete(`https://backend.outlinekerala.com/admin_app/api/categories/${realId}/`)
                .then(() => fetchData())
                .catch(error => alert("Delete failed: " + error.message));
        }
    };



    const handleFormSubmit = (e) => {
        e.preventDefault();

        const method = editId ? 'put' : 'post';
        const url = editId
            ? `https://backend.outlinekerala.com/admin_app/api/categories/${editId}/`
            : `https://backend.outlinekerala.com/admin_app/api/categories/`;

        const data = new FormData();
        data.append("name", formData.name);
        data.append("slug", formData.slug);

        if (formData.image instanceof File) {
            data.append("image", formData.image); // only append file if a file is uploaded
        }

        axios({
            method,
            url,
            data,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
            .then(() => {
                setShowModal(false);
                setFormData({ name: "", slug: "", image: "" });
                setEditId(null);
                fetchData();
            })
            .catch(error => {
                if (error.response) {
                    console.error("Error Response:", error.response);
                    alert(`Operation failed: ${JSON.stringify(error.response.data, null, 2)}`);
                } else if (error.request) {
                    console.error("No response received:", error.request);
                    alert("No response from server.");
                } else {
                    console.error("Error Message:", error.message);
                    alert("Request setup error: " + error.message);
                }
            });
    };



    const handleEdit = (item) => {
        setFormData({ name: item.name, slug: item.slug, image: item.image });
        setEditId(item.realId);
        setShowModal(true);
    };

    const handleAdd = () => {
        setFormData({ name: "", slug: "", image: "" });
        setEditId(null);
        setShowModal(true);
    };



    {
        showModal && (
            <div className="modal fade show d-block" tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <form onSubmit={handleFormSubmit}>
                            <div className="modal-header">
                                <h5 className="modal-title">{editId ? "Edit" : "Add"} Category</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Slug</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.slug}
                                        onChange={(e) =>
                                            setFormData({ ...formData, slug: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Image URL</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.image}
                                        onChange={(e) =>
                                            setFormData({ ...formData, image: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }

    const columns = useMemo(() => [
        {
            header: 'ID',
            accessorKey: 'id',
            enableColumnFilter: false,
            enableSorting: true,
        },
        {
            header: 'Name',
            accessorKey: 'name',
            enableColumnFilter: false,
            enableSorting: true,
        },
        {
            header: 'Slug',
            accessorKey: 'slug',
            enableColumnFilter: false,
            enableSorting: true,
        },
        {
            header: 'Image',
            accessorKey: 'image',
            enableColumnFilter: false,
            enableSorting: false,
            cell: info => {
                const url = info.getValue();
                return url !== 'N/A' ? (
                    <img
                        src={url}
                        alt="Category"
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                ) : (
                    'N/A'
                );
            },
        },

        {
            header: 'Actions',
            accessorKey: 'actions',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <>
                        <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => handleEdit(item)}
                        >
                            Edit
                        </button>
                        <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(item.realId)}
                        >
                            Delete
                        </button>
                    </>
                );
            },
        },
    ], []);

    document.title = "Category List | Outline Kerala";

    return (
        <div className="page-content">
            <div className="container-fluid">
                <Breadcrumbs title="Tables" breadcrumbItem="Category List" />
                <TableContainer
                    columns={columns}
                    data={loading ? [] : category}
                    isGlobalFilter={true}
                    isPagination={true}
                    SearchPlaceholder="Search users..."
                    pagination="pagination"
                    paginationWrapper='dataTables_paginate paging_simple_numbers'
                    tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
                />

                {showModal && (
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <form onSubmit={handleFormSubmit}>
                                    <div className="modal-header">
                                        <h5 className="modal-title">{editId ? "Edit" : "Add"} Category</h5>
                                        <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
                                    </div>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label">Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Slug</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.slug}
                                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Image</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="form-control"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setFormData({ ...formData, image: file });
                                                    }
                                                }}
                                            />
                                        </div>

                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary">Save</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

};

DatatableTables.propTypes = {
    preGlobalFilteredRows: PropTypes.any,
};

export default DatatableTables;
