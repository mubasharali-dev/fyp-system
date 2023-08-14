import React, { useState, useEffect, useRef, Fragment } from "react";
import { MdOutlineDeleteForever } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { toast } from "react-toastify";

import { ApiCall } from "../../../api/apiCall";

import CreateTaskForm from "../../../Components/Forms/CreateTaskForm";
import SpinnerModal from "../../../Components/UI/SpinnerModal";
import styles from "./ProjectManagementPage.module.css";

const ProjectManagement = (props) => {
  const [myTodoList, setMyTodoList] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeader, setIsLeader] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { userId } = props;

  const errorRef = useRef(null);
  useEffect(() => {
    const loadPage = async () => {
      const response = await ApiCall({
        params: { studentId: userId },
        route: `student/tasks`,
        verb: "get",
        token: "jwt_token",
        baseurl: true,
      });

      if (response && response.status === 200) {
        setIsLoading(false);
        setMyTodoList(response.response.myTodoList);
        setCompletedTasks(response.response.myCompletedTasks);
        setAllTasks(response.response.allTasks);
        setIsLeader(response.response.isLeader);
        errorRef.current = null;
      } else {
        console.log(response);
        errorRef.current = response.response.message;
        setIsLoading(false);
      }
    };
    loadPage();
  }, [userId]);

  const handleCompleteTask = async (id) => {
    const response = await ApiCall({
      params: { studentId: userId, endDate: new Date() },
      route: `student/tasks/${id}/complete`,
      verb: "patch",
      token: "jwt_token",
      baseurl: true,
    });

    if (response && response.status === 200) {
      toast.success(`${response.response.message}`);

      const completedTask = myTodoList.find((task) => task.id === id);
      completedTask.endDate = new Date();
      setCompletedTasks((prevState) => [...prevState, completedTask]);

      const filteredTodos = myTodoList.filter((task) => task.id !== id);
      setMyTodoList(filteredTodos);

      const filterdTasks = allTasks.filter((task) => task.id !== id);
      setAllTasks([...filterdTasks, completedTask]);
    } else {
      console.log(response);
      toast.error(`${response.response.message}`);
    }
  };

  const handleDeleteTask = async (id) => {
    allTasks.filter((task) => task.id !== id);

    const response = await ApiCall({
      params: { studentId: userId },
      route: `student/tasks/${id}/delete`,
      verb: "delete",
      token: "jwt_token",
      baseurl: true,
    });

    if (response && response.status === 200) {
      toast.success(`${response.response.message}`);

      const filterdTasks = allTasks.filter((task) => task.id !== id);
      setAllTasks(filterdTasks);
      const filteredTodos = myTodoList.filter((task) => task.id !== id);
      setMyTodoList(filteredTodos);
    } else {
      console.log(response);
      toast.error(`${response.response.message}`);
    }
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <Fragment>
      {!isLoading && (
        <Container fluid className={styles.projectManagementPage}>
          {isLeader && (
            <Button onClick={() => setShowModal(true)}>Add a Task</Button>
          )}
          <h4>My Todo List</h4>
          <Row className="my-3">
            {!myTodoList.length && <p>Hurray! You don't have any work left.</p>}
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
                    <FaCheckCircle
                      className={styles.deleteBtn}
                      onClick={() => handleCompleteTask(todo.id)}
                    />
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <hr />
          <h4>My Completed Tasks</h4>
          <Row className="my-3">
            {!completedTasks.length && <p>There are not any tasks to show</p>}
            {completedTasks.map((task, index) => (
              <Col key={index} lg={4} className="mb-3">
                <Card className={styles.card}>
                  <Card.Body>
                    <Card.Title className={styles.cardTitle}>
                      {task.title}
                    </Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      {task.phase}
                    </Card.Subtitle>
                    <Card.Text className={styles.cardText}>
                      <strong>Deadline: </strong>
                      {new Date(task.deadline).toISOString().substring(0, 10)}
                    </Card.Text>
                    <Card.Text className={styles.cardText}>
                      <strong>End Date:</strong>
                      {new Date(task.endDate).toISOString().substring(0, 10)}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <hr />
          <h4>All Tasks</h4>
          <Row className="my-3">
            {!allTasks.length && <p>There are not any tasks to show</p>}
            {allTasks.map((task, index) => (
              <Col key={index} lg={4} className="mb-3">
                <Card className={styles.cardCompleted}>
                  <Card.Body>
                    <Card.Title className={styles.cardTitle}>
                      {task.title}
                    </Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      {task.phase}
                    </Card.Subtitle>
                    <Card.Text className={styles.cardText}>
                      <strong>Deadline: </strong>
                      {new Date(task.deadline).toISOString().substring(0, 10)}
                    </Card.Text>
                    {!task.endDate && (
                      <Card.Text className={styles.cardText}>
                        <strong>Status:</strong> {task.status}
                      </Card.Text>
                    )}
                    {task.endDate && (
                      <Card.Text className={styles.cardText}>
                        <strong>End Date:</strong>{" "}
                        {new Date(task.endDate).toISOString().substring(0, 10)}
                      </Card.Text>
                    )}
                    <Card.Text className={styles.cardText}>
                      <strong>To: </strong>
                      {task.assignedToName}
                    </Card.Text>
                    {!task.endDate && isLeader && (
                      <MdOutlineDeleteForever
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteTask(task.id)}
                      />
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <CreateTaskForm
            userId={userId}
            show={showModal}
            handleClose={handleClose}
          />
        </Container>
      )}
      {isLoading && <SpinnerModal />}
    </Fragment>
  );
};

export default ProjectManagement;
