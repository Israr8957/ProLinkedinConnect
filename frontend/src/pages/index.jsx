import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import { useRouter } from "next/router";
import UserLayout from "@/layout/userLayout";

export default function Home() {
  const router = useRouter();
  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.mainContainer}>
          <div className={styles.mainContainer_left}>
            <p>Connect with Friends without Exaggeration</p>
            <p>A true Social media platform</p>

            <div
              onClick={() => {
                router.push("/login");
              }}
              className={styles.buttonJoin}
            >
              Join Now
            </div>
          </div>
          <div className={styles.mainContainer_rigth}>
            <img src="" alt="" />
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
