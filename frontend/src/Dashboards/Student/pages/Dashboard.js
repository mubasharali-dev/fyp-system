import React, { useState, useEffect, Fragment } from "react";
import { Card, Col, Row, Container } from "react-bootstrap";

import { ApiCall } from "../../../api/apiCall";

import SpinnerModal from "../../../Components/UI/SpinnerModal";
import NoticeBoardComponent from "../../../Components/NoticeBoards/NoticeBoardComponent";
import styles from "./ProjectManagementPage.module.css";

const Dashboard = ({ userId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [myTodoList, setMyTodoList] = useState([]);
  const [notices, setNotices] = useState([]);

  let totalTasks, tasksAssignedToMe, completedTasks, lateTasks, completedByMe;
  useEffect(() => {
    const loadPage = async () => {
      const response = await ApiCall({
        params: { studentId: userId },
        route: `student/dashboard`,
        verb: "get",
        token: "jwt_token",
        baseurl: true,
      });

      if (response && response.status === 200) {
        setMyTodoList(response?.response?.myTodoList || []);
        setNotices(response?.response?.notices || []);
        setIsLoading(false);
      } else {
        console.log(response);
        setIsLoading(false);
      }
    };
    loadPage();
  }, [userId]);

  return (
    <Fragment>
      {!isLoading && (
        <div className={styles.flexHorizontal}>
          <Container>
            <h4>My Todo List</h4>
            <Row className="my-3">
              {!myTodoList.length && (
                <p>Hurray! You don't have any work left.</p>
              )}
              {myTodoList.map((todo) => (
                <Col key={todo.id} lg={4} className="mb-3">
                  <Card className={styles.card}>
                    <Card.Body>
                      <Card.Title className={styles.cardTitle}>
                        {todo.title}
                      </Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        {todo.phase}
                      </Card.Subtitle>
                      <Card.Text className={styles.cardText}>
                        <strong>Deadline:</strong>{" "}
                        {new Date(todo.deadline).toISOString().substring(0, 10)}
                        <br />
                        <strong>Status:</strong> {todo.status}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
          <NoticeBoardComponent isAdmin={false} notices={notices} />
        </div>
      )}
      {isLoading && <SpinnerModal />}
    </Fragment>
  );
};

export default Dashboard;
