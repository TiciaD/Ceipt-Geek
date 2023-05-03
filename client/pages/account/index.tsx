import React, { useState } from "react";
import {
  Button,
  Grid,
  TextField,
  Typography,
  Box,
  Divider,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import UpdateEmailForm from "../../forms/UpdateEmailForm";

const ProfilePage = () => {
  const theme = useTheme();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [emailModalIsOpen, setEmailModalIsOpen] = useState(false);
  const [passwordModalIsOpen, setPasswordModalIsOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));

  const handleEmailModalOpen = () => setEmailModalIsOpen(true);
  const handleEmailModalClose = () => setEmailModalIsOpen(false);
  const handlePasswordModalOpen = () => setPasswordModalIsOpen(true);
  const handlePasswordModalClose = () => setPasswordModalIsOpen(false);
  const handleDeletingAccountOpen = () => setIsDeletingAccount(true);
  const handleDeletingAccountClose = () => setIsDeletingAccount(false);

  return (
    <>
      <Box>
        <Box marginBottom={2}>
          {isEditingUsername ? (
            <Box
              display="flex"
              alignItems="center"
              flexDirection="column"
              sx={{
                [theme.breakpoints.up("md")]: {
                  height: "145px",
                },
                [theme.breakpoints.down("md")]: {
                  height: "115px",
                },
              }}
            >
              {isLargeScreen ? (
                <TextField
                  variant="standard"
                  defaultValue="Username"
                  inputProps={{
                    style: {
                      position: "relative",
                      textAlign: "center",
                      fontSize: "50px",
                      fontWeight: "bold",
                      maxWidth: "500px",
                    },
                  }}
                />
              ) : (
                <TextField
                  variant="standard"
                  defaultValue="Username"
                  inputProps={{
                    style: {
                      position: "relative",
                      textAlign: "center",
                      fontSize: "35px",
                      fontWeight: "bold",
                      maxWidth: "300px",
                    },
                  }}
                />
              )}
              {usernameError && (
                <Typography
                  sx={{
                    marginTop: "1px",
                    marginBottom: "0px",
                    fontWeight: "bold",
                    color: "red",
                  }}
                >
                  {usernameError || "error"}
                </Typography>
              )}
              <Box display="flex" alignItems="center" marginTop="9px" gap="7px">
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    [theme.breakpoints.down("md")]: {
                      fontSize: "12px",
                    },
                  }}
                >
                  Save
                </Button>
                <Button
                  sx={{
                    color: "grey",
                    [theme.breakpoints.down("md")]: {
                      fontSize: "12px",
                    },
                  }}
                  onClick={() => setIsEditingUsername(false)}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography
              sx={{
                position: "relative",
                fontWeight: "bold",
                [theme.breakpoints.up("md")]: { fontSize: "50px" },
                [theme.breakpoints.down("md")]: {
                  fontSize: "35px",
                },
              }}
              align="center"
            >
              Username
              <IconButton
                color="primary"
                sx={{ position: "absolute", top: "-5px" }}
                aria-label="edit username"
                onClick={() => setIsEditingUsername(true)}
              >
                <EditIcon fontSize="medium" />
              </IconButton>
            </Typography>
          )}
        </Box>

        <Divider
          sx={{
            marginBlock: "40px",
            [theme.breakpoints.down("md")]: {
              marginBlock: "30px",
            },
          }}
        >
          <Chip label="My Account" variant="outlined" />
        </Divider>

        <Grid container spacing={2} sx={{ padding: "20px" }}>
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "7.5px",
            }}
          >
            <Typography
              sx={{
                fontWeight: "bold",
                [theme.breakpoints.up("md")]: {
                  width: "300px",
                  marginLeft: "75px",
                },
                [theme.breakpoints.down("md")]: {
                  fontSize: "12px",
                },
              }}
            >
              Email: email@address.com
            </Typography>
            <Typography
              sx={{
                fontWeight: "bold",
                [theme.breakpoints.up("md")]: {
                  width: "300px",
                  marginLeft: "75px",
                },
                [theme.breakpoints.down("md")]: {
                  fontSize: "12px",
                },
              }}
            >
              Account created: Date
            </Typography>
          </Grid>

          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "7.5px",
            }}
          >
            <Typography
              sx={{
                fontWeight: "bold",
                [theme.breakpoints.up("md")]: {
                  width: "300px",
                  marginLeft: "150px",
                },
                [theme.breakpoints.down("md")]: {
                  fontSize: "12px",
                },
              }}
            >
              Receipts created: number
            </Typography>
            <Typography
              sx={{
                fontWeight: "bold",
                [theme.breakpoints.up("md")]: {
                  width: "300px",
                  marginLeft: "150px",
                },
                [theme.breakpoints.down("md")]: {
                  fontSize: "12px",
                },
              }}
            >
              Tags created: number
            </Typography>
          </Grid>
        </Grid>

        <Divider
          sx={{
            marginBlock: "40px",
            [theme.breakpoints.down("md")]: {
              marginBlock: "30px",
            },
          }}
        >
          <Chip label="Edit Account" variant="outlined" />
        </Divider>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            padding: "20px",
          }}
        >
          <Button
            variant="contained"
            sx={{
              width: "250px",
              [theme.breakpoints.down("md")]: {
                width: "200px",
                fontSize: "12px",
              },
            }}
            onClick={handleEmailModalOpen}
          >
            Update Email Address
          </Button>
          <Button
            variant="contained"
            sx={{
              width: "250px",
              [theme.breakpoints.down("md")]: {
                width: "200px",
                fontSize: "12px",
              },
            }}
            onClick={handlePasswordModalOpen}
          >
            Update Password
          </Button>

          <Button
            variant="outlined"
            color="error"
            sx={{
              width: "250px",
              [theme.breakpoints.down("md")]: {
                width: "200px",
                fontSize: "12px",
              },
            }}
            onClick={handleDeletingAccountOpen}
          >
            Delete Account
          </Button>
        </Box>
      </Box>

      <Modal
        open={emailModalIsOpen}
        onClose={handleEmailModalClose}
        aria-labelledby="update email modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            height: 500,
            boxShadow: 24,
            bgcolor: "background.paper",
            padding: "2rem",
          }}
        >
          <UpdateEmailForm />
        </Box>
      </Modal>

      <Modal
        open={passwordModalIsOpen}
        onClose={handlePasswordModalClose}
        aria-labelledby="update password modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            height: 500,
            boxShadow: 24,
            bgcolor: "background.paper",
            padding: "2rem",
          }}
        >
          Password Form
        </Box>
      </Modal>

      <Dialog
        open={isDeletingAccount}
        onClose={handleDeletingAccountClose}
        aria-labelledby="confirm delete account dialog"
      >
        <DialogTitle id="alert-dialog-title">
          Are you sure you want to delete your account?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Deleting your account is an irreversible action, and all data
            associated with your account will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeletingAccountClose} color="error">
            Delete My Account
          </Button>
          <Button
            onClick={handleDeletingAccountClose}
            color="success"
            autoFocus
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfilePage;
