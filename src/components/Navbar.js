import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <h2>Admin Portal</h2>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbar;
