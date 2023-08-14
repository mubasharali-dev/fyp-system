import { useState, useEffect, useRef, Fragment } from "react";
import { useSelector } from "react-redux";

import { ApiCall } from "../../../api/apiCall";

import NoticeBoardComponent from "../../../Components/NoticeBoards/NoticeBoardComponent";
import NotificationsComponent from "../../../Components/Notifications/NotificationsComponent";
import SpinnerModal from "../../../Components/UI/SpinnerModal";
import CustomCard from "../../../Components/UI/CustomCard";
import classes from "./../AdminDashboard.module.css";

export const Dashboard = () => {
  const { token } = useSelector((state) => state.login.input);

  const [pageState, setPageState] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const errorRef = useRef(null);
  useEffect(() => {
    const fetchClasses = async () => {
      const response = await ApiCall({
        params: {},
        route: "admin/",
        verb: "get",
        token,
        baseurl: true,
      });

      if (response && response.status === 200) {
        setPageState(response?.response || {});
        setIsLoading(false);
        errorRef.current = null;
      } else {
        console.log(response);
        setIsLoading(false);
        errorRef.current = response.response.message + response.status;
      }
    };

    fetchClasses();
  }, [token]);

  return (
    <div>
      {!isLoading && (
        <div className={classes.container}>
          {errorRef.current ? (
            <p>{errorRef.current}</p>
          ) : (
            <Fragment>
              <div className={classes.left}>
                <div className={classes["card-container"]}>
                  <CustomCard>
                    <div className={classes.card}>
                      <p>Total Projects</p>
                      <h1>{pageState.projects.toString().padStart(2, "0")}</h1>
                    </div>
                  </CustomCard>
                  <CustomCard>
                    <div className={classes.card}>
                      <p>Total Classes</p>
                      <h1>{pageState.classes.toString().padStart(2, "0")}</h1>
                    </div>
                  </CustomCard>
                  <CustomCard>
                    <div className={classes.card}>
                      <p>Total Students</p>
                      <h1>{pageState.students.toString().padStart(2, "0")}</h1>
                    </div>
                  </CustomCard>
                  <CustomCard>
                    <div className={classes.card}>
                      <p>Total Supervisors</p>
                      <h1>
                        {pageState.supervisors.toString().padStart(2, "0")}
                      </h1>
                    </div>
                  </CustomCard>
                </div>
                <div>
                  <NotificationsComponent
                    notifications={pageState.notifications}
                  />
                </div>
              </div>
              <div>
                <NoticeBoardComponent
                  isAdmin={true}
                  reciever={true}
                  notices={pageState.notices}
                />
              </div>{" "}
            </Fragment>
          )}
        </div>
      )}
      {isLoading && <SpinnerModal />}
    </div>
  );
};

export default Dashboard;
