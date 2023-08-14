import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import { ApiCall } from "../../../api/apiCall";

import SpinnerModal from "../../../Components/UI/SpinnerModal";
import CustomCard from "../../../Components/UI/CustomCard";
import Button from "../../../Components/UI/Button";

import classes from "./Project.module.css";

const Project = () => {
  const { token } = useSelector((state) => state.login.input);
  const [pageState, setPageState] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { projectId } = useParams();
  const navigate = useNavigate();

  let members;

  useEffect(() => {
    const loadPage = async () => {
      const response = await ApiCall({
        params: { projectId },
        route: `admin/projects/${projectId}`,
        verb: "get",
        token,
        baseurl: true,
      });

      if (response && response.status === 200) {
        setPageState(response.response);
        setIsLoading(false);
      } else {
        console.log(response);
        setIsLoading(false);
      }
    };
    loadPage();
  }, [projectId, token]);

  if (!isLoading) {
    members = pageState.project.memberNames.map((member) => {
      return (
        <span key={member.id}>
          {member.name}
          <br />
        </span>
      );
    });
  }

  const projectDeleteHandler = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await ApiCall({
        params: { id },
        route: `admin/projects/${id}/delete`,
        verb: "delete",
        token,
        baseurl: true,
      });

      if (response && response.status === 200) {
        setPageState(response.response);
        setIsLoading(false);
        navigate(-1);
        console.log(response);
      } else {
        console.log(response);
        setIsLoading(false);
      }

      if (response.status === 200) {
        toast.success(`${response.response.message}`);
      } else {
        toast.error(`${response.response.message}`);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete project.");
    }
  };
  return (
    <div>
      {!isLoading && (
        <div className={classes.container}>
          <CustomCard>
            <div className={classes.project}>
              <p className={classes.headline}>{pageState.project.title}</p>
              <div className={classes.item}>
                <p>Project ID:</p>
                <span> {pageState.project.id}</span>
              </div>
              <div className={classes.item}>
                <p>Class:</p>
                <span> {pageState.project.className}</span>
              </div>

              <div className={classes.item}>
                <p>Project Members:</p>
                <span>{members}</span>
              </div>

              <div className={classes.item}>
                <p>Project Supervisor:</p>
                <span>{pageState.project.supervisorName}</span>
              </div>
              <div className={classes.item}>
                <p>Project Description:</p>
                <span>{pageState.project.description}</span>
              </div>
              <div className={`${classes.item} ${classes.buttons}`}>
                <Button
                  onClick={() => projectDeleteHandler(pageState.project.id)}
                >
                  Delete Project
                </Button>
                <Link to={"./edit"}>
                  <Button>Edit Project</Button>
                </Link>
              </div>
            </div>
          </CustomCard>
        </div>
      )}
      {isLoading && <SpinnerModal />}
    </div>
  );
};

export default Project;
