import { asyncThunkCreator, createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "@/config";

export const loginUser = createAsyncThunk(
  "user/login",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/login", {
        email: user.email,
        password: user.password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      } else {
        return thunkAPI.rejectWithValue({ message: "token not provided" });
      }
      return thunkAPI.fulfillWithValue(response.data.token);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {
      console.log("Register payload:", user);

      const response = await clientServer.post("/register", {
        name: user.name,
        email: user.email,
        password: user.password,
        username: user.username,
      });
      console.log(response.data);

      return response.data;
    } catch (error) {
      //console.error("Register error:", error);
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const getAboutUser = createAsyncThunk(
  "user/getAboutUser",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("get_user_and_profile", {
        params: {
          token: user.token,
        },
      });

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("user/get_all_userProfile");

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const sendConnectionRequest = createAsyncThunk(
  "user/sendConnectionRequest",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post(
        "/user/send_connection_request",
        {
          token: user.token,
          connectionId: user.userId,
        }
      );

      thunkAPI.dispatch(getConnectionRequest({ token: user.token }));

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const getConnectionRequest = createAsyncThunk(
  "user/getConnectionRequest",
  async (user, thunkAPI) => {
    try {
      const responce = await clientServer.get("/user/getConnectionRequest", {
        params: {
          token: user.token,
        },
      });
      return thunkAPI.fulfillWithValue(responce.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const getMyConnectionRequests = createAsyncThunk(
  "user/getMyConnectionRequests",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/user_connection_request", {
        params: {
          token: user.token,
        },
      });
      return thunkAPI.fulfillWithValue(response.data.connections);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const acceptConnectionRequest = createAsyncThunk(
  "user/acceptConnectionRequest",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post(
        "/user/accept_connection_request",
        {
          token: user.token,
          requestId: user.connectionId,
          action_type: user.action,
        }
      );

      thunkAPI.dispatch(getConnectionRequest({ token: user.token }));
      thunkAPI.dispatch(getMyConnectionRequests({ token: user.token }));

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);
