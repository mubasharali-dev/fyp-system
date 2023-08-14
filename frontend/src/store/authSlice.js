import { createSlice } from "@reduxjs/toolkit";

const token = localStorage.getItem("token") || "";
const user_id = localStorage.getItem("user_id") || "";
const userID = localStorage.getItem("userID") || "";
const password = localStorage.getItem("password") || "";
const loginAs = localStorage.getItem("loginAs") || "";
const userName = localStorage.getItem("userName") || "";

const initialState = {
  input: {
    token: token,
    userID: userID,
    password: password,
    user_id: user_id,
    loginAs: loginAs,
    rememberMe: false,
    userName: userName,
  },
  auth: {
    uid: userID && password && token,
  },
};

const authSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    login: (state, action) => {
      state.input = action.payload;
      state.auth.uid = true;
    },
    logout: (state) => {
      localStorage.removeItem("email");
      localStorage.removeItem("password");
      localStorage.removeItem("loginAs");
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");

      state.input = initialState.input;
      state.auth.uid = initialState.auth.uid;
    },
  },
});

export const authActions = authSlice.actions;

export default authSlice;
