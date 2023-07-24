import { Theme } from "@mui/material";

export const receiptDetailsStyles = (theme: Theme) => ({
  card: {
    px: 2,
    py: 4,
    marginTop: "3rem",
  },
  mainContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
  },
  firstColContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
  },
  secondColContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    width: "410px",
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
  buttons: { height: "35px", width: "150px", mb: 1 },
  saveButton: { alignSelf: "center", mt: 2 },
  uploadImageButton: { width: "200px" },
  fileSelectionText: { fontSize: "12px", mb: 2 },
});
