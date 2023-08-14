import React, { useState } from "react";
import { Table, Button, Form } from "react-bootstrap";

import styles from "./Submissions.module.css";

const Submissions = () => {
  const [file, setFile] = useState(null);
  const [submissions, setSubmissions] = useState([
    {
      id: 1,
      projectId: 1,
      deliverableType: "Proposal",
      submissionFile: null,
      submissionStatus: "Not submitted",
      submissionDate: null,
    },
    {
      id: 2,
      projectId: 1,
      deliverableType: "Deliverable 1",
      submissionFile: null,
      submissionStatus: "Not submitted",
      submissionDate: null,
    },
    {
      id: 3,
      projectId: 1,
      deliverableType: "Deliverable 2",
      submissionFile: null,
      submissionStatus: "Not submitted",
      submissionDate: null,
    },
  ]);

  const handleSubmit = (submissionId, event) => {
    event.preventDefault();
    const updatedSubmissions = [...submissions];
    const submissionIndex = updatedSubmissions.findIndex(
      (submission) => submission.id === submissionId
    );
    updatedSubmissions[submissionIndex].submissionStatus = "Submitted";
    updatedSubmissions[submissionIndex].submissionDate = new Date();
    updatedSubmissions[submissionIndex].submissionFile = file;
    setSubmissions(updatedSubmissions);
    setFile(null); // Reset the state variable for the next submission
  };

  const handleResubmit = (submissionId, event) => {
    event.preventDefault();
    const updatedSubmissions = [...submissions];
    const submissionIndex = updatedSubmissions.findIndex(
      (submission) => submission.id === submissionId
    );
    updatedSubmissions[submissionIndex].submissionStatus = "Not submitted";
    updatedSubmissions[submissionIndex].submissionFile = null;
    setSubmissions(updatedSubmissions);
  };

  return (
    <Table striped bordered hover className={styles.table}>
      <thead>
        <tr>
          <th>Deliverable Type</th>
          <th>Submission Status</th>
          <th>Submission Date</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {submissions.map((submission) => (
          <tr key={submission.id} className={styles.row}>
            <td>{submission.deliverableType}</td>
            <td>{submission.submissionStatus}</td>
            <td>
              {submission.submissionDate
                ? submission.submissionDate.toLocaleString()
                : "-"}
            </td>
            <td>
              {submission.submissionStatus === "Not submitted" && (
                <Form className={styles.form}>
                  <div className="m-3">
                    <input
                      type="file"
                      className={styles.input}
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                  </div>
                  <Button
                    type="submit"
                    onClick={(event) => handleSubmit(submission.id, event)}
                  >
                    Submit
                  </Button>
                </Form>
              )}
              {submission.submissionStatus === "Rejected" && (
                <Button
                  onClick={(event) => handleResubmit(submission.id, event)}
                >
                  Resubmit
                </Button>
              )}
              {(submission.submissionStatus === "Submitted" ||
                submission.submissionStatus === "Approved") && (
                <Button disabled>{submission.submissionStatus}</Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default Submissions;
