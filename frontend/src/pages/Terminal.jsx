import React, { useEffect, useState } from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Terminal = ({ open, handleClose, logs, projectName, project_id }) => {
  const navigate = useNavigate();
  const [displayedLogs, setDisplayedLogs] = useState([]);

  useEffect(() => {
    if (open) {
      setDisplayedLogs([]);

      setTimeout(() => {
        setDisplayedLogs([`petgnn$ ${logs[0]}`]);
      }, 500);

      logs.slice(1).forEach((log, index) => {
        setTimeout(() => {
          setDisplayedLogs((prevLogs) => [...prevLogs, log]);
        }, (index + 2) * 500);
      });
    }
  }, [open, logs]);

  const handleSeeModels = () => {
    navigate(`/modelDetails/${project_id}`);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          maxHeight: "80%",
          bgcolor: "#2b2b2b",
          color: "#d1d5db",
          fontFamily: "monospace",
          boxShadow: 24,
          p: 2,
          borderRadius: 2,
          overflowY: "auto",
          border: "2px solid #333",
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{ color: "#4b8bf4" }}
        >
          Training logs for {projectName}
        </Typography>
        <Box
          sx={{
            maxHeight: "60vh",
            overflowY: "auto",
            bgcolor: "#1e1e1e",
            color: "#d1d5db",
            fontFamily: "monospace",
            p: 2,
            borderRadius: 1,
            border: "1px solid #444",
          }}
        >
          <pre>{displayedLogs.join("\n")}</pre>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button variant="contained" color="primary" onClick={handleSeeModels}>
            See Models
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default Terminal;
