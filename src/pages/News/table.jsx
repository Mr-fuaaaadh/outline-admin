import React, { useMemo, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Components
import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";

const DatatableTables = () => {
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);
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

    // Fetch news data
    useEffect(() => {
        axios.get("https://backend.outlinekerala.com/admin_app/api/news/create/")
            .then(response => {
                const newsItems = response.data.map(item => ({
                    id: item.id,
                    title: item.title || 'N/A',
                    slug: item.slug || 'N/A',
                    content: item.content || 'N/A',
                    image: item.image ? `https://backend.outlinekerala.com${item.image}` : 'N/A',
                    status: item.status || 'N/A',
                    publishDate: item.publish_date
                        ? new Date(item.publish_date).toLocaleDateString('en-GB')
                        : 'N/A',
                    createdAt: item.created_at
                        ? new Date(item.created_at).toLocaleString('en-GB')
                        : 'N/A',
                }));
                setNewsData(newsItems);
                setLoading(false);
            })
            .catch(error => {
                if (error.response && error.response.status === 401) {
                    console.warn("Invalid or expired token. Redirecting to login...");
                    localStorage.removeItem("authToken");
                    window.location.replace("/login");
                } else {
                    console.error("Error fetching news data:", error);
                    setLoading(false);
                }
            });
    }, []);

    // Delete news item
    const handleDelete = async (id) => {
        const confirm = window.confirm("Are you sure you want to delete this item?");
        if (!confirm) return;

        try {
            await axios.delete(`https://backend.outlinekerala.com/admin_app/api/news/${id}/delete/`);
            setNewsData(prev => prev.filter(item => item.id !== id));
            alert("Deleted successfully!");
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete. Check console.");
        }
    };

    // Columns definition
    const columns = useMemo(() => [
        {
            header: "ID",
            accessorKey: "id",
        },
        {
            header: "Title",
            accessorKey: "title",
        },
        {
            header: "Slug",
            accessorKey: "slug",
        },
        {
            header: "Status",
            accessorKey: "status",
        },
        {
            header: "Publish Date",
            accessorKey: "publishDate",
        },
        {
            header: "Created At",
            accessorKey: "createdAt",
        },
        {
            header: "Image",
            accessorKey: "image",
            cell: info => (
                <img
                    src={info.getValue()}
                    alt="news"
                    style={{ width: "60px", height: "auto" }}
                />
            ),
        },
        {
            header: "Actions",
            accessorKey: "actions",
            cell: ({ row }) => (
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-sm btn-warning"
                        onClick={() => navigate(`/news/edit/${row.original.id}`)}
                    >
                        Edit
                    </button>
                    <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(row.original.id)}
                    >
                        Delete
                    </button>
                </div>
            ),
        }
    ], [navigate]);

    document.title = "News | Outline Kerala";

    return (
        <div className="page-content">
            <div className="container-fluid">
                <Breadcrumbs title="Tables" breadcrumbItem="News List" />
                <TableContainer
                    columns={columns}
                    data={loading ? [] : newsData}
                    isGlobalFilter={true}
                    isPagination={true}
                    SearchPlaceholder="Search news..."
                    pagination="pagination"
                    paginationWrapper="dataTables_paginate paging_simple_numbers"
                    tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
                />
            </div>
        </div>
    );
};

export default DatatableTables;
