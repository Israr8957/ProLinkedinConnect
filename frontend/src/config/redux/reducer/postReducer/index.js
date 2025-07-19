// const { createSlice } = require("@reduxjs/toolkit");
// const { getAllPosts } = require("../../action/postAction");

import { createSlice } from "@reduxjs/toolkit";
import { getAllComments, getAllPosts } from "../../action/postAction";

const initialState = {
  posts: [],
  isError: false,
  postFetched: false,
  isLoading: false,
  loggedIn: false,
  message: "",
  comments: [],
  postId: "",
};

const postSlice = createSlice({
  name: "post",
  initialState,

  reducers: {
    reset: () => initialState,
    resetPostId: (state) => {
      state.postId = "";
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getAllPosts.pending, (state) => {
        state.isLoading = true;
        state.message = "Fetched all the posts";
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.postFetched = true;
        state.posts = action.payload.posts.reverse();
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAllComments.fulfilled, (state, action) => {
        const allValues = Object.values(action.payload);
        // Extract post_id and comments
        const comments = allValues.filter(
          (item) => typeof item === "object" && item.body
        );
        state.postId = action.payload.post_id;
        state.comments = comments;
      });
  },
});

export const { resetPostId } = postSlice.actions;

export default postSlice.reducer;
