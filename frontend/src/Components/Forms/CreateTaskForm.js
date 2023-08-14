import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Col } from "react-bootstrap";
import { useSelector } from "react-redux";

import { toast } from "react-toastify";

import { ApiCall } from "../../api/apiCall";

import classes from "./LoginForm.module.css";

const AddTaskModal = ({ userId, show, handleClose }) => {
  const { token } = useSelector((state) => state.login.input);
  const [students, setStudents] = useState([]);
  const [validated, setValidated] = useState(false);
  const [formState, setFormState] = useState({
    phase: "",
    title: "",
    startDate: "",
    deadline: "",
    assignedToName: "",
    assignedToId: "",
  });

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const response = await ApiCall({
          params: { studentId: userId },
          route: "student/tasks/form-data",
          verb: "get",
          token,
          baseurl: true,
        });
        setStudents(response?.response?.projectMembers ?? []);
        console.log(response.response);
      } catch (error) {
        console.log(error);
      }
    };
    loadFormData();
  }, [userId, token]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleStudentChange = (event) => {
    const assignedToId = event.target.value;
    const assignedToName =
      event.target.options[event.target.selectedIndex].text;
    setFormState((prevData) => ({ ...prevData, assignedToId, assignedToName }));
  };

  const handleSubmit = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      // TODO: Submit the form data to the backend API
      const response = await ApiCall({
        params: { studentId: userId, ...formState },
        route: `student/tasks/new-task`,
        verb: "patch",
        token,
        baseurl: true,
      });

      if (response && response.status === 200) {
        toast.success(`${response.response.message}`);
        console.log("Form submitted:", formState);

        setFormState({
          phase: "",
          title: "",
          startDate: "",
          deadline: "",
          assignedToName: "",
          assignedToId: "",
        });
        handleClose();

        const timeoutId = setTimeout(() => {
          window.location.reload();
        }, 1000);

        // Clear timeout if the component unmounts
        return () => clearTimeout(timeoutId);
      } else {
        console.log(response);
        toast.error(`${response.response.message}`);
      }
      console.log("Form submitted:", formState);
    }
    setValidated(true);
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Task</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form
          className={classes.taskForm}
          noValidate
          validated={validated}
          onSubmit={handleSubmit}
        >
          <Form.Group controlId="formPhase">
            <Form.Label>Phase</Form.Label>
            <Form.Control
              as="select"
              name="phase"
              value={formState.phase}
              onChange={handleInputChange}
              required
            >
              <option value="">Choose...</option>
              <option value="Planning">Planning</option>
              <option value="Design">Design</option>
              <option value="Implementation">Implementation</option>
              <option value="Testing">Testing</option>
              <option value="Deployment">Deployment</option>
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              Please select a phase.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="formTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formState.title}
              onChange={handleInputChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please enter a title.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group as={Col} controlId="formStartDate">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              name="startDate"
              value={formState.startDate}
              onChange={handleInputChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please select a start date.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group as={Col} controlId="formDeadline">
            <Form.Label>Deadline</Form.Label>
            <Form.Control
              type="date"
              name="deadline"
              value={formState.deadline}
              onChange={handleInputChange}
              min={formState.startDate}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please select a deadline after the start date.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="formAssignedTo">
            <Form.Label>Assigned To</Form.Label>
            <Form.Control
              as="select"
              name="assignedToId"
              value={formState.assignedToId}
              onChange={handleStudentChange}
              required
            >
              <option value="">Select a person</option>
              {students.map((student) => {
                return (
                  <option value={student.id} key={student.id}>
                    {student.name}
                  </option>
                );
              })}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              Please select a student
            </Form.Control.Feedback>
          </Form.Group>

          <Button variant="primary" type="submit">
            Save
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddTaskModal;
