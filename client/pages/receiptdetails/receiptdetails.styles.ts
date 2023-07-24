import { Theme } from "@mui/material";

export const receiptDetailsStyles = (theme: Theme) => ({
  card: {
    px: 2,
    py: 4,
    marginTop: "3rem",
    "@media (max-width: 400px)": {
      py: 0,
      marginTop: "0",
    },
  },
  mainContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    "@media (max-width: 600px)": {
      flexDirection: "column",
      alignItems: "initial",
    },
  },
  firstColContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
    "@media (max-width: 600px)": {
      width: "200px",
      mx: 2,
    },
    "@media (max-width: 400px)": {
      mx: -2,
    },
  },
  secondColContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    width: "410px",
    pl: 7,
    "@media (max-width: 600px)": {
      width: "auto",
      px: 4,
    },
    "@media (max-width: 400px)": {
      minWidth: "200px",
      px: 0,
    },
  },
  receiptDetailsTypography: { fontSize: "1.35rem" },
  editGroup: { display: "flex", alignItems: "center" },
  editTextField: { ml: 1, width: "100%" },
  imageModalContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  uploadbuttonsContainer: { display: "flex", alignItems: "center" },
  buttons: { height: "35px", mb: 1 },
  saveButton: { mt: 2 },
  uploadImageButton: { flexGrow: 1, mr: 1 },
  fileSelectionText: { fontSize: "12px", mb: 2 },
});
