import React, { useState, useEffect, useCallback } from "react";
import { Form, ListGroup } from "react-bootstrap";
import { toast } from "react-toastify";

import { ApiCall } from "../../../api/apiCall";

import CustomCard from "../../../Components/UI/CustomCard";
import SpinnerModal from "../../../Components/UI/SpinnerModal";
import Button from "../../../Components/UI/Button";

import classes from "./PersonalNotes.module.css";

const PersonalNotes = ({ userId }) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadPage = useCallback(async () => {
    const response = await ApiCall({
      params: {
        userId: userId,
      },
      route: `teacher/personal-notes`,
      verb: "get",
      token: "jwt_token",
      baseurl: true,
    });

    if (response && response.status === 200) {
      setNotes(response.response.notes);
      setIsLoading(false);
    } else {
      console.log(response);
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await ApiCall({
      params: {
        note: newNote,
        userId,
      },
      route: `teacher/personal-notes/new-note`,
      verb: "post",
      token: "jwt_token",
      baseurl: true,
    });
    setIsLoading(true);
    if (response.status === 200) {
      toast.success(`${response.response.message}`);
    } else {
      toast.error(`${response.response.message}`);
    }

    loadPage();
    setNewNote("");
    console.log(response);
  };

  const handleDelete = async (id) => {
    const response = await ApiCall({
      params: {
        userId,
      },
      route: `teacher/personal-notes/${id}/delete`,
      verb: "delete",
      token: "jwt_token",
      baseurl: true,
    });
    setIsLoading(true);
    if (response.status === 200) {
      toast.success(`${response.response.message}`);
    } else {
      toast.error(`${response.response.message}`);
    }
    loadPage();
    console.log(response);
  };

  return (
    <div className={classes["main-container"]}>
      <CustomCard>
        <div className={classes.container}>
          <p className={classes.headline}>Your Personal Notes</p>
          <Form onSubmit={handleSubmit} className={classes.form}>
            <Form.Group controlId="notes">
              <Form.Control
                type="text"
                placeholder="Enter a new note"
                value={newNote}
                onChange={(event) => setNewNote(event.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit">Add</Button>
          </Form>
          {!isLoading &&
            !notes.length > 0 &&
            "You don't have personal notes, maybe create one!"}
          {isLoading && <SpinnerModal />}
          {!isLoading && notes.length > 0 && (
            <ListGroup className="my-3">
              {notes.map((note) => (
                <ListGroup.Item key={note.id}>
                  <div className={classes.item}>
                    <p className={classes.description}>{note.note}</p>
                    <Button onClick={() => handleDelete(note.id)}>
                      Delete
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>
      </CustomCard>
    </div>
  );
};

export default PersonalNotes;
