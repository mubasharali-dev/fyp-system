import { Table, Modal } from "react-bootstrap";
import { MultiSelect } from "react-multi-select-component";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import { toast } from "react-toastify";

import { ApiCall } from "../../api/apiCall";
import Button from "../UI/Button";
import classes from "./SupervisorsTable.module.css";

const ExaminersTable = (props) => {
  // const { examiners } = props;
  const { token } = useSelector((state) => state.login.input);

  const [examiners, setExaminers] = useState(props.examiners);

  const [limit, setLimit] = useState(4);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const { classId } = useParams();

  const loadMoreHandler = () => {
    setLimit((prevlimit) => prevlimit + 3);
  };

  const tableBody = examiners.slice(0, limit).map((examiner) => {
    return (
      <tr key={examiner.id}>
        <td>{examiner.name}</td>
        <td className={classes.center}>{examiner.empId}</td>
        <td className={classes.center}>{examiner.designation}</td>
      </tr>
    );
  });

  const handleAddExaminer = () => {
    const loadTeachers = async () => {
      try {
        const response = await ApiCall({
          params: { classId },
          route: "admin/forms/add-examiner/data",
          verb: "get",
          token,
          baseurl: true,
        });

        const teachers = response.response.teachers;
        const teacherOptions = teachers.map((teacher) => ({
          value: teacher.id,
          label: teacher.name,
        }));
        setTeachers(teacherOptions);
      } catch (error) {
        console.log(error);
      }
    };
    loadTeachers();
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleModalSubmit = async () => {
    const members = selected.map((examiner) => ({
      id: examiner.value,
      name: examiner.label,
    }));

    try {
      const response = await ApiCall({
        params: {
          examiners: members,
        },
        route: `admin/classes/${classId}/assign-examiner`,
        verb: "patch",
        token,
        baseurl: true,
      });
      console.log(response.response);

      if (response.status === 200) {
        toast.success(`${response.response.message}`);
      } else {
        toast.error(`${response.response.message}`);
      }

      setSelected([]);
      const updatedExaminers = response.response.updatedExaminers;
      setExaminers(updatedExaminers);
    } catch (error) {
      console.log(error);
    }
    setShowModal(false);
  };

  return (
    <div className={classes.container}>
      <div className={classes.head}>
        <p className={classes.name}>Examiners</p>
        <Button onClick={handleAddExaminer}>Add Examiner</Button>
      </div>
      {examiners.length > 0 && (
        <Table responsive hover className={classes.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th className={classes.center}>Emp ID</th>
              <th className={classes.center}>Designation</th>
            </tr>
          </thead>
          <tbody>{tableBody}</tbody>
        </Table>
      )}
      {examiners.length === 0 && (
        <p style={{ color: "red" }}>There are no examiners to show!</p>
      )}
      {limit < examiners.length && (
        <p className={classes.load} onClick={loadMoreHandler}>
          Load More
        </p>
      )}

      <Modal backdrop="static" show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Examiner</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <MultiSelect
              name="examiners"
              options={teachers}
              value={selected}
              onChange={setSelected}
              overrideStrings={{
                noOptions: "No options or all teachers are assigned already",
              }}
              // hasSelectAll={("hasSelectAll", false)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleModalSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ExaminersTable;
