import { Outlet } from "react-router";
import Banner from "./Banner";
import Sidebar from "./Sidebar";
import RightColumn from "./RightColumn";
import Footer from "./Footer";
import "./Mon.css";

export default function Layout() {
  return (
    <div className="layout">
      <Banner />
      <Sidebar />
      <main className="content">
        <Outlet />
      </main>
      <RightColumn />
      <Footer />
    </div>
  );
}

