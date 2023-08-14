import { useState } from "react";
import { Container, Row, Col, Card, ListGroup } from "react-bootstrap";
import { useCallback, useEffect } from "react";

import { ApiCall } from "../../../api/apiCall";
import SpinnerModal from "../../../Components/UI/SpinnerModal";

import styles from "./SupervisionProjects.module.css";

function SupervisionProjects({ userId }) {
  const [isLoading, setIsLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [allProjects, setAllProjects] = useState([]);

  const loadPage = useCallback(async () => {
    const response = await ApiCall({
      params: {
        userId,
      },
      route: `teacher/supervision-projects`,
      verb: "get",
      token: "jwt_token",
      baseurl: true,
    });

    if (response && response.status === 200) {
      setIsLoading(false);
      setClasses(response.response.allClasses);
      setAllProjects(response.response.allProjects);
    } else {
      console.log(response);
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  return (
    <>
      {!isLoading && (
        <Container fluid>
          <Row>
            <Col sm={8}>
              {allProjects.map((data, index) => {
                console.log(data);
                return (
                  <Project
                    key={index}
                    projects={data.classProjects}
                    className={data.className}
                  />
                );
              })}
            </Col>
            <Col sm={4}>
              <div className={styles.classesCard}>
                <Card.Title>Class Under Supervision</Card.Title>
                <ListGroup className={styles.classesList}>
                  {classes.map((className) => {
                    return (
                      <ListGroup.Item
                        className={styles.listItem}
                        key={className.id}
                      >
                        {className.name}
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              </div>
            </Col>
          </Row>
        </Container>
      )}
      {isLoading && <SpinnerModal />}
    </>
  );
}

function Project({ projects, className }) {
  console.log(projects, className);
  const showProjects = projects.map((project, index) => {
    return (
      <Col key={index}>
        <Card className={styles.projectCard}>
          <Card.Body>
            <Card.Title className={styles.projectName}>
              {project.title}
            </Card.Title>
            <span className={styles.members}>{project.members} Members</span>
            <p className={styles.status}>{project.status}</p>
            <p
              style={{
                marginTop: "10px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {project.description}
            </p>
          </Card.Body>
        </Card>
      </Col>
    );
  });

  return (
    <div className={styles.projectsList}>
      <h2 className={styles.heading}>{className} Projects</h2>
      <Row>{showProjects}</Row>
      <hr />
    </div>
  );
}

export default SupervisionProjects;
