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
    width: "250px",
    "@media (max-width: 600px)": {
      mx: 2,
    },
    "@media (max-width: 400px)": {
      width: "200px",
      mx: -2,
    },
  },
  secondColContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    width: "410px",
    pl: 3,
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
  storeName: { fontWeight: "bold", mb: 1 },
  image: {
    cursor: "pointer",
    marginBottom: "1.5rem",
    objectFit: "cover",
    width: "250px",
    height: "250px",
    borderRadius: "4px",
    "@media (max-width: 400px)": {
      width: "200px",
    },
  },
  editGroup: { display: "flex", alignItems: "center" },
  editTextField: { ml: 1, width: "100%" },
  imageModalContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadbuttonsContainer: { display: "flex", alignItems: "center" },
  buttons: { height: "35px", mb: 1 },
  saveButton: { mt: 2 },
  uploadImageButton: { flexGrow: 1, mr: 1 },
  closeModalButton: { position: "absolute", top: 10, right: 10 },
  fileSelectionText: { fontSize: "12px", mb: 2 },
});
