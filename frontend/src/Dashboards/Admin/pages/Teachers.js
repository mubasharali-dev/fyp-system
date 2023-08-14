import { useState, useEffect } from "react";
import { BiSearchAlt } from "react-icons/bi";
import { Form } from "react-bootstrap";
import { useSelector } from "react-redux";

import { ApiCall } from "../../../api/apiCall";

import TeacherComponent from "../../../Components/Teachers/TeacherComponent";
import Button from "../../../Components/UI/Button";
import SpinnerModal from "../../../Components/UI/SpinnerModal";
import classes from "./Teachers.module.css";

const Teachers = () => {
  const { token } = useSelector((state) => state.login.input);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadPage = async () => {
      const response = await ApiCall({
        params: {},
        route: `admin/teachers`,
        verb: "get",
        token,
        baseurl: true,
      });

      if (response && response.status === 200) {
        setTeachers(response.response.teachers);
        setIsLoading(false);
      } else {
        console.log(response);
        setIsLoading(false);
      }
    };
    loadPage();
  }, [token]);

  const searchHandler = (e) => {
    e.preventDefault();
    setSearchQuery(e.target.value);
  };

  const onSubmitSearchHandler = (e) => {
    e.preventDefault();
  };

  let teachersProfiles;

  if (!isLoading) {
    const filteredTeachers =
      teachers?.filter(
        (teacher) =>
          teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          teacher.empId.toLowerCase().includes(searchQuery.toLowerCase())
      ) || [];

    teachersProfiles =
      filteredTeachers.length > 0 ? (
        filteredTeachers.map((teacher) => {
          return <TeacherComponent key={teacher.id} teacher={teacher} />;
        })
      ) : (
        <p>No teachers to show</p>
      );
  }

  return (
    <div>
      {!isLoading && (
        <div className={classes.container}>
          <div className={classes.top}>
            <h4>All Teachers</h4>
            <Form className="d-flex" onSubmit={onSubmitSearchHandler}>
              <Form.Control
                className={`${classes.search} mr-2`}
                type="search"
                placeholder="Search ID or Name"
                onChange={searchHandler}
              />
              <Button type="submit">
                <BiSearchAlt />
              </Button>
            </Form>
          </div>
          <div className={classes.teachers}>{teachersProfiles}</div>
        </div>
      )}
      {isLoading && <SpinnerModal />}
    </div>
  );
};

export default Teachers;
