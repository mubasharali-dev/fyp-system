import { Table, Modal } from "react-bootstrap";
import { MultiSelect } from "react-multi-select-component";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ApiCall } from "../../api/apiCall";
import Button from "../UI/Button";
import classes from "./SupervisorsTable.module.css";

const SupervisorsTable = (props) => {
  const { token } = useSelector((state) => state.login.input);
  const [supervisors, setSupervisors] = useState(props.supervisors);
  const [limit, setLimit] = useState(3);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const { classId } = useParams();
  const loadMoreHandler = () => {
    setLimit((prevlimit) => prevlimit + 3);
  };

  const tableBody = supervisors.slice(0, limit).map((supervisor, index) => {
    return (
      <tr key={index}>
        <td>{supervisor.name}</td>
        <td className={classes.center}>{supervisor.empId}</td>
        <td className={classes.center}>{supervisor.assignedProjectsCount}</td>
        <td className={classes.center}>{supervisor.projectsLimit}</td>
      </tr>
    );
  });

  const handleAddSupervisor = () => {
    const loadTeachers = async () => {
      try {
        const response = await ApiCall({
          params: { classId },
          route: "admin/forms/add-supervisor/data",
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
    const members = selected.map((supervisor) => ({
      id: supervisor.value,
      name: supervisor.label,
    }));

    try {
      const response = await ApiCall({
        params: {
          supervisors: members,
        },
        route: `admin/classes/${classId}/assign-supervisor`,
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
      const updatedSupervisors = response.response.updatedSupervisors;
      setSupervisors(updatedSupervisors);
    } catch (error) {
      console.log(error);
    }
    setShowModal(false);
  };

  return (
    <div className={classes.container}>
      <div className={classes.head}>
        <p className={classes.name}>Supervisors</p>
        <Button onClick={handleAddSupervisor}>Add Supervisor</Button>
      </div>
      {props.supervisors.length > 0 && (
        <Table responsive hover className={classes.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th className={classes.center}>Emp ID</th>
              <th className={classes.center}>Undertaken</th>
              <th className={classes.center}>Limit</th>
            </tr>
          </thead>
          <tbody>{tableBody}</tbody>
        </Table>
      )}
      {props.supervisors.length === 0 && (
        <p style={{ color: "red" }}>There are no supervisors to show!</p>
      )}
      {limit < props.supervisors.length && (
        <p className={classes.load} onClick={loadMoreHandler}>
          Load More
        </p>
      )}

      <Modal backdrop="static" show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Supervisor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <MultiSelect
              name="memberNames"
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

export default SupervisorsTable;
