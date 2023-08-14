import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { MultiSelect } from "react-multi-select-component";
import { Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { ApiCall } from "../../../api/apiCall";
import SpinnerModal from "../../../Components/UI/SpinnerModal";
import Button from "../../../Components/UI/Button";
import styles from "./CreateProject.module.css";

const initialState = {
  title: "",
  memberNames: [],
  supervisorName: "",
  supervisorId: "",
  classId: "",
  className: "",
  description: "",
};

const EditProject = () => {
  const { token } = useSelector((state) => state.login.input);
  const [formData, setFormData] = useState({
    ...initialState,
  });

  const [formErrors, setFormErrors] = useState({
    title: "",
    class: "",
    memberNames: "",
    supervisor: "",
  });
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [supervisors, setSupervisors] = useState([]);
  const { projectId } = useParams();
  const navigate = useNavigate();
  let myClass = useRef({});

  // Fetch classes from backend on page load
  useEffect(() => {
    const loadDataOnStart = async () => {
      try {
        const response = await ApiCall({
          params: {},
          route: `admin/projects/${projectId}`,
          verb: "get",
          token,
          baseurl: true,
        });
        if (response.status === 200) {
          const members = response.response.project.memberNames.map(
            (student) => ({
              value: student.id,
              label: student.name,
            })
          );
          setFormData((prevData) => ({
            ...prevData,
            ...response.response.project,
            memberNames: members,
          }));
        }
      } catch (error) {
        console.log(error);
      }

      try {
        const response = await ApiCall({
          params: {},
          route: "admin/classes",
          verb: "get",
          token,
          baseurl: true,
        });
        setClasses(response?.response?.classes ?? []);
      } catch (error) {
        console.log(error);
      }
    };
    loadDataOnStart();
  }, [projectId, token]);

  // Fetch students and supervisors when class is chosen
  useEffect(() => {
    if (formData.classId) {
      const loadFormData = async () => {
        try {
          const response = await ApiCall({
            params: { classId: formData.classId, all: true },
            route: `admin/forms/new-project/data`,
            verb: "get",
            token,
            baseurl: true,
          });
          const myStudents = response?.response?.students ?? [];
          const studentsOptions = myStudents.map((student) => ({
            value: student.id,
            label: student.name,
          }));
          setStudents(studentsOptions);
          setSupervisors(response?.response?.supervisors ?? []);
          myClass.current = response?.response?.class ?? {};
        } catch (error) {
          console.log(error);
        }
      };
      loadFormData();
    }
  }, [formData.classId, token]);

  const handleTitleChange = (event) => {
    setFormData((prevData) => ({ ...prevData, title: event.target.value }));
  };

  const handleDescriptionChange = (event) => {
    setFormData((prevData) => ({
      ...prevData,
      description: event.target.value,
    }));
  };

  const handleSupervisorChange = (event) => {
    const supervisorName =
      event.target.options[event.target.selectedIndex].text;
    const supervisorId = event.target.value;
    setFormData((prevData) => ({ ...prevData, supervisorName, supervisorId }));
  };

  const handleInputBlur = (event) => {
    const { name, value } = event.target;
    const error = validateField(name, value);
    setFormErrors({ ...formErrors, [name]: error });
  };

  const validateField = (fieldName, value) => {
    let error = "";
    switch (fieldName) {
      case "title":
        if (!value) {
          error = "Title is required";
        }
        break;
      case "supervisor":
        if (!value) {
          error = "Supervisor Name is required";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const sendFormData = async () => {
      try {
        setIsLoading(true);
        const response = await ApiCall({
          params: {
            title: formData.title,
            supervisorName: formData.supervisorName,
            supervisorId: formData.supervisorId,
            description: formData.description,
          },
          route: `admin/projects/${projectId}/edit`,
          verb: "patch",
          token,
          baseurl: true,
        });
        setIsLoading(false);

        if (response.status === 200) {
          toast.success(`${response.response.message}`);
        } else {
          toast.error(`${response.response.message}`);
        }

        console.log(response.response);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
      setFormData((prevData) => ({
        ...prevData,
        ...initialState,
      }));
    };
    setTimeout(() => {
      navigate(-1);
    }, 3000);
    sendFormData();
  };

  return (
    <div>
      {!isLoading && (
        <div className={styles.container}>
          <h3>Create a Project</h3>
          <Form onSubmit={handleSubmit} className={styles.form}>
            <Form.Group controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                placeholder="Enter project title"
                value={formData.title}
                onChange={handleTitleChange}
                onBlur={handleInputBlur}
                required
                isInvalid={formErrors.title}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.title}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="classId">
              <Form.Label>Class</Form.Label>
              <Form.Control
                disabled
                as="select"
                name="class"
                value={formData.classId}
                required
              >
                <option value="">Select a class</option>
                {classes.map(({ id, name }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="studentIds">
              <Form.Label>Student</Form.Label>
              <MultiSelect
                disabled={true}
                name="memberNames"
                options={students}
                value={formData.memberNames}
                hasSelectAll={("hasSelectAll", false)}
              />
              <p style={{ color: "blue", fontSize: "smaller" }}>
                You can't change the members selected during creation of the
                project
              </p>
            </Form.Group>

            <Form.Group controlId="supervisorId">
              <Form.Label>Supervisor</Form.Label>
              <Form.Control
                as="select"
                name="supervisor"
                value={formData.supervisorId}
                onChange={handleSupervisorChange}
                onBlur={handleInputBlur}
                required
                isInvalid={formErrors.supervisor}
              >
                <option value="">Select a supervisor</option>
                {supervisors.map(({ id, name }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                {formErrors.supervisor}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text-area"
                name="description"
                placeholder="Enter project description"
                value={formData.description}
                onChange={handleDescriptionChange}
                onBlur={handleInputBlur}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Create Project
            </Button>
          </Form>
        </div>
      )}
      {isLoading && <SpinnerModal />}
    </div>
  );
};

export default EditProject;
