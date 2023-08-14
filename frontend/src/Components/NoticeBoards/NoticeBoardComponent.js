import { useState, useEffect } from "react";
import { Modal, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import { ApiCall } from "../../api/apiCall";

import NoticeBoardItem from "./NoticeBoardItem";
import CustomCard from "../UI/CustomCard";
import Button from "../UI/Button";

import classes from "./NoticeBoardComponent.module.css";

const initialState = {
  receiverEntity: "",
  receiverId: "",
  receiverName: "",
  headline: "",
  description: "",
};

const NoticeBoardComponent = (props) => {
  const { token } = useSelector((state) => state.login.input);
  const isAdmin = props.isAdmin;
  const [limit, setLimit] = useState(6);
  const [notices, setNotices] = useState(props.notices);
  const [loadedData, setLoadedData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    ...initialState,
  });
  const [formErrors, setFormErrors] = useState({
    receiverEntity: "",
    receiver: "",
    headline: "",
    description: "",
  });

  useEffect(() => {
    if (formData.receiverEntity) {
      const loadFormData = async () => {
        try {
          const response = await ApiCall({
            params: { receiverEntity: formData.receiverEntity },
            route: `admin/forms/new-notice/data`,
            verb: "get",
            token,
            baseurl: true,
          });
          const myData = response?.response?.data ?? [];
          setLoadedData(myData);
        } catch (error) {
          console.log(error);
        }
      };
      loadFormData();
    }
  }, [formData.receiverEntity, token]);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleInputChange = (event) => {
    const target = event.target;
    const name = target.name;
    const value = target.value;
    setFormData({ ...formData, [name]: value });
  };

  const handleReceiverChange = (event) => {
    const receiverId = event.target.value;
    const receiverName = event.target.options[event.target.selectedIndex].text;
    setFormData((prevData) => ({ ...prevData, receiverId, receiverName }));
  };

  const validateField = (fieldName, value) => {
    let error = "";
    switch (fieldName) {
      case "receiverEntity":
        if (!value) {
          error = "Receiver Entity is required";
        }
        break;
      case "receiver":
        if (!value) {
          error = "Receiver is required";
        }
        break;
      case "headline":
        if (!value) {
          error = "Headline of notice is required";
        }
        break;
      case "description":
        if (!value) {
          error = "Description is required";
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
    // If there are no errors, submit the form
    if (isFormValid()) {
      // console.log(formData);
      handleCloseModal();

      const sendFormData = async () => {
        try {
          const response = await ApiCall({
            params: { ...formData },
            route: `admin/notice-board/new-notice`,
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
        } catch (error) {
          console.log(error);
          toast.error(`${error}`);
        }
      };
      sendFormData();

      setFormData({ ...initialState });
    }
  };

  useEffect(() => {
    setNotices(props.notices);
  }, [props.notices]);

  const deleteNoticeHandler = async (id) => {
    const updateNotices = notices.filter((notice) => notice.id !== id);
    setNotices(updateNotices);
    try {
      const response = await ApiCall({
        params: {},
        route: `admin/notice-board/${id}/delete`,
        verb: "delete",
        token,
        baseurl: true,
      });
      if (response.status === 200) {
        toast.success(`${response.response.message}`);
      } else {
        toast.error(`${response.response.message}`);
      }
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const loadMoreHandler = () => {
    setLimit((prevlimit) => prevlimit + 3);
  };

  const customclass = props.wide ? classes.wide : "";

  const noticeItems = notices.slice(0, limit).map((item) => {
    return (
      <NoticeBoardItem
        onDeleteNotice={deleteNoticeHandler}
        reciever={props.reciever}
        key={item.id}
        item={item}
        isAdmin={isAdmin}
      />
    );
  });

  return (
    <div>
      <CustomCard>
        <div className={`${classes["notice-container"]} ${customclass}`}>
          <p className={classes.head}>Notice Board</p>
          {isAdmin && <Button onClick={handleShowModal}>Add Notice</Button>}
          {notices.length > 0 && noticeItems}
          {!notices.length && <p>No notices to show here!</p>}
          {limit < notices.length && (
            <p className={classes.load} onClick={loadMoreHandler}>
              Load More
            </p>
          )}
        </div>
      </CustomCard>
      <Modal backdrop="static" show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create Notice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit} className={classes.form}>
            <Form.Group controlId="receiverEntity">
              <Form.Label>Receiver Entity</Form.Label>
              <Form.Control
                name="receiverEntity"
                as="select"
                value={formData.program}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                required
                isInvalid={formErrors.receiverEntity}
              >
                <option value="">Select entity</option>
                <option key={"class"} value={"class"}>
                  Class
                </option>
                <option key={"teacher"} value={"teacher"}>
                  Teacher
                </option>
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                {formErrors.receiverEntity}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="receiver">
              <Form.Label>Receiver</Form.Label>
              <Form.Control
                name="receiver"
                as="select"
                value={formData.receiverId}
                required
                onChange={handleReceiverChange}
                onBlur={handleInputBlur}
                isInvalid={formErrors.receiver}
              >
                <option value="">Select Receiver</option>
                {loadedData.map(({ id, name }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                {formErrors.receiver}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="headline">
              <Form.Label>Headline</Form.Label>
              <Form.Control
                type="text"
                name="headline"
                placeholder="Enter project headline"
                value={formData.headline}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                required
                isInvalid={formErrors.headline}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.headline}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                placeholder="Enter project description"
                value={formData.description}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                required
                isInvalid={formErrors.description}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.description}
              </Form.Control.Feedback>
            </Form.Group>
            <Button type="submit" onClick={handleCloseModal}>
              Submit
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer></Modal.Footer>
      </Modal>
    </div>
  );
};

export default NoticeBoardComponent;
