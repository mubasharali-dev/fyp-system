import { Container, Row, Col } from "react-bootstrap";
import LoginForm from "../Components/Forms/LoginForm";

import classes from "./Login.module.css";

const Login = () => {
  return (
    <Container fluid>
      <Row>
        <Col>
          <div className={classes.head}>
            <img src="/images/logo.png" alt="university of education logo" />
          </div>
        </Col>
      </Row>
      <Row className={classes.row}>
        <Col>
          <div className={classes.main}>
            <p className={classes.headline}>Welcome to FYPMS</p>
            <p>Final Year Project Management System</p>
            <LoginForm />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
