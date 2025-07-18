import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { Card, CardBody, Col, Row } from "reactstrap";
import ReactApexChart from "react-apexcharts";
import getChartColorsArray from "../../components/Common/ChartsDynamicColor";
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from "reselect";
import { dashboardBlogVisitorData } from '../../store/actions';
import { blogStatsData } from "../../common/data";
import axios from "axios";

const CardUser = ({ dataColors }) => {
  const apexCardUserChartColors = getChartColorsArray(dataColors);
  const dispatch = useDispatch();

  // News stats state
  const [totalArticles, setTotalArticles] = useState(0);
  const [totalAuthors, setTotalAuthors] = useState(0);
  const [totalComments, setTotalComments] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    axios.defaults.headers.common["Content-Type"] = "application/json";
    axios.defaults.headers.common["Accept"] = "application/json";

    // Fetch total news articles
    axios.get("https://backend.outlinekerala.com/admin_app/api/news/create/")
      .then(res => setTotalArticles(res.data.length))
      .catch(() => setTotalArticles(0));

    // Fetch total authors
    axios.get("https://backend.outlinekerala.com/admin_app/api/users/")
      .then(res => setTotalAuthors(res.data.length))
      .catch(() => setTotalAuthors(0));

    // Fetch total comments
    axios.get("https://backend.outlinekerala.com/admin_app/api/comments/")
      .then(res => setTotalComments(res.data.length))
      .catch(() => setTotalComments(0));
  }, []);

  useEffect(() => {
    dispatch(dashboardBlogVisitorData(1));
  }, [dispatch]);

  const DashboardblogProperties = createSelector(
    (state) => state.DashboardBlog,
    (dashboardBlog) => ({
      visitor: dashboardBlog.visitor
    })
  );

  const { visitor } = useSelector(DashboardblogProperties);
  const visitors = visitor[0] || [];
  const [activeTab, setActiveTab] = useState(1);

  const handleChangeChartData = (id) => {
    setActiveTab(id);
    dispatch(dashboardBlogVisitorData(id))
  }

  const series = [
    {
      name: "Current",
      data: visitors?.data?.CurrentData || [],
    },
    {
      name: "Previous",
      data: visitors?.data?.PreviousData || [],
    },
  ];

  const options = {
    chart: {
      height: 350,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    colors: apexCardUserChartColors,
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100, 100, 100],
      },
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    },
    markers: {
      size: 3,
      strokeWidth: 3,
      hover: {
        size: 4,
        sizeOffset: 2,
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
  };

  return (
    <React.Fragment>
      <Col xl={12}>
        <Row>
          <Col lg={4}>
            <Card className="blog-stats-wid">
              <CardBody>
                <div className="d-flex flex-wrap">
                  <div className="me-3">
                    <p className="text-muted mb-2">Total News Articles</p>
                    <h5 className="mb-0">{totalArticles}</h5>
                  </div>
                  <div className="avatar-sm ms-auto">
                    <div className="avatar-title bg-light rounded-circle text-primary font-size-20">
                      <i className="mdi mdi-newspaper"></i>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg={4}>
            <Card className="blog-stats-wid">
              <CardBody>
                <div className="d-flex flex-wrap">
                  <div className="me-3">
                    <p className="text-muted mb-2">Total Users</p>
                    <h5 className="mb-0">{totalAuthors}</h5>
                  </div>
                  <div className="avatar-sm ms-auto">
                    <div className="avatar-title bg-light rounded-circle text-primary font-size-20">
                      <i className="mdi mdi-account-multiple"></i>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg={4}>
            <Card className="blog-stats-wid">
              <CardBody>
                <div className="d-flex flex-wrap">
                  <div className="me-3">
                    <p className="text-muted mb-2">Total Comments</p>
                    <h5 className="mb-0">{totalComments}</h5>
                  </div>
                  <div className="avatar-sm ms-auto">
                    <div className="avatar-title bg-light rounded-circle text-primary font-size-20">
                      <i className="mdi mdi-comment-multiple-outline"></i>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Visitor Chart Section (unchanged) */}
        <Card>
          <CardBody>
            <div className="d-flex flex-wrap">
              <h5 className="card-title me-2">Visitors</h5>
              <div className="ms-auto">
                <div className="toolbar d-flex flex-wrap gap-2 text-end">
                  <button type="button" className={`btn btn-light btn-sm ${activeTab === 1 && "active"}`} onClick={() => handleChangeChartData(1)}>
                    ALL
                  </button>
                  <button type="button" className={`btn btn-light btn-sm ${activeTab === 2 && "active"}`} onClick={() => handleChangeChartData(2)}>
                    1M
                  </button>
                  <button type="button" className={`btn btn-light btn-sm ${activeTab === 3 && "active"}`} onClick={() => handleChangeChartData(3)}>
                    6M
                  </button>
                  <button type="button" className={`btn btn-light btn-sm ${activeTab === 4 && "active"}`} onClick={() => handleChangeChartData(4)}>
                    1Y
                  </button>
                </div>
              </div>
            </div>

            <Row className="text-center">
              <Col lg={4}>
                <div className="mt-4">
                  <p className="text-muted mb-1">Today</p>
                  <h5>{visitors.today}</h5>
                </div>
              </Col>

              <Col lg={4}>
                <div className="mt-4">
                  <p className="text-muted mb-1">This Month</p>
                  <h5>
                    {visitors.thisMonth}
                    <span className="text-success font-size-13"> 0.2 % <i className="mdi mdi-arrow-up ms-1"></i></span>
                  </h5>
                </div>
              </Col>

              <Col lg={4}>
                <div className="mt-4">
                  <p className="text-muted mb-1">This Year</p>
                  <h5>
                    {visitors.thisYear}
                    <span className="text-success font-size-13"> 0.1 % <i className="mdi mdi-arrow-up ms-1"></i>
                    </span>
                  </h5>
                </div>
              </Col>
            </Row>

            <hr className="mb-4" />

            <div id="area-chart" dir="ltr">
              <ReactApexChart options={options} series={series} type="area" height={350} className="apex-charts" />
            </div>
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  );
};

CardUser.propTypes = {
  options: PropTypes.any,
  series: PropTypes.any
};

export default CardUser;