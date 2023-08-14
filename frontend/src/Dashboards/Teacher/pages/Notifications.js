import React, { useState, useEffect, useCallback } from "react";
import { MdOutlineDeleteForever } from "react-icons/md";
import { Form, ListGroup, Modal } from "react-bootstrap";
import { toast } from "react-toastify";

import { ApiCall } from "../../../api/apiCall";

import CustomCard from "../../../Components/UI/CustomCard";
import SpinnerModal from "../../../Components/UI/SpinnerModal";
import Button from "../../../Components/UI/Button";

import classes from "./PersonalNotes.module.css";

const Notifications = ({ userId, userName }) => {
  const [notifications, setNotifications] = useState([]);
  const [newNotification, setNewNotification] = useState({
    description: "",
    headline: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const loadPage = useCallback(async () => {
    const response = await ApiCall({
      params: {
        userId: userId,
      },
      route: `teacher/notifications`,
      verb: "get",
      token: "jwt_token",
      baseurl: true,
    });

    if (response && response.status === 200) {
      setNotifications(response.response.notifications);
      setIsLoading(false);
    } else {
      console.log(response);
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await ApiCall({
      params: {
        ...newNotification,
        userName,
        userId,
      },
      route: `teacher/notifications/new-notification`,
      verb: "post",
      token: "jwt_token",
      baseurl: true,
    });
    setIsLoading(true);
    if (response.status === 200) {
      toast.success(`${response.response.message}`);
    } else {
      toast.error(`${response.response.message}`);
    }

    loadPage();
    setNewNotification((prevState) => ({
      description: "",
      headline: "",
    }));
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    const response = await ApiCall({
      params: {},
      route: `teacher/notifications/${id}/delete`,
      verb: "delete",
      token: "jwt_token",
      baseurl: true,
    });
    setIsLoading(true);
    if (response.status === 200) {
      toast.success(`${response.response.message}`);
    } else {
      toast.error(`${response.response.message}`);
    }
    loadPage();
    console.log(response);
  };

  return (
    <div className={classes["main-container"]}>
      <CustomCard>
        <div className={classes.container}>
          <p className={classes.headline}>Notification To The PMO</p>
          <Button onClick={handleShowModal}>Add Notification</Button>
          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Add Notification</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form
                onSubmit={handleSubmit}
                className={classes.notificationForm}
              >
                <Form.Group controlId="notifications">
                  <Form.Control
                    type="text"
                    placeholder="Enter headline"
                    value={newNotification.headline}
                    onChange={(event) =>
                      setNewNotification((prevState) => ({
                        ...prevState,
                        headline: event.target.value,
                      }))
                    }
                    required
                  />
                </Form.Group>
                <Form.Group controlId="notifications">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter description"
                    value={newNotification.description}
                    onChange={(event) =>
                      setNewNotification((prevState) => ({
                        ...prevState,
                        description: event.target.value,
                      }))
                    }
                    required
                  />
                </Form.Group>
                <Button type="submit">Add</Button>
              </Form>
            </Modal.Body>
          </Modal>
          {!isLoading &&
            !notifications.length > 0 &&
            "You don't have personal notes, maybe create one!"}
          {isLoading && <SpinnerModal />}
          {!isLoading && notifications.length > 0 && (
            <ListGroup className="my-3">
              {notifications.map((notification) => (
                <ListGroup.Item
                  key={notification.id}
                  className={classes.listGroupItem}
                >
                  <div className={classes.item}>
                    <div>
                      <h6 className={classes.title}>{notification.headline}</h6>
                      <p className={classes.description}>
                        {notification.description}
                      </p>
                    </div>
                    <MdOutlineDeleteForever
                      className={classes.icon}
                      onClick={() => handleDelete(notification.id)}
                    />
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>
      </CustomCard>
    </div>
  );
};

export default Notifications;
