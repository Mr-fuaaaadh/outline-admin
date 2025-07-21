// src/components/filter/DatatableTables.jsx
import React, { useMemo, useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// React Bootstrap imports (make sure you installed react-bootstrap and bootstrap)
import { Modal, Button, Form } from "react-bootstrap";

// Import components
import Breadcrumbs from "../../components/Common/Breadcrumb";
import TableContainer from "../../components/Common/TableContainer";

const DatatableTables = () => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "",
    password: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.warn("No auth token found. Redirecting to login...");
      navigate("/login");
      return;
    }
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    axios.defaults.headers.common["Content-Type"] = "application/json";
    axios.defaults.headers.common["Accept"] = "application/json";

    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://backend.outlinekerala.com/admin_app/api/users/"
        );
        const users = response.data.map((user) => ({
          name: user.username || "N/A",
          position: user.role || "N/A",
          email: user.email || "N/A",
          active: user.is_active ? "Yes" : "No",
          startDate: user.date_joined
            ? new Date(user.date_joined).toLocaleDateString("en-GB")
            : "N/A",
          salary: "$0",
        }));
        setUserData(users);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.warn("Invalid or expired token. Redirecting to login...");
          localStorage.removeItem("authToken");
          navigate("/login");
        } else {
          console.error(
            "Error fetching user data:",
            error.response ? error.response.data : error
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const columns = useMemo(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Position",
        accessorKey: "position",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Email",
        accessorKey: "email",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Active",
        accessorKey: "active",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Start date",
        accessorKey: "startDate",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Salary",
        accessorKey: "salary",
        enableColumnFilter: false,
        enableSorting: true,
      },
    ],
    []
  );

  // Handle form input change
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit to add new customer
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    try {
      await axios.post(
        "https://backend.outlinekerala.com/admin_app/api/users/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Customer added successfully!");
      setShowModal(false);
      setFormData({ username: "", email: "", role: "", password: "" });

      // Refresh user list
      setLoading(true);
      const response = await axios.get(
        "https://backend.outlinekerala.com/admin_app/api/users/"
      );
      const users = response.data.map((user) => ({
        name: user.username || "N/A",
        position: user.role || "N/A",
        email: user.email || "N/A",
        active: user.is_active ? "Yes" : "No",
        startDate: user.date_joined
          ? new Date(user.date_joined).toLocaleDateString("en-GB")
          : "N/A",
        salary: "$0",
      }));
      setUserData(users);
      setLoading(false);
    } catch (error) {
      alert("Failed to add customer. Please check the console for details.");
      console.error("Add customer error:", error.response || error);
    }
  };

  document.title = "Customers | Outline Kerala";

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="Tables" breadcrumbItem="Users" />

        {/* Add Customer Button */}
        <div style={{ marginBottom: "15px" }}>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Add Customer
          </Button>
        </div>

        {/* User Data Table */}
        <TableContainer
          columns={columns}
          data={loading ? [] : userData}
          isGlobalFilter={true}
          isPagination={true}
          SearchPlaceholder="Search users..."
          pagination="pagination"
          paginationWrapper="dataTables_paginate paging_simple_numbers"
          tableClass="table-bordered table-nowrap dt-responsive nowrap w-100 dataTable no-footer dtr-inline"
        />

        {/* Add Customer Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Customer</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter username"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formRole">
                <Form.Label>Role</Form.Label>
                <Form.Control
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="Enter role (e.g., admin, user)"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100">
                Submit
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

DatatableTables.propTypes = {
  preGlobalFilteredRows: PropTypes.any,
};

export default DatatableTables;
