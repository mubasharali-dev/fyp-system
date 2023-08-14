import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";

import { ApiCall } from "../../../api/apiCall";

import NoticeBoardComponent from "../../../Components/NoticeBoards/NoticeBoardComponent";
import ProjectTable from "../../../Components/Tables/ProjectTable";
import StudentsTable from "../../../Components/Tables/StudentTable";
import SupervisorsTable from "../../../Components/Tables/SupervisorsTable";
import ExaminersTable from "../../../Components/Tables/ExaminersTable";
import CustomCard from "../../../Components/UI/CustomCard";
import SpinnerModal from "../../../Components/UI/SpinnerModal";
import Button from "../../../Components/UI/Button";

import classes from "./Class.module.css";

const initialState = {
  titleSubmission: "",
  proposalSubmission: "",
  proposalDefense: "",
  deliverable1: "",
  deliverable1Evalutaion: "",
  deliverable2: "",
  deliverable2Evalutaion: "",
};

const Class = () => {
  const { token } = useSelector((state) => state.login.input);
  const [pageState, setPageState] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const { classId } = useParams();

  const [showModal, setShowModal] = useState(false);
  const [formState, setFormState] = useState({ ...initialState });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => {
    setFormState({ ...timetable });
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(formState);
    handleCloseModal();

    try {
      const response = await ApiCall({
        params: { ...formState },
        route: `admin/classes/${classId}/edit-timetable`,
        verb: "patch",
        token: token,
        baseurl: true,
      });
      if (response.status === 200) {
        toast.success(`${response.response.message}`);
        pageState.myClass = {
          ...pageState.myClass,
          timetable: { ...formState },
        };
      } else {
        toast.error(`${response.response.message}`);
      }
      console.log(response);
      setFormState({ ...initialState });
    } catch (error) {
      toast.error(`${error}`);
      console.log(error);
    }
  };

  const isFormValid =
    Object.values(formState).filter((val) => val === "").length === 0;

  let timetable;
  useEffect(() => {
    const loadPage = async () => {
      const response = await ApiCall({
        params: { classId },
        route: `admin/classes/${classId}`,
        verb: "get",
        token,
        baseurl: true,
      });

      if (response && response.status === 200) {
        setPageState(response.response);
        setIsLoading(false);
      } else {
        console.log(response);
        setIsLoading(false);
      }
    };
    loadPage();
  }, [classId, token]);

  if (!isLoading) {
    timetable = pageState.myClass.timetable;
    const formatDate = (timestamp) => {
      const date = new Date(timestamp);
      return date.toISOString().slice(0, 10);
    };

    for (const key in timetable) {
      if (timetable.hasOwnProperty(key)) {
        const value = timetable[key];
        timetable[key] = formatDate(value);
      }
    }
  }

  // console.log("page rendered");
  // console.log(pageState);

  return (
    <div>
      {!isLoading && (
        <div className={classes["main-container"]}>
          <div>
            <p>Class: {pageState.myClass.name}</p>
            <hr />
            <ProjectTable
              projects={pageState.projects}
              label={"Projects"}
              button={true}
            />
            <hr />
            <SupervisorsTable supervisors={pageState.supervisors} />
            <hr />
            <StudentsTable students={pageState.students} />
            <hr />
            <ExaminersTable examiners={pageState.examiners} />
          </div>
          <div className={classes.right}>
            <CustomCard>
              <div className={classes["card-container"]}>
                <div className={classes.card}>
                  <p>Minimum No. of Allowed Students</p>
                  <h4>
                    {pageState.myClass.minAllowed.toString().padStart(2, "0")}
                  </h4>
                </div>
                <div className={classes.card}>
                  <p>Maximum No. of Allowed Students</p>
                  <h4>
                    {pageState.myClass.maxAllowed.toString().padStart(2, "0")}
                  </h4>
                </div>
              </div>
            </CustomCard>

            <CustomCard>
              <div className={classes.container}>
                <p className={classes.headline}>Deadlines and Submissions</p>
                <div className={classes.item}>
                  <p>Project Title:</p>
                  <h6>{timetable.titleSubmission}</h6>
                </div>
                <div className={classes.item}>
                  <p>Proposal Submission:</p>
                  <h6>{timetable.proposalSubmission}</h6>
                </div>
                <div className={classes.item}>
                  <p>Proposal Defense:</p>
                  <h6>{timetable.proposalDefense}</h6>
                </div>
                <div className={classes.item}>
                  <p>Deliverable 1:</p>
                  <h6>{timetable.deliverable1}</h6>
                </div>
                <div className={classes.item}>
                  <p>Deliverable 1 Evaluation:</p>
                  <h6>{timetable.deliverable1Evalutaion}</h6>
                </div>
                <div className={classes.item}>
                  <p>Deliverable 2:</p>
                  <h6>{timetable.deliverable2}</h6>
                </div>
                <div className={classes.item}>
                  <p>Deliverable 2 Evaluation:</p>
                  <h6>{timetable.deliverable2Evalutaion}</h6>
                </div>
                <Button onClick={handleShowModal}>
                  <p className={classes.edit}>Edit</p>
                </Button>
              </div>
            </CustomCard>
            <NoticeBoardComponent
              reciever={false}
              notices={pageState.notices}
              isAdmin={true}
            />
          </div>
          <Modal backdrop="static" show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Timetable</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit} className={classes.form}>
                <Form.Group>
                  <Form.Label>Title Submission</Form.Label>
                  <Form.Control
                    type="date"
                    name="titleSubmission"
                    value={formState.titleSubmission}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Proposal Submission</Form.Label>
                  <Form.Control
                    type="date"
                    name="proposalSubmission"
                    value={formState.proposalSubmission}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Proposal Defense</Form.Label>
                  <Form.Control
                    type="date"
                    name="proposalDefense"
                    value={formState.proposalDefense}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Deliverable 1</Form.Label>
                  <Form.Control
                    type="date"
                    name="deliverable1"
                    value={formState.deliverable1}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Deliverable 1 Evaluation</Form.Label>
                  <Form.Control
                    type="date"
                    name="deliverable1Evalutaion"
                    value={formState.deliverable1Evalutaion}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Deliverable 2</Form.Label>
                  <Form.Control
                    type="date"
                    name="deliverable2"
                    value={formState.deliverable2}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Deliverable 2 Evaluation</Form.Label>
                  <Form.Control
                    type="date"
                    name="deliverable2Evalutaion"
                    value={formState.deliverable2Evalutaion}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" disabled={!isFormValid}>
                  Save Changes
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
        </div>
      )}
      {isLoading && <SpinnerModal />}
    </div>
  );
};

export default Class;
