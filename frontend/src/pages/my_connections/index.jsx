import {
  acceptConnectionRequest,
  getMyConnectionRequests,
} from "@/config/redux/action/authAction";
import DashboardLayout from "@/layout/dashboardLayout";
import UserLayout from "@/layout/userLayout";
import React, { useEffect } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";
import { BASE_URL } from "@/config";
import { useRouter } from "next/router";

export default function MyConnectionsPage() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  useEffect(() => {
    dispatch(getMyConnectionRequests({ token: localStorage.getItem("token") }));
  }, []);

  useEffect(() => {
    if (authState.connectionRequest.length !== 0) {
      console.log(authState.connectionRequest);
    }
  }, [authState.connectionRequest]);
  return (
    <UserLayout>
      <DashboardLayout>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}
        >
          <h3>My Connections</h3>

          {authState.connectionRequest.length == 0 && (
            <h1>No Connection Request</h1>
          )}

          {authState.connectionRequest.length != 0 &&
            authState.connectionRequest
              .filter((connection) => connection.status_accepted === null)
              .map((user, index) => {
                return (
                  <div
                    onClick={() => {
                      router.push(`/viewProfile/${user.userId.username}`);
                    }}
                    key={index}
                    className={styles.userCard}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1.2rem",
                      }}
                    >
                      <div className={styles.profilePicture}>
                        {/* <img
                          src={`${BASE_URL}/${user.userId.profilePicture}`}
                          alt="userPic"
                        /> */}
                      </div>
                      <div className={styles.userInfo}>
                        <h3 style={{ cursor: "pointer" }}>
                          {user.userId.name}
                        </h3>
                        <p>{user.userId.username}</p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(
                            acceptConnectionRequest({
                              connectionId: user._id,
                              token: localStorage.getItem("token"),
                              action: "accept",
                            })
                          );
                        }}
                        className={styles.acceptBtn}
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                );
              })}

          <p3>My Network</p3>
          {authState.connectionRequest
            .filter((connection) => connection.status_accepted !== null)
            .map((user, index) => {
              return (
                <div
                  onClick={() => {
                    router.push(`/viewProfile/${user.userId.username}`);
                  }}
                  key={index}
                  className={styles.userCard}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1.2rem",
                    }}
                  >
                    <div className={styles.profilePicture}>
                      {/* <img
                        src={`${BASE_URL}/${user.userId.profilePicture}`}
                        alt="userPic"
                      /> */}
                    </div>
                    <div className={styles.userInfo}>
                      <h3>{user.userId.name}</h3>
                      <p>{user.userId.username}</p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
