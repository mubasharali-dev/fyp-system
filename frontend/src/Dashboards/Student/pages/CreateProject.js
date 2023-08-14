import { useState, useEffect, useRef } from "react";
import { MultiSelect } from "react-multi-select-component";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
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

const CreateProject = () => {
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

  const navigate = useNavigate();
  let myClass = useRef({});

  // Fetch classes from backend on page load
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await ApiCall({
          params: {},
          route: "admin/classes",
          verb: "get",
          token: "jwt_token",
          baseurl: true,
        });
        setClasses(response?.response?.classes ?? []);
      } catch (error) {
        console.log(error);
      }
    };
    loadClasses();
  }, []);

  // Fetch students and supervisors when class is chosen
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      memberNames: initialState.memberNames,
    }));
    if (formData.classId) {
      const loadFormData = async () => {
        try {
          const response = await ApiCall({
            params: { classId: formData.classId },
            route: `admin/forms/new-project/data`,
            verb: "get",
            token: "jwt_token",
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
  }, [formData.classId]);

  const handleTitleChange = (event) => {
    setFormData((prevData) => ({ ...prevData, title: event.target.value }));
  };

  const handleDescriptionChange = (event) => {
    setFormData((prevData) => ({
      ...prevData,
      description: event.target.value,
    }));
  };

  const handleClassChange = (event) => {
    const classId = event.target.value;
    const className = event.target.options[event.target.selectedIndex].text;
    setFormData((prevData) => ({ ...prevData, classId, className }));
  };

  const handleStudentChange = (selectedOptions) => {
    const memberNames = [...selectedOptions];
    setFormData((prevData) => ({ ...prevData, memberNames }));
  };
  // console.log(formData.memberNames);

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
      case "class":
        if (!value) {
          error = "Class is required";
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
    if (formData.memberNames.length < myClass.current.minAllowed) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        memberNames: `At least ${myClass.current.minAllowed} student must be selected`,
      }));
      return;
    }

    // Check if more than three students have been selected
    if (formData.memberNames.length > myClass.current.maxAllowed) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        memberNames: `No more than ${myClass.current.maxAllowed} students can be selected`,
      }));
      return;
    }

    // Clear any previous errors
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      memberNames: "",
    }));

    const members = formData.memberNames.map((student) => ({
      id: student.value,
      name: student.label,
    }));

    const sendFormData = async () => {
      try {
        setIsLoading(true);
        const response = await ApiCall({
          params: {
            title: formData.title,
            memberNames: members,
            supervisorName: formData.supervisorName,
            supervisorId: formData.supervisorId,
            classId: formData.classId,
            className: formData.className,
            description: formData.description,
          },
          route: `admin/projects/new-project`,
          verb: "post",
          token: "jwt_token",
          baseurl: true,
        });
        setIsLoading(false);

        if (response.status === 200) {
          toast.success(`${response.response.message}`);
        } else {
          toast.error(`${response.response.message}`);
        }
        console.log(response.response);
        setTimeout(() => {
          navigate(-1);
        }, 3000);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
      setFormData((prevData) => ({
        ...prevData,
        ...initialState,
      }));
    };
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
                as="select"
                name="class"
                value={formData.classId}
                onChange={handleClassChange}
                onBlur={handleInputBlur}
                required
                isInvalid={formErrors.class}
              >
                <option value="">Select a class</option>
                {classes.map(({ id, name }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                {formErrors.class}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="studentIds">
              <Form.Label>Student</Form.Label>
              <MultiSelect
                name="memberNames"
                options={students}
                value={formData.memberNames}
                onChange={handleStudentChange}
                hasSelectAll={("hasSelectAll", false)}
              />
              {formErrors.memberNames && (
                <p style={{ color: "red", fontSize: "smaller" }}>
                  {formErrors.memberNames}
                </p>
              )}
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
                as="textarea"
                rows={3}
                name="description"
                placeholder="Enter project description"
                value={formData.description}
                onChange={handleDescriptionChange}
                onBlur={handleInputBlur}
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

export default CreateProject;
