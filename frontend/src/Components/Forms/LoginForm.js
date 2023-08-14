import { useState } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import { authActions } from "../../store/authSlice";
import { ApiCall } from "../../api/apiCall";
import Button from "../UI/Button";
import classes from "./LoginForm.module.css";

const LoginForm = () => {
  const dispatch = useDispatch();

  const [state, setState] = useState({
    input: {
      userID: "",
      password: "",
      loginAs: "",
      rememberMe: false,
    },
    errors: {},
  });

  const handleChange = (e) => {
    const input = { ...state.input };
    const errors = { ...state.errors };
    input[e.target.id] = e.target.value;
    errors[e.target.id] = "";

    setState((prevState) => ({
      ...prevState,
      input,
      errors,
    }));
  };

  const validate = () => {
    let input = state.input;
    let errors = {};
    let isValid = true;

    if (!input["userID"]) {
      isValid = false;
      errors["userID"] = "Please enter your userID";
    }

    if (!input["password"] || input["password"].length < 8) {
      isValid = false;
      errors["password"] = "Password should be minimum 8 chars";
    }
    if (!input["loginAs"]) {
      isValid = false;
      errors["loginAs"] = "Please choose login as";
    }

    setState((prevState) => ({
      ...prevState,
      errors,
    }));

    return isValid;
  };

  const handleRememberMe = (event) => {
    setState({
      ...state,
      input: {
        ...state.input,
        rememberMe: event.target.checked,
      },
    });
  };

  const loginFormHandler = async (e) => {
    e.preventDefault();
    if (validate()) {
      const response = await ApiCall({
        params: { ...state.input },
        route: `login`,
        verb: "post",
        token: "jwt_token",
        baseurl: true,
      });
      if (response.status === 200) {
        dispatch(
          authActions.login({
            ...state.input,
            token: response.response.token,
            user_id: response.response.userId,
            userName: response.response.userName,
          })
        );
        if (state.input.rememberMe) {
          localStorage.setItem("userID", state.input.userID);
          localStorage.setItem("user_id", response.response.userId);
          localStorage.setItem("token", response.response.token);
          localStorage.setItem("password", state.input.password);
          localStorage.setItem("loginAs", state.input.loginAs);
          localStorage.setItem("userName", response.response.userName);
        } else {
          localStorage.removeItem("userID");
          localStorage.removeItem("password");
          localStorage.removeItem("loginAs");
        }
        toast.success(`${response.response.message}`);
      } else {
        toast.error(`${response.response.message}`);
      }

      setState({
        input: {
          userID: "",
          password: "",
          loginAs: "",
          rememberMe: false,
        },
        errors: {},
      });
    }
  };

  return (
    <div className={classes.formcontainer}>
      <Form onSubmit={loginFormHandler}>
        <Row className={classes.row}>
          <Form.Group className={classes.formgroup} as={Col} controlId="userID">
            <Form.Control
              className={classes.control}
              type="text"
              value={state.input.userID}
              onChange={handleChange}
              placeholder="Enter User ID"
              required
            />
            {state.errors.userID && (
              <p className={classes.alert}>{state.errors.userID}</p>
            )}
          </Form.Group>
        </Row>

        <Row>
          <Form.Group
            className={classes.formgroup}
            as={Col}
            controlId="password"
          >
            <Form.Control
              className={classes.control}
              type="password"
              value={state.input.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
            {state.errors.password && (
              <p className={classes.alert}>{state.errors.password}</p>
            )}
          </Form.Group>
        </Row>

        <Row>
          <Form.Group
            className={classes.formgroup}
            as={Col}
            controlId="loginAs"
          >
            <Form.Select
              className={classes.control}
              as="select"
              value={state.input.loginAs}
              onChange={handleChange}
              required
            >
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="Teacher">Teacher</option>
              <option value="Student">Student</option>
            </Form.Select>
            {state.errors.loginAs && (
              <p className={classes.alert}>{state.errors.loginAs}</p>
            )}
          </Form.Group>
        </Row>

        <Row>
          <Form.Group as={Col}>
            <Form.Check
              checked={
                localStorage.getItem("userID") &&
                localStorage.getItem("password")
              }
              type="checkbox"
              id="rememberMe"
              label="Remember Password"
              onChange={handleRememberMe}
            />
          </Form.Group>
        </Row>

        <Row className="mb-3">
          <Col>
            <Button type="submit">Login</Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default LoginForm;
