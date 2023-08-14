import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";

import Button from "../../Components/UI/Button";
import classes from "./TeacherComponent.module.css";

const TeacherComponent = (props) => {
  return (
    <div className={classes.container}>
      <img className={classes.img} src={"/images/teachers.jpg"} alt="teacher" />
      <Card className={`${classes.box} text-center`} style={{ width: "15rem" }}>
        <Card.Body className={classes.card}>
          <Card.Title>{props.teacher.name}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            {props.teacher.designation}
          </Card.Subtitle>
          <Card.Text>
            Emp ID: <span>{props.teacher.empId}</span>
          </Card.Text>
          {props.button === false ? (
            ""
          ) : (
            <Link to={`./${props.teacher.id}`}>
              <Button>Details</Button>
            </Link>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default TeacherComponent;
