import { AppBar, Toolbar, ListItemText, Typography, Button, ListItem, ListItemIcon } from "@mui/material";
import { useNavigate } from "react-router";
import logo from "@assets/logo.png"

export default function BasicNavbar() {
    const navigate = useNavigate();
    return (
        <AppBar sx={{ backgroundColor: "transparent", color: "#333", backdropFilter: "blur(10px)", boxShadow: "none" }}>
            <Toolbar>
                <ListItem>
                    <ListItemIcon sx={{ fontSize: 40 }}>
                        <img src={logo} alt="Logo" style={{ width: 48, height: 48, borderRadius: 4 }} />
                    </ListItemIcon>
                    <ListItemText primary={
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Memory.me
                        </Typography>
                    } secondary="AI-Powered Personalized Memory Management" />
                </ListItem>
                <Button color="inherit" onClick={() => navigate('/dashboard')}>Home</Button>
                {/* <Button color="inherit" onClick={() => navigate('/builder')}>Builder</Button>
                <Button color="inherit">Contact</Button> */}
                <Button color="inherit">Pricing</Button>
                <Button color="inherit">Login</Button>
            </Toolbar>
        </AppBar>
    )
};