import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Box } from "@mui/material";
import Header from "./Header";
import { getUserProfile } from "../requests/auth";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/signup");
        } else {
          const userData = await getUserProfile(token);
          setUser(userData);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Error fetching profile");
      }
    };

    fetchProfile();
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f5f5f5",
      }}
    >
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          Profile
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        {user ? (
          <Box>
            <Typography variant="h6">Email: {user.email}</Typography>
          </Box>
        ) : (
          <Typography>Loading...</Typography>
        )}
      </Container>
    </Box>
  );
}

export default Profile;
