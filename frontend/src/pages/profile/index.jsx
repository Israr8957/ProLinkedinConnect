import { getAboutUser, getAllUsers } from "@/config/redux/action/authAction";
import DashboardLayout from "@/layout/dashboardLayout";
import UserLayout from "@/layout/userLayout";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";
import { BASE_URL, clientServer } from "@/config";
import { getAllPosts } from "@/config/redux/action/postAction";

export default function ProfilePage() {
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);
  const postReducer = useSelector((state) => state.postReducer);

  const [userProfile, setUserProfile] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [inputData, setInPinputData] = useState({
    company: "",
    position: "",
    years: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInPinputData({ ...inputData, [name]: value });
  };

  // useEffect(async () => {
  //   await dispatch(getAboutUser({ token: localStorage.getItem("token") }));
  //   await dispatch(getAllPosts());
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(getAboutUser({ token: localStorage.getItem("token") }));
      await dispatch(getAllPosts());
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (authState.user != undefined) {
      setUserProfile(authState.user);

      let post = postReducer.posts.filter((post) => {
        return post.userId?.username === authState.user.userId.username;
      });
      setUserPosts(post); //there is some issue
    }
  }, [authState.user, postReducer.posts]);

  const updateProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append("profile_picture", file);
    formData.append("token", localStorage.getItem("token"));

    const response = await clientServer.post(
      "/update_profile_picture",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
  };

  const updateprofileData = async () => {
    await clientServer.post("/user_update", {
      token: localStorage.getItem("token"),
      name: userProfile.userId.user,
    });

    await clientServer.post("/update_profile_data", {
      token: localStorage.getItem("token"),
      bio: userProfile.bio,
      currentPost: userProfile.currentPost, // ✅ fixed typo
      postWork: userProfile.postWork,
      education: userProfile.education,
    });

    dispatch(getAboutUser({ token: localStorage.getItem("token") }));
  };

  return (
    <UserLayout>
      <DashboardLayout>
        {authState.user && userProfile.userId && (
          <div className={styles.container}>
            <div className={styles.bsckDropContainer}>
              <label
                htmlFor="profilepictureUpload"
                className={styles.backdrop__overlay}
              >
                <p>Edit</p>
              </label>
              <input
                onChange={(e) => {
                  updateProfilePicture(e.target.files[0]);
                }}
                hidden
                type="file"
                id="profilepictureUpload"
              />
              <img
                className={styles.backDrop}
                src={`${BASE_URL}/${userProfile.userId.profilePicture}`}
                alt="profilePic"
              />
            </div>

            <div className={styles.profileContainer_details}>
              <div style={{ display: "flex", gap: "0.7rem" }}>
                <div style={{ flex: "0.8rem" }}>
                  <div
                    style={{
                      display: "flex",
                      width: "fit-content",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="text"
                      className={styles.nameEdit}
                      value={userProfile.userId.name}
                      onChange={(e) => {
                        setUserProfile({
                          ...userProfile,
                          userId: {
                            ...userProfile.userId,
                            name: e.target.value,
                          },
                        });
                      }}
                    />
                    <p style={{ color: "gray" }}>
                      @{userProfile.userId.username}
                    </p>
                  </div>

                  <textarea
                    value={userProfile.bio}
                    placeholder="Write something about yourself..."
                    onChange={(e) => {
                      setUserProfile({ ...userProfile, bio: e.target.value });
                    }}
                    rows={Math.max(3, Math.ceil(userProfile.bio.length / 80))}
                    style={{ width: "100%" }}
                  ></textarea>
                </div>

                <div style={{ flex: "0.2rem" }}>
                  <h3>Recent Activity</h3>
                  {userPosts.map((post) => {
                    return (
                      <div key={post._id} className={styles.postCard}>
                        <div className={styles.card}>
                          <div className={styles.card_profileContainer}>
                            {post.media !== "" ? (
                              <img
                                src={`${BASE_URL}/${post.media}`}
                                alt="postImage"
                              />
                            ) : (
                              <div
                                style={{ width: "3.4rem", height: "3.4rem" }}
                              ></div>
                            )}
                          </div>

                          <div className="workHistory">
                            <h4>Work History</h4>
                            <div className={styles.workHistoryContainer}>
                              {userProfile.postWork.map((work, index) => {
                                return (
                                  <div
                                    key={index}
                                    className={styles.workHistoryCard}
                                  >
                                    <p>
                                      {work.company} - {work.position}
                                    </p>
                                    <p>{work.year}</p>
                                  </div>
                                );
                              })}

                              <button
                                className={styles.addWorkButton}
                                onClick={() => {
                                  setIsModalOpen(true);
                                }}
                              >
                                Add Work
                              </button>
                            </div>
                          </div>
                          {userProfile != authState.user && (
                            <div
                              onClick={() => {
                                updateprofileData();
                              }}
                              className={styles.updateProfile}
                            >
                              Update profile
                            </div>
                          )}
                          {/* <p>{post.body}</p> */}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div
            onClick={() => {
              setIsModalOpen(false);
            }}
            className={styles.commentsContainer}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
              className={styles.allCommentsContainer}
            >
              <input
                onChange={handleInputChange}
                name="company"
                type="text"
                className={styles.inputField}
                placeholder="Enter Company"
              />
              <input
                onChange={handleInputChange}
                name="position"
                type="text"
                className={styles.inputField}
                placeholder="Enter Position"
              />
              <input
                onChange={handleInputChange}
                name="company"
                type="years"
                className={styles.inputField}
                placeholder="Years"
              />

              <div
                onClick={() => {
                  setUserProfile({
                    ...userProfile,
                    postWork: [userProfile, inputData],
                  });
                  setIsModalOpen(false);
                }}
                className={styles.updateProfile}
              >
                Add Work
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </UserLayout>
  );
}
