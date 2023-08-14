import { useState, useEffect, Fragment, useRef } from "react";
import { Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";

import { ApiCall } from "../../../api/apiCall";

import StudentComponent from "../../../Components/Students/StudentComponent";
import TeacherComponent from "../../../Components/Teachers/TeacherComponent";

import SpinnerModal from "../../../Components/UI/SpinnerModal";
import CustomCard from "../../../Components/UI/CustomCard";
import Button from "../../../Components/UI/Button";

import classes from "./Project.module.css";

const Project = (props) => {
  const [pageState, setPageState] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const errorRef = useRef(null);
  useEffect(() => {
    const loadPage = async () => {
      const response = await ApiCall({
        params: { studentId: props.userId },
        route: `student/project`,
        verb: "get",
        token: "jwt_token",
        baseurl: true,
      });

      if (response && response.status === 200) {
        setPageState(response.response);
        setIsLoading(false);
        errorRef.current = null;
      } else {
        console.log(response);
        errorRef.current = response.response.message;
        setIsLoading(false);
      }
    };
    loadPage();
  }, [props.userId]);

  const allStudents = pageState.projectMembers ? (
    pageState.projectMembers.map((student) => {
      if (student.hasTopped === true) {
        student.designation = "Group Leader";
      } else {
        student.designation = "Group Member";
      }

      return <StudentComponent key={student.id} student={student} />;
    })
  ) : (
    <p>No students found.</p>
  );

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const errors = {};
    if (!description.trim()) {
      errors.description = "Description is required";
    }
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    const response = await ApiCall({
      params: { description },
      route: `student/project/${pageState.project.id}/edit`,
      verb: "patch",
      token: "jwt_token",
      baseurl: true,
    });
    if (response && response.status === 200) {
      setPageState({
        ...pageState,
        project: { ...pageState.project, description },
      });
      setShowModal(false);
      toast.success(`${response.response.message}`);
    } else {
      toast.error(`${response.response.message}`);
      console.log(response);
    }
  };

  return (
    <Fragment>
      {!isLoading && (
        <div className={classes.page}>
          {errorRef.current ? (
            <p>{errorRef.current}</p>
          ) : (
            <Fragment>
              <CustomCard>
                <div className={classes.project}>
                  <p className={classes.headline}>{pageState.project.title}</p>
                  <div className={classes.items}>
                    <div className={classes.item}>
                      <p>Project ID:</p>
                      <span> {pageState.project.id}</span>
                    </div>
                    <div className={classes.item}>
                      <p>Class:</p>
                      <span> {pageState.project.className}</span>
                    </div>
                  </div>
                  <div className={classes.item}>
                    <p>Project Description:</p>
                    <span>{pageState.project.description}</span>
                  </div>
                  <div className={`${classes.item} ${classes.buttons}`}>
                    <Button onClick={() => setShowModal(true)}>
                      Edit Description
                    </Button>
                  </div>
                </div>
              </CustomCard>
              <h5>Group Members</h5>
              <div className={classes.item}>{allStudents}</div>
              <hr />
              <div className={classes.item}>
                <div className={classes.teacher}>
                  <h5>Supervisor</h5>
                  <TeacherComponent
                    button={false}
                    teacher={pageState.supervisor}
                  />
                </div>
              </div>
              <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Edit Description</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form onSubmit={handleFormSubmit}>
                    <Form.Group controlId="description">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        isInvalid={!!errors.description}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.description}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Button variant="primary" type="submit">
                      Save Changes
                    </Button>
                  </Form>
                </Modal.Body>
              </Modal>
            </Fragment>
          )}
        </div>
      )}
      {isLoading && <SpinnerModal />}
    </Fragment>
  );
};

export default Project;
