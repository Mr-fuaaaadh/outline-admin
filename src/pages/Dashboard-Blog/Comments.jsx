import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  Col,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
import SimpleBar from "simplebar-react";
import axios from "axios";

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    axios.defaults.headers.common["Content-Type"] = "application/json";
    axios.defaults.headers.common["Accept"] = "application/json";

    axios.get("https://backend.outlinekerala.com/admin_app/api/comments/")
      .then(res => setComments(res.data))
      .catch(() => setComments([]));
  }, []);

  const handleLoadMore = () => {
    setVisibleCount(count => count + 10);
  };

  return (
    <React.Fragment>
      <Col xl={6} lg={6}>
        <Card>
          <CardBody>
            <div className="d-flex flex-wrap align-items-start">
              <div className="me-2">
                <h5 className="card-title mb-3">Comments</h5>
              </div>
              <UncontrolledDropdown className="ms-auto">
                <DropdownToggle className="text-muted font-size-16" color="white" tag="a">
                  <i className="mdi mdi-dots-horizontal"></i>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end" direction="right">
                  <Link className="dropdown-item" to="#">Action</Link>
                  <Link className="dropdown-item" to="#">Another action</Link>
                  <Link className="dropdown-item" to="#">Something else</Link>
                  <div className="dropdown-divider"></div>
                  <Link className="dropdown-item" to="#">Separated link</Link>
                </DropdownMenu>
              </UncontrolledDropdown>
            </div>
            <SimpleBar style={{ maxHeight: "300px" }}>
              <ul className="list-group list-group-flush">
                {(comments || []).slice(0, visibleCount).map((comment, index) => (
                  <li className="list-group-item py-3" key={index}>
                    <div className="d-flex">
                      <div className="flex-shrink-0 me-3">
                        <div className="avatar-xs">
                          <div className="avatar-title rounded-circle bg-light text-primary">
                            <i className="bx bxs-user"></i>
                          </div>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="font-size-14 mb-1">
                          {comment.user?.name || comment.user?.username || comment.username || 'User'}
                          <small className="text-muted float-end">{comment.created_at ? new Date(comment.created_at).toLocaleString() : ''}</small>
                        </h5>
                        <p className="text-muted">{comment.content}</p>
                        {/* <div>
                          <Link to="#" className="text-success"><i className="mdi mdi-reply"></i> Reply</Link>
                        </div> */}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </SimpleBar>
            {visibleCount < comments.length && (
              <div className="text-center mt-3">
                <button onClick={handleLoadMore} className="btn btn-primary btn-sm">
                  Load More
                </button>
              </div>
            )}
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  );
}

export default Comments;
