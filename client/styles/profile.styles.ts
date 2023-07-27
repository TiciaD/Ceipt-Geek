import { Theme } from "@mui/material";

export const profileStyles = (theme: Theme) => ({
  profileContainer: {
    boxShadow: 24,
    borderRadius: "10px",
    px: "2rem",
    py: "3rem",
    marginTop: { sm: "20px", xs: 0 },
  },
  usernameTextfieldContainer: {
    [theme.breakpoints.up("md")]: {
      height: "145px",
    },
    [theme.breakpoints.down("md")]: {
      height: "115px",
    },
    "@media (max-width: 300px)": {
      height: "auto",
    },
  },
  usernameError: {
    marginTop: "2px",
    marginBottom: "0px",
    fontWeight: "bold",
    color: "red",
    fontSize: "14px",
    [theme.breakpoints.down("md")]: {
      fontSize: "11px",
    },
  },
  usernameButtonContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: "9px",
    gap: "7px",
    "@media (max-width: 300px)": {
      flexDirection: "column",
    },
  },
  usernameSaveButton: {
    [theme.breakpoints.down("md")]: {
      fontSize: "12px",
    },
  },
  usernameCancelButton: {
    color: "grey",
    [theme.breakpoints.down("md")]: {
      fontSize: "12px",
    },
  },
  username: {
    position: "relative",
    fontWeight: "bold",
    [theme.breakpoints.up("md")]: { fontSize: "50px" },
    [theme.breakpoints.down("md")]: {
      fontSize: "35px",
    },
  },
  usernameEditButton: {
    position: "absolute",
    top: "-5px",
  },
  divider: {
    marginBlock: "40px",
    [theme.breakpoints.down("md")]: {
      marginBlock: "30px",
    },
  },
  typographyCategory: {
    fontWeight: "bold",
    fontSize: { sm: "1.1rem", xs: "1rem" },
  },
  typographyInfo: {
    fontSize: { sm: "1.1rem", xs: "1rem" },
  },
  editProfileContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    padding: "20px",
  },
  editProfileContainerButton: {
    width: "250px",
    [theme.breakpoints.down("md")]: {
      width: "200px",
      fontSize: "12px",
    },
    "@media (max-width: 300px)": {
      width: "100%",
    },
  },
  modalContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    minWidth: 500,
    minHeight: 500,
    boxShadow: 24,
    bgcolor: "background.paper",
    padding: "2rem",
    borderRadius: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});
