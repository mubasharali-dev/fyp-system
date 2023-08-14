import { Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useState } from "react";

import Button from "../UI/Button";
import classes from "./ProjectTable.module.css";

const ProjectTable = (props) => {
  const [limit, setLimit] = useState(6);

  const loadMoreHandler = () => {
    setLimit((prevlimit) => prevlimit + 3);
  };

  const tableBody = props.projects.slice(0, limit).map((project, index) => {
    const dynamicColumn =
      props.columnName === "Class" ? (
        <td className={classes.center}>{project.className}</td>
      ) : (
        <td className={classes.center}>{project.supervisorName}</td>
      );

    return (
      <tr key={index}>
        <td>{project.title}</td>
        <td className={classes.center}>{project.members}</td>
        {dynamicColumn}
        <td className={classes.center}>{project.status}</td>
      </tr>
    );
  });

  return (
    <div className={classes.container}>
      <div className={classes.head}>
        <p className={classes.name}>{props.label}</p>
        {props.button && (
          <Link to={"/projects/new-project"}>
            <Button>Add Project</Button>
          </Link>
        )}
      </div>

      {props.projects.length > 0 && (
        <Table responsive hover className={classes.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th className={classes.center}>Members</th>
              <th className={classes.center}>
                {props.columnName === "Class" ? "Class" : "Supervisor"}
              </th>
              <th className={classes.center}>Status</th>
            </tr>
          </thead>
          <tbody>{tableBody}</tbody>
        </Table>
      )}
      {props.projects.length === 0 && (
        <p style={{ color: "red" }}>There are no projects to show!</p>
      )}
      {limit < props.projects.length && (
        <p className={classes.load} onClick={loadMoreHandler}>
          Load More
        </p>
      )}
    </div>
  );
};

export default ProjectTable;
