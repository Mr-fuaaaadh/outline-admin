import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";
import classnames from "classnames";
import SimpleBar from "simplebar-react";
import axios from "axios";

const Posts = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [recentNews, setRecentNews] = useState([]);
  const [popularNews, setPopularNews] = useState([]);
  const [visibleRecent, setVisibleRecent] = useState(5);
  const [visiblePopular, setVisiblePopular] = useState(5);

  const toggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    axios.defaults.headers.common["Content-Type"] = "application/json";
    axios.defaults.headers.common["Accept"] = "application/json";

    // Fetch all news and comments
    Promise.all([
      axios.get("https://backend.outlinekerala.com/admin_app/api/news/create/"),
      axios.get("https://backend.outlinekerala.com/admin_app/api/comments/")
    ]).then(([newsRes, commentsRes]) => {
      const newsList = newsRes.data;
      const comments = commentsRes.data;
      // Recent: sort by publish_date descending
      const sortedRecent = [...newsList].sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));
      setRecentNews(sortedRecent);
      // Popular: sort by comment count only
      const newsWithCounts = newsList.map(news => {
        // Count comments for this news
        const commentCount = comments.filter(c => c.news === news.id).length;
        return {
          ...news,
          commentCount,
        };
      });
      const sortedPopular = newsWithCounts.sort((a, b) => b.commentCount - a.commentCount).slice(0, 5);
      setPopularNews(sortedPopular);
    }).catch(() => {
      setRecentNews([]);
      setPopularNews([]);
    });
  }, []);

  const handleLoadMoreRecent = () => setVisibleRecent(count => count + 5);
  const handleLoadMorePopular = () => setVisiblePopular(count => count + 5);

  return (
    <React.Fragment>
      <Col xl={6} lg={6}>
        <Card>
          <CardHeader className="bg-transparent border-bottom">
            <div className="d-flex flex-wrap">
              <div className="me-2">
                <h5 className="card-title mt-1 mb-0">Posts</h5>
              </div>
              <ul className="nav nav-tabs nav-tabs-custom card-header-tabs ms-auto" role="tablist">
                <NavItem>
                  <NavLink to="#" className={classnames({ active: activeTab === "1" })} onClick={() => { toggle("1") }}>Recent</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink className={classnames({ active: activeTab === "2" })} onClick={() => { toggle("2") }}>Popular</NavLink>
                </NavItem>
              </ul>
            </div>
          </CardHeader>

          <CardBody>
            <SimpleBar style={{ maxHeight: "295px" }}>
              <div>
                <TabContent activeTab={activeTab}>
                  <TabPane className="show" tabId="1">
                    <ul className="list-group list-group-flush">
                      {(recentNews || []).slice(0, visibleRecent).map((item, index) => (
                        <li className="list-group-item py-3" key={index}>
                          <div className="d-flex">
                            <div className="me-3">
                              <img src={item.image ? `https://backend.outlinekerala.com${item.image}` : ''} alt="" className="avatar-md h-auto d-block rounded" />
                            </div>
                            <div className="align-self-center overflow-hidden me-auto">
                              <div>
                                <h5 className="font-size-14 text-truncate">
                                  <Link to="#" className="text-dark">{item.title}</Link>
                                </h5>
                                <p className="text-muted mb-0">{item.publish_date ? new Date(item.publish_date).toLocaleDateString('en-GB') : ''}</p>
                              </div>
                            </div>
                            <UncontrolledDropdown className="ms-2">
                              <DropdownToggle tag="a" className="text-muted font-size-14" color="white" type="button">
                                <i className="mdi mdi-dots-horizontal"></i>
                              </DropdownToggle>
                              <DropdownMenu className="dropdown-menu-end">
                                <Link className="dropdown-item" to="#">Action</Link>
                                <Link className="dropdown-item" to="#">Another action</Link>
                                <Link className="dropdown-item" to="#">Something else</Link>
                              </DropdownMenu>
                            </UncontrolledDropdown>
                          </div>
                        </li>
                      ))}
                    </ul>
                   {visibleRecent < recentNews.length && (
                     <div className="text-center mt-3">
                       <button onClick={handleLoadMoreRecent} className="btn btn-primary btn-sm">
                         Load More
                       </button>
                     </div>
                   )}
                  </TabPane>

                  <TabPane className="show" tabId="2">
                    <ul className="list-group list-group-flush">
                      {(popularNews || []).slice(0, visiblePopular).map((item, index) => (
                        <li className="list-group-item py-3" key={index}>
                          <div className="d-flex">
                            <div className="me-3">
                              <img src={item.image ? `https://backend.outlinekerala.com${item.image}` : ''} alt="" className="avatar-md h-auto d-block rounded" />
                            </div>
                            <div className="align-self-center overflow-hidden me-auto">
                              <div>
                                <h5 className="font-size-14 text-truncate">
                                  <Link to="#" className="text-dark">{item.title}</Link>
                                </h5>
                                <p className="text-muted mb-0">{item.publish_date ? new Date(item.publish_date).toLocaleDateString('en-GB') : ''}</p>
                                <span className="badge bg-secondary">Comments: {item.commentCount}</span>
                              </div>
                            </div>
                            <UncontrolledDropdown className="ms-2">
                              <DropdownToggle tag="a" className="text-muted font-size-14" color="white" type="button">
                                <i className="mdi mdi-dots-horizontal"></i>
                              </DropdownToggle>
                              <DropdownMenu className="dropdown-menu-end">
                                <Link className="dropdown-item" to="#">Action</Link>
                                <Link className="dropdown-item" to="#">Another action</Link>
                                <Link className="dropdown-item" to="#">Something else</Link>
                              </DropdownMenu>
                            </UncontrolledDropdown>
                          </div>
                        </li>
                      ))}
                    </ul>
                   {visiblePopular < popularNews.length && (
                     <div className="text-center mt-3">
                       <button onClick={handleLoadMorePopular} className="btn btn-primary btn-sm">
                         Load More
                       </button>
                     </div>
                   )}
                  </TabPane>
                </TabContent>
              </div>
            </SimpleBar>
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  );
}

export default Posts;
