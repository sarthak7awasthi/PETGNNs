import React from "react";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../requests/auth";
import logo from "../assets/logo.png";

function Header() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("token");
      localStorage.removeItem("id");
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AppBar position="static">
      {" "}
      <Toolbar>
        <Link to="/dashboard" style={{ flexGrow: 1, textDecoration: "none" }}>
          <img src={logo} alt="Logo" style={{ height: 80 }} />{" "}
        </Link>
        <Box>
          <Button color="inherit" component={Link} to="/dashboard">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/projects">
            Projects
          </Button>
          <Button color="inherit" component={Link} to="/profile">
            Profile
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
