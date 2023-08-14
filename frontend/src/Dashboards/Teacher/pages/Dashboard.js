import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { AiOutlineEdit } from "react-icons/ai";
import { toast } from "react-toastify";

import { ApiCall } from "../../../api/apiCall";

import NoticeBoardComponent from "../../../Components/NoticeBoards/NoticeBoardComponent";
import NotificationsComponent from "../../../Components/Notifications/NotificationsComponent";

import styles from "./Dashboard.module.css";

const Dashboard = (props) => {
  const [isClicked, setIsClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [classesSupervision, setClassesSupervision] = useState(0);
  const [classesExamination, setClassesExamination] = useState(0);
  const [projectsSupervision, setProjectsSupervision] = useState(0);
  const [projectsSupervisionLimit, setProjectsSupervisionLimit] = useState(0);
  const [projectsExamination, setProjectsExamination] = useState(0);
  const [notices, setNotices] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const loadPage = useCallback(async () => {
    const response = await ApiCall({
      params: {
        userId: props.userId,
      },
      route: `teacher/dashboard`,
      verb: "get",
      token: "jwt_token",
      baseurl: true,
    });

    if (response && response.status === 200) {
      setClassesExamination(response.response.classesExamination);
      setClassesSupervision(response.response.classesSupervision);
      setProjectsExamination(response.response.projectsExamination);
      setProjectsSupervision(response.response.projectsSupervision);
      setProjectsSupervisionLimit(response.response.projectsSupervisionLimit);
      setNotices(response.response.notices);
      setNotifications(response.response.notifications);
      setIsLoading(false);
    } else {
      console.log(response);
      setIsLoading(false);
    }
  }, [props.userId]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const handleEditProjectsSupervisionLimit = () => {
    setIsClicked(true);
  };

  const formSubmitHandler = async (e) => {
    e.preventDefault();
    setProjectsSupervisionLimit(e.target["0"].value);

    const response = await ApiCall({
      params: {
        limit: e.target["0"].value,
        userId: props.userId,
      },
      route: `teacher/dashboard/projects-limit`,
      verb: "patch",
      token: "jwt_token",
      baseurl: true,
    });
    setIsLoading(true);
    if (response.status === 200) {
      toast.success(`${response.response.message}`);
      loadPage();
    } else {
      toast.error(`${response.response.message}`);
    }

    setIsClicked(false);
  };

  return (
    <div>
      {!isLoading && (
        <Container className="mt-3">
          <Row className={styles.container}>
            <Col>
              <Row className={`mt-1 ${styles.row}`}>
                <Col>
                  <Card className={styles.card}>
                    <Card.Body>
                      <Card.Title>Classes for Supervision</Card.Title>
                      <Card.Text>{classesSupervision}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col>
                  <Card className={styles.card}>
                    <Card.Body>
                      <Card.Title>Classes for Examination</Card.Title>
                      <Card.Text>{classesExamination}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              <Row className={`mt-3 ${styles.row}`}>
                <Col>
                  <Card className={styles.card}>
                    <Card.Body>
                      <Card.Title>Projects for Supervision</Card.Title>
                      <Card.Text>{projectsSupervision}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col>
                  <Card className={styles.card}>
                    <Card.Body>
                      <Card.Title>Projects for Examination</Card.Title>
                      <Card.Text>{projectsExamination}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              <Row className={`mt-3  ${styles.row}`}>
                <Col>
                  <Card className={styles.card}>
                    <Card.Body>
                      <Card.Title>Supervision Limit</Card.Title>
                      <Card.Text className={styles.limit}>
                        {projectsSupervisionLimit}
                        {isClicked && (
                          <Form
                            style={{
                              display: "flex",
                              gap: "30px",
                            }}
                            onSubmit={formSubmitHandler}
                          >
                            <Form.Control
                              defaultValue={projectsSupervisionLimit}
                              style={{ maxWidth: "60px" }}
                              min={0}
                            ></Form.Control>
                            <Button type="submit">Submit</Button>
                          </Form>
                        )}
                        {!isClicked && (
                          <Button
                            variant="link"
                            onClick={handleEditProjectsSupervisionLimit}
                          >
                            <AiOutlineEdit />
                          </Button>
                        )}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              <Row className={`mt-5  ${styles.row}`}>
                <NotificationsComponent notifications={notifications} />
              </Row>
            </Col>
            <Col>
              <NoticeBoardComponent
                isAdmin={false}
                reciever={false}
                notices={notices}
              />
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
};

export default Dashboard;
