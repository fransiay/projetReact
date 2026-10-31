import { Link } from "react-router";
import Menu from "./Menu";
import "./Mon.css";

function Banner() {
  return (
    <header className="banner">
      <Link to="/catalogue" style={{ color: "#fff", textDecoration: "none" }}>
        <h1> Waza Shop</h1>
      </Link>
      <Menu />
    </header>
  );
}

export default Banner;
