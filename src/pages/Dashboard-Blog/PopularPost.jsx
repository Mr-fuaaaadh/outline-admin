import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  Card,
  CardBody,
  Col,
  DropdownMenu,
  DropdownToggle,
  Table,
  UncontrolledDropdown,
} from "reactstrap"
import axios from "axios"
import SimpleBar from "simplebar-react"

const PopularPost = () => {
  const [popularPosts, setPopularPosts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    axios.defaults.headers.common["Content-Type"] = "application/json";
    axios.defaults.headers.common["Accept"] = "application/json";

    Promise.all([
      axios.get("https://backend.outlinekerala.com/admin_app/api/news/create/"),
      axios.get("https://backend.outlinekerala.com/admin_app/api/comments/")
    ]).then(([newsRes, commentsRes]) => {
      const newsList = newsRes.data;
      const comments = commentsRes.data;
      // Count comments for each news
      const newsWithCommentCount = newsList.map(news => {
        const commentCount = comments.filter(c => c.news === news.id).length;
        return {
          ...news,
          commentCount,
        };
      });
      // Sort by comment count descending
      const sorted = newsWithCommentCount.sort((a, b) => b.commentCount - a.commentCount).slice(0, 10);
      setPopularPosts(sorted);
    }).catch(() => setPopularPosts([]));
  }, []);

  const handleLoadMore = () => setVisibleCount(count => count + 5);

  return (
    <React.Fragment>
      <Col xl={8}>
        <Card>
          <CardBody>
            <div className="d-flex align-items-start">
              <div className="me-2">
                <h5 className="card-title mb-4">Popular post</h5>
              </div>
              <UncontrolledDropdown className="ms-auto">
                <DropdownToggle className="text-muted font-size-16" tag="a" color="white">
                  <i className="mdi mdi-dots-horizontal"></i>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end">
                  <Link className="dropdown-item" to="#">Action</Link>
                  <Link className="dropdown-item" to="#">Another action</Link>
                  <Link className="dropdown-item" to="#">Something else</Link>
                  <div className="dropdown-divider"></div>
                  <Link className="dropdown-item" to="#">Separated link</Link>
                </DropdownMenu>
              </UncontrolledDropdown>
            </div>

            <div className="table-responsive">
              <SimpleBar style={{ maxHeight: '400px' }}>
                <Table className="align-middle table-nowrap mb-0">
                  <thead>
                    <tr>
                      <th scope="col" colSpan={2}>Post </th>
                      <th scope="col">Comments</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(popularPosts || []).slice(0, visibleCount).map((popularPost, key) => (
                      <tr key={key}>
                        <td style={{ width: "100px" }}>
                          <img src={popularPost.image ? `https://backend.outlinekerala.com${popularPost.image}` : ''} alt="" className="avatar-md h-auto d-block rounded" />
                        </td>
                        <td>
                          <h5 className="font-size-13 text-truncate mb-1">
                            <Link to="#" className="text-dark">{popularPost.title}</Link>
                          </h5>
                          <p className="text-muted mb-0">{popularPost.publish_date ? new Date(popularPost.publish_date).toLocaleDateString('en-GB') : ''}</p>
                        </td>
                        <td>
                          <i className="bx bx-comment-dots align-middle me-1"></i>{popularPost.commentCount}
                        </td>
                        <td>
                          <UncontrolledDropdown className="dropdown">
                            <DropdownToggle className="text-muted font-size-16" tag="a" color="white">
                              <i className="mdi mdi-dots-horizontal"></i>
                            </DropdownToggle>
                            <DropdownMenu className="dropdown-menu-end">
                              <Link className="dropdown-item" to="#">Action</Link>
                              <Link className="dropdown-item" to="#">Another action</Link>
                              <Link className="dropdown-item" to="#">Something else</Link>
                              <div className="dropdown-divider"></div>
                              <Link className="dropdown-item" to="#">Separated link</Link>
                            </DropdownMenu>
                          </UncontrolledDropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </SimpleBar>
              {visibleCount < popularPosts.length && (
                <div className="text-center mt-3">
                  <button onClick={handleLoadMore} className="btn btn-primary btn-sm">
                    Load More
                  </button>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  )
}

export default PopularPost
