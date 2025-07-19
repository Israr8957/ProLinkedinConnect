import { Router } from "express";
import {
  login,
  register,
  updateUserProfile,
  uploadProfilePicture,
  getUserAndProfile,
  updateProfileData,
  getAllUserProfile,
  downloadProfile,
  sendConnectionRequest,
  myConnectionRequests,
  whatAreMyConnections,
  acceptConnectionRequest,
  getUserProfileANdUserBasedOnUsername,
} from "../controllers/user.controllers.js";
import multer from "multer";
const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router
  .route("/upload_profile_picture")
  .post(upload.single("profile_picture"), uploadProfilePicture);
// ex thunderclient {
// profile_picture:/path
//}

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/user_update").post(updateUserProfile);
router.route("/get_user_and_profile").get(getUserAndProfile);
router.route("/update_profile_data").get(updateProfileData);
router.route("/user/get_all_userProfile").get(getAllUserProfile);
router.route("/user/download_resume").get(downloadProfile);
router.route("/user/send_connection_request").post(sendConnectionRequest);
router.route("/user/getConnectionRequests").get(myConnectionRequests);
router.route("/user/user_connection_request").get(whatAreMyConnections);
router.route("/user/accept_connection_request").post(acceptConnectionRequest);
router
  .route("/user/get_profile_based_on_username")
  .get(getUserProfileANdUserBasedOnUsername);

export default router;
