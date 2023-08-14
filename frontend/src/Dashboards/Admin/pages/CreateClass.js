import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form } from "react-bootstrap";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import { ApiCall } from "../../../api/apiCall";

import SpinnerModal from "../../../Components/UI/SpinnerModal";
import Button from "../../../Components/UI/Button";
import classes from "./CreateClass.module.css";

const optionsProgram = ["BSIT", "BSCS", "MSc.IT"];
const optionsSessionType = ["Fall", "Spring"];

const getCurrentYear = () => {
  return new Date().getFullYear();
};
const initialState = {
  program: "",
  sessionType: "",
  sessionStart: "",
  sessionEnd: "",
  shift: "",
  minAllowed: "",
  maxAllowed: "",
};

const getYearsOptions = (startYear, endYear) => {
  const options = [];
  for (let i = startYear - 1; i <= endYear - 2; i++) {
    options.push(i);
  }
  return options;
};

const CreateClass = () => {
  const { token } = useSelector((state) => state.login.input);
  const [formData, setFormData] = useState({
    ...initialState,
  });

  const [formErrors, setFormErrors] = useState({
    ...initialState,
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const target = event.target;
    const name = target.name;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setFormData({ ...formData, [name]: value });
  };

  const validateField = (fieldName, value) => {
    let error = "";
    switch (fieldName) {
      case "program":
        if (!value) {
          error = "Program is required";
        }
        break;
      case "sessionType":
        if (!value) {
          error = "Session type is required";
        }
        break;
      case "sessionStart":
        if (!value) {
          error = "Session start is required";
        }
        break;
      case "sessionEnd":
        if (!value) {
          error = "Session end is required";
        }
        break;
      case "shift":
        if (!value) {
          error = "Shift is required";
        }
        break;
      case "minAllowed":
        if (!value) {
          error = "Min allowed is required";
        } else if (value < 1 || value > 10) {
          error = "Min allowed must be between 1 and 10";
        }
        break;
      case "maxAllowed":
        if (!value) {
          error = "Max allowed is required";
        } else if (value < 1 || value > 10) {
          error = "Max allowed must be between 1 and 10";
        } else if (value < formData.minAllowed) {
          error = "Max shouldn't be smaller than min";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleInputBlur = (event) => {
    const { name, value } = event.target;
    const error = validateField(name, value);
    setFormErrors({ ...formErrors, [name]: error });
  };

  const isFormValid = () => {
    const errors = {};
    let isValid = true;
    Object.keys(formData).forEach((fieldName) => {
      const value = formData[fieldName];
      const error = validateField(fieldName, value);
      if (error) {
        errors[fieldName] = error;
        isValid = false;
      }
    });
    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isFormValid()) {
      const session = `${formData.sessionType} (${
        formData.sessionStart
      }-${formData.sessionEnd.slice(-2)})`;
      const sendData = async () => {
        const response = await ApiCall({
          params: {
            program: formData.program,
            session: session,
            shift: formData.shift,
            minAllowed: formData.minAllowed,
            maxAllowed: formData.maxAllowed,
          },
          route: `admin//classes/new-class`,
          verb: "post",
          token,
          baseurl: true,
        });

        if (response.status === 200) {
          toast.success(`${response.response.message}`);
        } else {
          toast.error(`${response.response.message}`);
        }
        console.log(response);
      };
      sendData();
      setFormData((prevState) => ({
        ...prevState,
        ...initialState,
      }));
      setIsLoading(true);
      setTimeout(() => {
        navigate(-1);
      }, 3000);
    }
  };

  return (
    <div>
      {!isLoading && (
        <div className={`container mt-4 ${classes.container}`}>
          <h3>Add Class</h3>
          <Form onSubmit={handleSubmit} className={classes.form}>
            <Form.Group controlId="formProgram">
              <Form.Label>Program</Form.Label>
              <Form.Control
                name="program"
                as="select"
                value={formData.program}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                isInvalid={formErrors.program}
              >
                <option value="">Select program</option>
                {optionsProgram.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                {formErrors.program}
              </Form.Control.Feedback>
            </Form.Group>{" "}
            <Form.Group controlId="formSessionType">
              <Form.Label>Session Type</Form.Label>
              <Form.Control
                name="sessionType"
                as="select"
                value={formData.sessionType}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                isInvalid={formErrors.sessionType}
              >
                <option value="">Select session type</option>
                {optionsSessionType.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                {formErrors.sessionType}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formSessionStart">
              <Form.Label>Session Start</Form.Label>
              <Form.Control
                name="sessionStart"
                as="select"
                value={formData.sessionStart}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                isInvalid={formErrors.sessionStart}
              >
                <option value="">Select session start</option>
                {getYearsOptions(getCurrentYear() - 4, getCurrentYear()).map(
                  (option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  )
                )}
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                {formErrors.sessionStart}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formSessionEnd">
              <Form.Label>Session End</Form.Label>
              <Form.Control
                name="sessionEnd"
                as="select"
                value={formData.sessionEnd}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                isInvalid={formErrors.sessionEnd}
              >
                <option value="">Select session end</option>
                {getYearsOptions(getCurrentYear(), getCurrentYear() + 4).map(
                  (option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  )
                )}
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                {formErrors.sessionEnd}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formShift">
              <Form.Label>Shift</Form.Label>
              <Form.Control
                name="shift"
                as="select"
                value={formData.shift}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                isInvalid={formErrors.shift}
              >
                <option value="">Select shift</option>
                <option value="Mor">Morning</option>
                <option value="Eve">Evening</option>
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                {formErrors.shift}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formMinAllowed">
              <Form.Label>Minimum Allowed</Form.Label>
              <Form.Control
                name="minAllowed"
                type="number"
                min={1}
                max={10}
                placeholder="Enter minimum allowed"
                value={formData.minAllowed}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                isInvalid={formErrors.minAllowed}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.minAllowed}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formMaxAllowed">
              <Form.Label>Maximum Allowed</Form.Label>
              <Form.Control
                name="maxAllowed"
                type="number"
                min={1}
                max={10}
                placeholder="Enter maximum allowed"
                value={formData.maxAllowed}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                isInvalid={formErrors.maxAllowed}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.maxAllowed}
              </Form.Control.Feedback>
            </Form.Group>
            <Button type="submit">Submit</Button>
          </Form>
        </div>
      )}
      {isLoading && <SpinnerModal />}
    </div>
  );
};
export default CreateClass;
