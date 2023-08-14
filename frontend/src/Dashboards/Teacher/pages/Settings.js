import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import { ApiCall } from "../../../api/apiCall";
import CustomCard from "../../../Components/UI/CustomCard";
import Button from "../../../Components/UI/Button";

import classes from "./Settings.module.css";

let finalpasswords = {};

const initialPasswordsState = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const Settings = (props) => {
  const { token, user_id } = useSelector((state) => state.login.input);

  const [passwords, setPasswords] = useState(initialPasswordsState);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPasswords((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    finalpasswords = passwords;
    if (
      passwords.newPassword.length >= 8 &&
      passwords.newPassword === passwords.confirmPassword
    ) {
      console.log(finalpasswords);
      const response = await ApiCall({
        params: { ...finalpasswords, userId: user_id },
        route: `teacher/update-password`,
        verb: "put",
        token,
        baseurl: true,
      });

      if (response && response.status === 200) {
        toast.success(response.response.message);
        localStorage.clear();

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(response.response.message);
      }
    }

    setPasswords(initialPasswordsState);
  };

  return (
    <div className={classes["main-container"]}>
      <CustomCard>
        <div className={classes.container}>
          <Form onSubmit={handleSubmit} className={classes.form}>
            <Form.Group controlId="oldPassword">
              <Form.Label>Old Password</Form.Label>
              <Form.Control
                type="password"
                name="oldPassword"
                value={passwords.oldPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="newPassword">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="confirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>
            {passwords.newPassword.length >= 8 &&
              passwords.newPassword === passwords.confirmPassword && (
                <Button type="submit">Save</Button>
              )}
          </Form>
        </div>
      </CustomCard>
    </div>
  );
};

export default Settings;
