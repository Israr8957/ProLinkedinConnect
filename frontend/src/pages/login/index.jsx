import UserLayout from "@/layout/userLayout";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./style.module.css";
import { loginUser, registerUser } from "@/config/redux/action/authAction";
import { emptyMessage } from "@/config/redux/reducer/authReducer";

export default function LoginComponent() {
  const [userLoginMethod, setUserLoginMethod] = useState(false);

  const authState = useSelector((state) => state.auth);

  const router = useRouter();
  const dispatch = useDispatch();

  const [username, setUsername] = useState();
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  useEffect(() => {
    if (authState.loggedIn) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      router.push("/dashboard");
    }
  }, []);

  useEffect(() => {
    dispatch(emptyMessage());
  }, [userLoginMethod]);

  const handleRegister = () => {
    console.log("registering");

    dispatch(
      registerUser({
        username,
        password,
        email,
        name,
      })
    );
  };

  const handleLogin = () => {
    console.log("user login...");
    dispatch(
      loginUser({
        email,
        password,
      })
    );
  };

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContainer}>
          <div className={styles.cardContainer_left}>
            <p className={styles.cardLeft_heading}>
              {userLoginMethod ? "Sign In" : "Sign Up"}{" "}
            </p>
            <p style={{ color: authState.isError ? "red" : "green" }}>
              {typeof authState.message === "string"
                ? authState.message
                : authState.message?.message}
            </p>

            <div className={styles.inputContainer}>
              {!userLoginMethod && (
                <div className={styles.inputRow}>
                  <input
                    onChange={(e) => {
                      setUsername(e.target.value);
                    }}
                    type="text"
                    className={styles.inputField}
                    placeholder="Username"
                  />

                  <input
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                    type="text"
                    className={styles.inputField}
                    placeholder="Name"
                  />
                </div>
              )}

              <input
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                type="email"
                className={styles.inputField}
                placeholder="Email"
              />

              <input
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                type="password"
                className={styles.inputField}
                placeholder="Password"
              />

              <div
                onClick={() => {
                  if (userLoginMethod) {
                    handleLogin();
                  } else {
                    handleRegister();
                  }
                }}
                className={styles.buttonWithOutline}
              >
                {userLoginMethod ? "Sign In" : "Sign Up"}
              </div>
            </div>
          </div>

          <div className={styles.cardContainer_right}>
            {userLoginMethod ? (
              <p>Don't have an account</p>
            ) : (
              <p>Already have an account</p>
            )}
            <div
              style={{ color: "black" }}
              onClick={() => {
                setUserLoginMethod(!userLoginMethod);
              }}
              className={styles.buttonWithOutline}
            >
              {userLoginMethod ? "Sign Up" : "Sign In"}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
