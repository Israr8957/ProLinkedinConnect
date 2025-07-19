import NavbarComponent from "@/components/navbar";
import React from "react";

export default function UserLayout({ children }) {
  return (
    <div>
      <NavbarComponent />
      {children}
    </div>
  );
}
