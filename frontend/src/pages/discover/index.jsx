import { getAllUsers } from "@/config/redux/action/authAction";
import DashboardLayout from "@/layout/dashboardLayout";
import UserLayout from "@/layout/userLayout";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";

export default function DiscoverPage() {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const router = useRouter();

  useEffect(() => {
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, []);
  return (
    <UserLayout>
      <DashboardLayout>
        <div>
          <h1>Discover Page</h1>
          <div className={styles.allUserProfile}>
            {authState.all_profiles_fetched &&
              authState.all_users.map((user) => {
                return (
                  <div
                    onClick={() => {
                      router.push(`/viewProfile/${user.userId.username}`);
                    }}
                    key={user._id}
                    className={styles.userCard}
                  >
                    {user.userId?.profilePicture && (
                      <img
                        className={styles.userCard_image}
                        src={`${BASE_URL}/${user.userId.profilePic}`}
                        alt="profilePic"
                      />
                    )}
                    <h3>{user.userId?.name || "No Name"}</h3>
                    <p>{user.userId?.username}</p>
                  </div>
                );
              })}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
