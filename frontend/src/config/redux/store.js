/**
 *
 * Steps for state Management
 * Submit action
 * handle action in it's reducer
 * Register here->reducer
 */

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authReducer";
import postReducer from "./reducer/postReducer";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    postReducer: postReducer,
  },
});
