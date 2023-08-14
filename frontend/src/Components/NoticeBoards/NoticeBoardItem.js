import { MdOutlineDeleteForever } from "react-icons/md";

import classes from "./NoticeBoardItem.module.css";

const NoticeBoardItem = (props) => {
  const isAdmin = props.isAdmin;
  const entity = props.item.receiverEntity === "class" ? "Class" : "Teacher";

  const deleteNoticeHandler = (id) => {
    props.onDeleteNotice(id);
  };

  return (
    <div className={classes.container}>
      <div className={classes.text}>
        <p className={classes.headline}>{props.item.headline}</p>
        <p className={classes.description}>{props.item.description}</p>
        {props.reciever && (
          <p className={classes.reciever}>
            {entity}: <span>{props.item.receiverName}</span>
          </p>
        )}
        <hr />
      </div>
      {isAdmin && (
        <MdOutlineDeleteForever
          className={classes.icon}
          onClick={() => deleteNoticeHandler(props.item.id)}
        />
      )}
    </div>
  );
};

export default NoticeBoardItem;
