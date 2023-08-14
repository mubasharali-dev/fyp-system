import classes from "./CustomCard.module.css";

const CustomCard = (props) => {
  return (
    <div
      className={`${classes.card} ${props.onClick ? classes.button : ""}`}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
};

export default CustomCard;
