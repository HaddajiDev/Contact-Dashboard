import { configureStore } from "@reduxjs/toolkit";
import messageSlice from "./MessageSlice";

export const store = configureStore({
  reducer: {
    message: messageSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;