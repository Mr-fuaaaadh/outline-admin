import React from "react";
import { Container, Row, Col } from "reactstrap";

const Footer = () => {
  return (
    <footer className="footer bg-light py-3 border-top">
      <Container fluid>
        <Row>
          <Col md={6} className="text-center text-md-start">
            © {new Date().getFullYear()} Outline Kerala.
          </Col>
          <Col md={6} className="text-center text-md-end">
            Design & Developed by Rcube Ventures & Infrastructures PVT Ltd.
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
