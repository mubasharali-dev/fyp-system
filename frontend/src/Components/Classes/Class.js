import { Link } from "react-router-dom";
import { MdOutlineDeleteForever } from "react-icons/md";
import Button from "../UI/Button";
import CustomCard from "../UI/CustomCard";
import classes from "./Class.module.css";

const Class = (props) => {
  const deleteClassHandler = (id) => {
    props.onDeleteClass(id);
  };

  return (
    <div className={classes.container}>
      <Link to={`./${props.item.id}`}>
        <CustomCard>
          <div className={classes.class}>
            <p className={classes.headline}>{props.item.name}</p>
            <p className={classes.item}>
              Total Students:<span>{props.item.totalStudents}</span>
            </p>
            <p className={classes.item}>
              Total Projects:<span>{props.item.totalProjects}</span>
            </p>
            <p className={classes.item}>
              Total Supervisors:<span>{props.item.assignedSupervisors}</span>
            </p>
          </div>
        </CustomCard>
      </Link>
      <div className={classes.buttons}>
        <MdOutlineDeleteForever
          className={classes.icon}
          onClick={() => deleteClassHandler(props.item.id)}
        />
        <Button onClick={props.passHandler}>Pass Class</Button>
      </div>
    </div>
  );
};

export default Class;
