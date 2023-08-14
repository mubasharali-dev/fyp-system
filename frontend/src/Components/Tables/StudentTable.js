import { Table } from "react-bootstrap";
import { useState } from "react";

import classes from "./SupervisorsTable.module.css";

const StudentsTable = (props) => {
  const [limit, setLimit] = useState(10);

  const loadMoreHandler = () => {
    setLimit((prevlimit) => prevlimit + 5);
  };

  const tableBody = props.students.slice(0, limit).map((student) => {
    return (
      <tr key={student.id}>
        <td>{student.name}</td>
        <td className={classes.center}>{student.rollNo}</td>
        <td className={classes.center}>{student.marks}</td>
        <td className={classes.center}>{student.hasTopped ? "Yes" : "No"}</td>
      </tr>
    );
  });

  return (
    <div className={classes.container}>
      <div className={classes.head}>
        <p className={classes.name}>Students</p>
      </div>
      {props.students.length > 0 && (
        <Table responsive hover className={classes.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th className={classes.center}>Roll No</th>
              <th className={classes.center}>Marks</th>
              <th className={classes.center}>Project Leader</th>
            </tr>
          </thead>
          <tbody>{tableBody}</tbody>
        </Table>
      )}
      {props.students.length === 0 && (
        <p style={{ color: "red" }}>There are no students to show!</p>
      )}
      {limit < props.students.length && (
        <p className={classes.load} onClick={loadMoreHandler}>
          Load More
        </p>
      )}
    </div>
  );
};

export default StudentsTable;
