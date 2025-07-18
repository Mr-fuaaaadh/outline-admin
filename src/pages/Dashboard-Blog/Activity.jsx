import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  Card,
  CardBody,
  Col,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap"
import SimpleBar from "simplebar-react"
import axios from "axios"

const Activity = () => {
  const [activity, setActivity] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    axios.defaults.headers.common["Content-Type"] = "application/json";
    axios.defaults.headers.common["Accept"] = "application/json";

    Promise.all([
      axios.get("https://backend.outlinekerala.com/admin_app/api/news/create/"),
      axios.get("https://backend.outlinekerala.com/admin_app/api/comments/"),
      axios.get("https://backend.outlinekerala.com/admin_app/api/users/")
    ]).then(([newsRes, commentsRes, usersRes]) => {
      const news = newsRes.data.map(n => ({
        type: "News Published",
        date: n.publish_date || n.created_at,
        title: n.title,
        text: "was published.",
        link: null,
        linkText: null,
        active: false
      }));
      const comments = commentsRes.data.map(c => ({
        type: "Comment Added",
        date: c.created_at,
        title: c.user?.name || c.user?.username || c.username || 'User',
        text: `commented: \"${c.content?.slice(0, 30)}${c.content && c.content.length > 30 ? '...' : ''}\"`,
        link: null,
        linkText: null,
        active: false
      }));
      const users = usersRes.data.map(u => ({
        type: "User Registered",
        date: u.date_joined,
        title: u.name || u.username || 'User',
        text: "registered.",
        link: null,
        linkText: null,
        active: false
      }));
      // Combine and sort by date descending
      const all = [...news, ...comments, ...users].filter(e => e.date).sort((a, b) => new Date(b.date) - new Date(a.date));
      // Mark the most recent as active
      if (all.length > 0) all[0].active = true;
      setActivity(all);
    }).catch(() => setActivity([]));
  }, []);

  const handleViewMore = () => {
    setVisibleCount(count => count + 10);
  };

  return (
    <React.Fragment>
      <Col xl={4}>
        <Card>
          <CardBody>
            <div className="d-flex align-items-start">
              <div className="me-2">
                <h5 className="card-title mb-4">Activity</h5>
              </div>
              <UncontrolledDropdown className="ms-auto">
                <DropdownToggle className="text-muted font-size-16" tag="a" color="white" type="button">
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
            <SimpleBar className="mt-2" style={{ maxHeight: "280px" }}>
              <ul className="verti-timeline list-unstyled">
                {(activity || []).slice(0, visibleCount).map((event, index) => (
                  <li className={`event-list ${event.active ? 'active' : ''}`} key={index}>
                    <div className="event-timeline-dot">
                      <i className={`bx ${event.active ? "bxs" : "bx"}-right-arrow-circle font-size-18 ${event.active && "bx-fade-right"}`}></i>
                    </div>
                    <div className="d-flex">
                      <div className="flex-shrink-0 me-3">
                        <h5 className="font-size-14">{event.date ? new Date(event.date).toLocaleString() : ''} <i className="bx bx-right-arrow-alt font-size-16 text-primary align-middle ms-2"></i></h5>
                      </div>
                      <div className="flex-grow-1">
                        <div>
                          <span className="fw-semibold">[{event.type}]</span> {event.title} {event.text} {event.link && <Link to={event.link}>{event.linkText}</Link>}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </SimpleBar>
            {visibleCount < activity.length && (
              <div className="text-center mt-4">
                <button onClick={handleViewMore} className="btn btn-primary btn-sm">
                  View More <i className="mdi mdi-arrow-right ms-1"></i>
                </button>
              </div>
            )}
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  )
}

export default Activity
