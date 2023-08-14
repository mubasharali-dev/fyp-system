import React from "react";
import "./Button.module.css";

function Button(props) {
  const { children, onClick, type, disabled } = props;

  return (
    <button type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export default Button;
