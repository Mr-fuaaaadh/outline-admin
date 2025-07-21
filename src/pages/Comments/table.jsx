// src/components/filter/DatatableTables.jsx
import React, { useMemo, useEffect, useState } from "react";
import PropTypes from 'prop-types';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Import components
import Breadcrumbs from '../../components/Common/Breadcrumb';
import TableContainer from '../../components/Common/TableContainer';

const DatatableTables = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ content: "", approved: false });
    const [editId, setEditId] = useState(null);

    const navigate = useNavigate();

    // Fetch data
    const fetchData = () => {
        setLoading(true);
        axios.get("https://backend.outlinekerala.com/admin_app/api/comments/")
            .then(response => {
                const formatted = response.data.map((comment, index) => ({
                    id: index + 1,
                    realId: comment.id,
                    content: comment.content || 'N/A',
                    approved: comment.approved ? "Yes" : "No",
                    created_at: comment.created_at || 'N/A',
                }));
                setComments(formatted);
            })
            .catch(error => {
                if (error.response && error.response.status === 401) {
                    console.warn("Invalid or expired token. Redirecting to login...");
                    localStorage.removeItem("authToken");
                    window.location.replace("/login");
                } else {
                    console.error("Error fetching comments data:", error);
                    setError("Failed to load data.");
                    setLoading(false);
                }
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle Delete
    const handleDelete = (realId) => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            axios.delete(`https://backend.outlinekerala.com/admin_app/api/comments/${realId}/`)
                .then(fetchData)
                .catch(error => alert("Delete failed: " + error.message));
        }
    };

    // Handle Form Submit
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const method = editId ? 'put' : 'post';
        const url = editId
            ? `https://backend.outlinekerala.com/admin_app/api/comments/${editId}/`
            : `https://backend.outlinekerala.com/admin_app/api/comments/`;

        const data = {
            content: formData.content,
            approved: formData.approved === "Yes" || formData.approved === true
        };

        axios[method](url, data)
            .then(() => {
                setShowModal(false);
                setFormData({ content: "", approved: false });
                setEditId(null);
                fetchData();
            })
            .catch(error => {
                const message = error.response?.data || error.message;
                alert("Error: " + JSON.stringify(message, null, 2));
            });
    };

    const handleEdit = (item) => {
        setFormData({
            content: item.content,
            approved: item.approved === "Yes" ? true : false
        });
        setEditId(item.realId);
        setShowModal(true);
    };

    const handleAdd = () => {
        setFormData({ content: "", approved: false });
        setEditId(null);
        setShowModal(true);
    };

    // Table Columns
    const columns = useMemo(() => [
        {
            header: 'ID',
            accessorKey: 'id',
        },
        {
            header: 'Content',
            accessorKey: 'content',
        },
        {
            header: 'Approved',
            accessorKey: 'approved',
        },
        {
            header: 'Created At',
            accessorKey: 'created_at',
            cell: ({ row }) => new Date(row.original.created_at).toLocaleString()
        },
        {
            header: 'Actions',
            accessorKey: 'actions',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <>
                        <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(item)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.realId)}>Delete</button>
                    </>
                );
            }
        },
    ], []);

    document.title = "Comments | Outline Kerala";

    return (
        <div className="page-content">
            <div className="container-fluid">
                <Breadcrumbs title="Tables" breadcrumbItem="Comment List" />

                <div className="mb-3">
                    <button className="btn btn-success" onClick={handleAdd}>Add Comment</button>
                </div>

                <TableContainer
                    columns={columns}
                    data={loading ? [] : comments}
                    isGlobalFilter={true}
                    isPagination={true}
                    SearchPlaceholder="Search comments..."
                    pagination="pagination"
                    paginationWrapper='dataTables_paginate paging_simple_numbers'
                    tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
                />

                {/* Modal */}
                {showModal && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <form onSubmit={handleFormSubmit}>
                                    <div className="modal-header">
                                        <h5 className="modal-title">{editId ? "Edit" : "Add"} Comment</h5>
                                        <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label">Content</label>
                                            <textarea
                                                className="form-control"
                                                value={formData.content}
                                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Approved</label>
                                            <select
                                                className="form-control"
                                                value={formData.approved ? "Yes" : "No"}
                                                onChange={(e) => setFormData({ ...formData, approved: e.target.value === "Yes" })}
                                            >
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
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
