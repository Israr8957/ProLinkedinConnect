import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import Comment from "../models/comments.model.js";
import ConnectionRequest from "../models/connections.model.js";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import Post from "../models/posts.model.js";

const convertUserDataToPDF = async (userData) => {
  const doc = new PDFDocument();
  const outputPath = crypto.randomBytes(32).toString("hex" + ".pdf");
  const stream = fs.createWriteStream("uploads/" + outputPath);
  doc.pipe(stream);

  doc.image(`uploads/${userData.userId.profilePicture}`, {
    align: "center",
    width: 100,
  });
  doc.fontSize(14).text(`Name:${userData.userId.name}`);
  doc.fontSize(14).text(`usename:${userData.userId.username}`);
  doc.fontSize(14).text(`Email:${userData.userId.email}`);
  doc.fontSize(14).text(`Bio:${userData.userId.bio}`);
  doc.fontSize(14).text(`Current Position:${userData.userId.currentPos}`);

  doc.fontSize(14).text("Past Work : ");
  userData.pastWork.forEach((work, index) => {
    doc.fontSize(14).text(`Company Name:${work.company}`);
    doc.fontSize(14).text(`Position:${work.position}`);
    doc.fontSize(14).text(`Years:${work.years}`);
  });
  doc.end();
  return outputPath;
};

const register = async (req, res) => {
  console.log(req.body.name);

  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All field required" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "user allready exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashPassword,
      username,
    });

    await newUser.save();

    const profile = new Profile({ userId: newUser._id });

    const pro = await profile.save();

    console.log("profile created", pro);

    return res.json({ message: "User created" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All field required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "invalid cridentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "invalid credentials " });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await User.updateOne({ _id: user._id }, { token });

    return res.json({ token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const uploadProfilePicture = async (req, res) => {
  const { token } = req.body;

  try {
    const user = User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    user.profilePicture = req.file.filename;

    await user.save();
    return res.json({ message: "Profile picture uploaded" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { token, ...newUserData } = req.body;

    const user = await User.findOne({ token });
    if (!user) {
      res.status(404).json({ message: "user not found" });
    }

    const { username, email } = newUserData;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      if (existingUser || String(existingUser._id) !== String(user._id)) {
        return res.status(404).json({ message: "user already exist" });
      }
    }

    Object.assign(user, newUserData);
    await user.save();
    return res.json("user Updated");
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUserAndProfile = async (req, res) => {
  try {
    const { token } = req.query;

    //console.log(token);

    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email  username profilePicture"
    );

    if (!userProfile) {
      return res.status(404).json({ message: "user profile not found" });
    }

    return res.json({ userProfile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateProfileData = async (req, res) => {
  try {
    const { token, ...newProfileDta } = req.body;

    const userProfile = await User.findOne({ token: token });
    if (!userProfile) {
      return res.status(404).json({ message: "user not found " });
    }

    const profile_to_update = await Profile.findOne({
      userId: userProfile._id,
    });

    if (!profile_to_update) {
      return res.status(404).json({ message: "Profile not found " });
    }

    Object.assign(profile_to_update, newProfileDta);

    await profile_to_update.save();

    return res.json({ message: "profile data updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllUserProfile = async (req, res) => {
  try {
    const profile = await Profile.find({}).populate(
      "userId",
      "name username email"
    );

    if (!profile) {
      return res.status(404).json({ message: "no profile exist" });
    }
    res.json({ profile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const downloadProfile = async (req, res) => {
  const user_Id = req.query.id;
  try {
    const userProfile = await Profile.findOne({ userId: user_Id }).populate(
      "userId",
      "name username email"
    );

    if (!userProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    let outputPath = await convertUserDataToPDF(userProfile);
    return res.json({ message: outputPath });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return res.status(500).json({ message: error.message });
  }
};

const sendConnectionRequest = async (req, res) => {
  const { token, connectionId } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connectionUser = await User.findOne({ _id: connectionId });
    if (!connectionUser) {
      return res.status(404).json({ message: "Connection User not found" });
    }

    const existingRequest = await ConnectionRequest.findOne({
      userId: user._id,
      connectionId: connectionUser._id,
    });

    if (existingRequest) {
      return res.status(404).json({ message: "Request already send" });
    }

    const request = new ConnectionRequest({
      userId: user._id,
      connectionId: connectionUser._id,
    });

    await request.save();
    return res.json({ message: "Request  send" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const myConnectionRequests = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connections = await ConnectionRequest.find({
      userId: user._id,
    }).populate("userId", "name username email profilePicture");

    if (!connections) {
      return res.status(404).json({ message: "Request Connections not found" });
    }

    return res.json({ connections });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const whatAreMyConnections = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connections = await ConnectionRequest.find({
      connectionId: user._id,
    }).populate("userId", "name username email profilePicture");

    if (!connections) {
      return res.status(404).json({ message: "Request Connections not found" });
    }

    return res.json({ connections });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const acceptConnectionRequest = async (req, res) => {
  try {
    const { token, requestId, action_type } = req.body;

    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connection = await ConnectionRequest.findOne({
      _id: requestId,
    });

    if (!connection) {
      return res.status(404).json({ message: " Connection not found" });
    }

    if (action_type == "accept") {
      connection.status_accepted = true;
    } else {
      connection.status_accepted = false;
    }
    connection.save();
    return res.json({ message: "request Updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const commentPost = async (req, res) => {
  const { token, post_id, commentBody } = req.body;

  try {
    const user = await User.findOne({ token: token }).select("userId");
    if (!user) {
      return res.status(404).json({ message: "Unauthorised User" });
    }

    const post = await Post.findOne({ _id: post_id });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = new Comment({
      userId: user._id,
      postId: post._id,
      body: commentBody,
    });

    await comment.save();

    return res.status(200).json({ message: "comment added" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getCommentByPost = async (req, res) => {
  const { post_id } = req.query;

  try {
    const post = await Post.findOne({ _id: post_id });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comments = await Comment.find({ postId: post._id }).populate(
      "userId",
      "username name"
    );

    return res.json(comments.reverse());
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteCommentOfUser = async (req, res) => {
  const { token, comment_id } = req.body;

  try {
    const user = await User.findOne({ token: token }).select("userId");
    if (!user) {
      return res.status(404).json({ message: " User not found" });
    }

    const comment = await Comment.findOne({ _id: comment_id });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId.toString() !== user._id.toString()) {
      return res.status(401).json({ message: "Unauthorised User" });
    }

    await Comment.deleteOne({ _id: comment_id });
    return res.json({ message: "Comment deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const incrementLikes = async (req, res) => {
  const { post_id } = req.body;

  try {
    const post = await Post.findOne({ _id: post_id });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.likes = post.likes + 1;
    await post.save();

    return res.json({ message: "Post liked" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUserProfileANdUserBasedOnUsername = async (req, res) => {
  const { username } = req.query;
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture"
    );
    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }
    return res.json({ profile: userProfile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export {
  register,
  login,
  uploadProfilePicture,
  updateUserProfile,
  getUserAndProfile,
  updateProfileData,
  getAllUserProfile,
  downloadProfile,
  sendConnectionRequest,
  myConnectionRequests,
  whatAreMyConnections,
  acceptConnectionRequest,
  commentPost,
  getCommentByPost,
  deleteCommentOfUser,
  incrementLikes,
  getUserProfileANdUserBasedOnUsername,
};
