import { useState } from "react";
import { Table, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BiSearchAlt } from "react-icons/bi";

import Button from "../UI/Button";
import classes from "./DetailedProjectTable.module.css";

const DetailedProjectTable = (props) => {
  const { label, projects } = props;

  const [limit, setLimit] = useState(15);
  const [searchQuery, setSearchQuery] = useState("");

  const loadMoreHandler = () => {
    setLimit((prevlimit) => prevlimit + 3);
  };

  const searchHandler = (e) => {
    e.preventDefault();
    setSearchQuery(e.target.value);
  };

  const onSubmitSearchHandler = (e) => {
    e.preventDefault();
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tableBody = filteredProjects.slice(0, limit).map((project, index) => {
    const members = project.memberNames.map((member) => {
      return <span key={member.id}>{member.name.split(" ")[0]}, </span>;
    });
    return (
      <tr key={index}>
        <td>{project.title}</td>
        <td className={classes.center}>{members}</td>
        <td className={classes.center}>{project.supervisorName}</td>
        <td className={classes.center}>{project.className}</td>
        <td className={classes.center}>{project.status}</td>
        <td className={classes.center}>
          <Link to={`./${project.id}`}>
            <Button>Details</Button>
          </Link>
        </td>
      </tr>
    );
  });

  return (
    <div className={classes.container}>
      <div className={classes.head}>
        <p className={classes.name}>{label}</p>
        <Form className="d-flex" onSubmit={onSubmitSearchHandler}>
          <Form.Control
            className={`${classes.search} mr-2`}
            type="search"
            placeholder="Search Project ID/Title"
            onChange={searchHandler}
          />
          <Button type="submit">
            <BiSearchAlt />
          </Button>
        </Form>
        {props.button && (
          <Link to={"/projects/new-project"}>
            <Button>Add Project</Button>
          </Link>
        )}
      </div>
      {projects.length > 0 && (
        <Table responsive hover className={classes.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th className={classes.center}>Members</th>
              <th className={classes.center}>Supervisor</th>
              <th className={classes.center}>Class</th>
              <th className={classes.center}>Status</th>
              <th className={classes.center}></th>
            </tr>
          </thead>
          <tbody>{tableBody}</tbody>
        </Table>
      )}
      {projects.length === 0 && (
        <p style={{ color: "red" }}>There are no projects to show!</p>
      )}
      {limit < projects.length && (
        <p className={classes.load} onClick={loadMoreHandler}>
          Load More
        </p>
      )}
    </div>
  );
};

export default DetailedProjectTable;
