import { Link } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useQuery } from "react-query";
import AuthService from "../../services/AuthService";
import logo from "./../../assets/logo.svg";
import { AppBar, Avatar, Button, Toolbar, Typography } from "@mui/material";

const NavBar = () => {
  const { isAuth, logout, user } = useAuthStore();
  const logoutQuery = useQuery("logout", AuthService.logout, {
    onSuccess: () => logout(),
    enabled: false,
  });
  return (
    <AppBar position="fixed">
      <Toolbar>
        <Avatar src={logo} alt="logo" />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} pl="8px">
          VaChat
        </Typography>
        {isAuth && (
          <Typography
            variant="body1"
            component="div"
            sx={{ userSelect: "none" }}
          >
            {user.email}
          </Typography>
        )}
        {isAuth ? (
          <>
            <Button component={Link} to="/user" color="inherit" variant="text">
              Личный кабинет
            </Button>
            <Button
              component={Link}
              to="/"
              color="inherit"
              variant="text"
              onClick={() => logoutQuery.refetch()}
            >
              Выйти
            </Button>
          </>
        ) : (
          <>
            <Button component={Link} to="/login" color="inherit" variant="text">
              Войти
            </Button>
            <Button
              component={Link}
              to="/signup"
              color="inherit"
              variant="text"
            >
              Зарегистрироваться
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
