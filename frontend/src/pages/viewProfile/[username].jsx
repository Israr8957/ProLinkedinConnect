import { BASE_URL, clientServer } from "@/config";
import DashboardLayout from "@/layout/dashboardLayout";
import UserLayout from "@/layout/userLayout";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction";
import {
  getConnectionRequest,
  sendConnectionRequest,
} from "@/config/redux/action/authAction";

export default function ViewProfilePage({ userProfile }) {
  const searchParams = useSearchParams();

  const router = useRouter();
  const postReducer = useSelector((state) => state.postReducer);
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.authReducer);

  const [userPosts, setPosts] = useState([]);

  const [isCurrentUserInConnection, setIsCurrentUserInConnection] =
    useState(false);

  const [isConnectionNull, setIsConnectionNull] = useState(true);

  const getUsersPost = async () => {
    await dispatch(getAllPosts());
    await dispatch(
      getConnectionRequest({ token: localStorage.getItem("token") })
    );
  };

  useEffect(() => {
    let post = postReducer.posts.filter((post) => {
      return post.userId?.username === router.query.username;
    });
  }, [postReducer.posts]);

  useEffect(() => {
    console.log(authState?.connections, userProfile.userId._id);

    if (
      authState?.connections.some(
        (user) => user.connectionId._id === userProfile.userId._id
      )
    ) {
      setIsCurrentUserInConnection(true);
      if (
        authState.connections.some(
          (user) => user.connectionId._id === userProfile.userId._id
        )
      ) {
        setIsConnectionNull(false);
      }
    }
  }, [authState?.connections]);

  useEffect(() => {
    getUsersPost();
  }, []);

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.bsckDropContainer}>
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
                  <h2>{userProfile.userId.name}</h2>
                  <p style={{ color: "gray" }}>
                    @{userProfile.userId.username}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.2em",
                  }}
                >
                  {isCurrentUserInConnection ? (
                    <button className={styles.connectedButton}>
                      {isConnectionNull ? "Pending" : "Connected"}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        dispatch(
                          sendConnectionRequest({
                            token: localStorage.getItem("token"),
                            userId: userProfile.userId._id,
                          })
                        );
                      }}
                      className={styles.connectBtn}
                    >
                      Connect
                    </button>
                  )}

                  <div
                    onClick={async () => {
                      const responce = await clientServer.get(
                        `/user/download_resume?id=${userProfile.userId._id}`
                      );
                      window.open(
                        `${BASE_URL}/${responce.data.message}`,
                        "_blank"
                      );
                    }}
                    style={{ width: "1.2em", cursor: "pointer" }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="size-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <p>{userProfile.bio}</p>
                </div>
              </div>
              <div style={{ flex: "0.2rem" }}>
                <h3>Recent Activity</h3>
                <p>{userPosts}</p>
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
                            {userProfile.pastWork.map((work, index) => {
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
                          </div>
                        </div>
                        <p>{post.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export async function getServerSideProps(context) {
  console.log("from view");

  console.log(context.params.username);

  const request = await clientServer.get(
    "/user/get_profile_based_on_username?username",
    {
      params: {
        username: context.query.username,
      },
    }
  );

  const responce = await request.data;
  console.log(responce);

  return { props: { userProfile: request.data.profile } };
}
