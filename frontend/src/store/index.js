import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";

const store = configureStore({
  reducer: {
    login: authSlice.reducer,
    logout: authSlice.reducer,
  },
});

export default store;
