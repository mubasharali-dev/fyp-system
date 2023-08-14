import { NavLink } from "react-router-dom";

import Topbar from "./Topbar";

import "./Sidebar.css";

const Sidebar = (props) => {
  let sidebarLinks = props.links.map((link, index) => {
    return (
      <NavLink
        to={link.path}
        key={index}
        className={
          link.name === "Dashboard" || link.path === "/"
            ? "link dashboard"
            : "link"
        }
      >
        <div className={"icon"}>{link.icon}</div>
        <div className={"link_text"}>{link.name}</div>
      </NavLink>
    );
  });

  return (
    <>
      <div className={"main_container"}>
        <div className={"sidebar"}>
          <p className={"title"}>Final Year Project Management System</p>
          <section className={"routes"}>{sidebarLinks}</section>
        </div>

        <main>
          <Topbar user={props.user} />
          <div style={{ paddingLeft: "20px" }}>{props.children}</div>
        </main>
      </div>
    </>
  );
};

export default Sidebar;
