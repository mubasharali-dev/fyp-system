import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";

import { ApiCall } from "../../../api/apiCall";
import Class from "../../../Components/Classes/Class";
import SpinnerModal from "../../../Components/UI/SpinnerModal";
import classes from "./Classes.module.css";

const Classes = () => {
  const { token } = useSelector((state) => state.login.input);
  const [classesList, setClassesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [classIdToDelete, setClassIdToDelete] = useState(null);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await ApiCall({
          params: {},
          route: "admin/classes",
          verb: "get",
          token,
          baseurl: true,
        });
        setClassesList(response?.response?.classes ?? []);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadClasses();
  }, [token]);

  const deleteClassHandler = async () => {
    try {
      const response = await ApiCall({
        params: {},
        route: `admin/classes/${classIdToDelete}/delete`,
        verb: "delete",
        token,
        baseurl: true,
      });

      if (response && response.status === 200) {
        setClassesList((prevClassesList) =>
          prevClassesList.filter((cls) => cls.id !== classIdToDelete)
        );

        if (response.status === 200) {
          toast.success(`${response.response.message}`);
        } else {
          toast.error(`${response.response.message}`);
        }
        console.log(response);
      } else {
        console.log(response);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteClass = (id) => {
    setClassIdToDelete(id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleConfirmDelete = () => {
    setShowModal(false);
    deleteClassHandler();
  };

  const handleCancelDelete = () => {
    setShowModal(false);
  };

  const handlePass = () => {};

  const classesLinks = classesList.map((cls) => (
    <Class
      key={cls.id}
      item={cls}
      passHandler={handlePass}
      onDeleteClass={handleDeleteClass}
    />
  ));

  return (
    <div>
      {!isLoading && (
        <div className={classes.container}>
          <div className={classes["add-class"]}>
            <Link to="./new-class">
              <span className={classes.plus}>+</span>
            </Link>
          </div>
          {classesLinks}
          <Modal
            backdrop="static"
            centered
            show={showModal}
            onHide={handleCloseModal}
          >
            <Modal.Header closeButton>
              <Modal.Title>Delete Class</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                You will not able to undo it later. All the students and
                projects associated to it will be deleted.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Yes
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
      {isLoading && <SpinnerModal />}
    </div>
  );
};

export default Classes;
