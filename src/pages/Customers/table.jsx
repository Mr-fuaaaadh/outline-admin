// src/components/filter/DatatableTables.jsx
import React, { useMemo, useEffect, useState } from "react";
import PropTypes from 'prop-types';
import axios from 'axios';
import { useNavigate } from "react-router-dom"; // ✅ for redirect

// Import components
import Breadcrumbs from '../../components/Common/Breadcrumb';
import TableContainer from '../../components/Common/TableContainer';

const DatatableTables = () => {
    const [userData, setUserData] = useState([]);
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
        

        fetchData();
    }, []);

    // Fetch data with Axios
    useEffect(() => {
        axios.get("https://backend.outlinekerala.com/admin_app/api/users/")
            .then(response => {
                const users = response.data.map(user => ({
                    name: user.username || 'N/A',
                    position: user.role || 'N/A',
                    email: user.email || 'N/A',
                    active: user.is_active ? 'Yes' : 'No',
                    startDate: user.date_joined
                        ? new Date(user.date_joined).toLocaleDateString('en-GB')
                        : 'N/A',
                    salary: "$0" // Replace if you have real salary data
                }));
                setUserData(users);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching user data:", error);
                setLoading(false);
            });
    }, []);

    const columns = useMemo(() => [
        {
            header: 'Name',
            accessorKey: 'name',
            enableColumnFilter: false,
            enableSorting: true,
        },
        {
            header: 'Position',
            accessorKey: 'position',
            enableColumnFilter: false,
            enableSorting: true,
        },
        {
            header: 'Email',
            accessorKey: 'email',
            enableColumnFilter: false,
            enableSorting: true,
        },
        {
            header: 'Active',
            accessorKey: 'active',  // <-- Corrected accessor key
            enableColumnFilter: false,
            enableSorting: true,
        },
        {
            header: 'Start date',
            accessorKey: 'startDate',
            enableColumnFilter: false,
            enableSorting: true,
        },
        {
            header: 'Salary',
            accessorKey: 'salary',
            enableColumnFilter: false,
            enableSorting: true,
        },
    ], []);

    document.title = "Data Tables | Skote - Vite React Admin & Dashboard Template";

    return (
        <div className="page-content">
            <div className="container-fluid">
                <Breadcrumbs title="Tables" breadcrumbItem="Data Tables" />
                <TableContainer
                    columns={columns}
                    data={loading ? [] : userData}
                    isGlobalFilter={true}
                    isPagination={true}
                    SearchPlaceholder="Search users..."
                    pagination="pagination"
                    paginationWrapper='dataTables_paginate paging_simple_numbers'
                    tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
                />
            </div>
        </div>
    );
};

DatatableTables.propTypes = {
    preGlobalFilteredRows: PropTypes.any,
};

export default DatatableTables;
