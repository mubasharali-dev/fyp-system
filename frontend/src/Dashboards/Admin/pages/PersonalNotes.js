import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Form, ListGroup } from "react-bootstrap";

import { ApiCall } from "../../../api/apiCall";

import CustomCard from "../../../Components/UI/CustomCard";
import SpinnerModal from "../../../Components/UI/SpinnerModal";
import Button from "../../../Components/UI/Button";

import classes from "./PersonalNotes.module.css";
import { toast } from "react-toastify";

const PersonalNotes = () => {
  const { input } = useSelector((state) => state.login);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadPage = useCallback(async () => {
    const response = await ApiCall({
      params: {
        role: input.loginAs,
      },
      route: `admin/personal-notes`,
      verb: "get",
      token: input.token,
      baseurl: true,
    });

    if (response && response.status === 200) {
      setNotes(response.response.notes);
      setIsLoading(false);
    } else {
      console.log(response);
      setIsLoading(false);
    }
  }, [input.loginAs, input.token]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  // console.log(notes);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await ApiCall({
      params: {
        role: input.loginAs,
        note: newNote,
      },
      route: `admin/personal-notes/new-note`,
      verb: "post",
      token: input.token,
      baseurl: true,
    });
    setIsLoading(true);
    if (response.status === 200) {
      toast.success(response.response.message);
    } else {
      toast.error(response.response.message);
    }
    loadPage();
    setNewNote("");
    console.log(response);
  };

  const handleDelete = async (id) => {
    console.log(input.loginAs);

    const response = await ApiCall({
      params: {},
      route: `admin/personal-notes/${id}/delete`,
      verb: "delete",
      token: input.token,
      baseurl: true,
    });
    if (response.status === 200) {
      toast.success(response.response.message);
    } else {
      toast.error(response.response.message);
    }
    loadPage();
    setIsLoading(true);
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
