import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import UpdateEmailForm from "../../forms/UpdateEmailForm";
import UpdatePasswordForm from "../../forms/UpdatePasswordForm";
import {
  useUpdateUsernameMutation,
  useDeleteAccountMutation,
  useUserQuery,
} from "../../graphql/generated/graphql";

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
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useAuth } from "../../utils/useAuth";
import { profileStyles } from "./profile.styles";

export interface IPartialUser {
  id: string;
  username: string;
  email: string;
  dateJoined: any;
  receiptCount?: number | null | undefined;
  tagsCount?: number | null | undefined;
}

const ProfilePage = () => {
  useUserQuery({
    onCompleted: (data) => {
      setUserDetails(data.user!);
      setUsernameInput(data.user?.username || null);
      setLoading(false);
    },
    onError: (error) => {
      setError(error.message);
      setLoading(false);
    },
    fetchPolicy: "network-only",
  });

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userDetails, setUserDetails] = useState<IPartialUser>({
    id: "",
    username: "",
    email: "",
    dateJoined: "",
    receiptCount: 0,
    tagsCount: 0,
  });

  const { logout } = useAuth();
  const [updateUsernameMutation] = useUpdateUsernameMutation();
  const [deleteAccountMutation] = useDeleteAccountMutation();

  const theme = useTheme();
  const styles = profileStyles(theme);

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [emailModalIsOpen, setEmailModalIsOpen] = useState(false);
  const [passwordModalIsOpen, setPasswordModalIsOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState<string | null>(null);
  const [usernameMutationLoading, setUsernameMutationLoading] = useState(false);
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));
  
  const handleEmailModalOpen = () => setEmailModalIsOpen(true);
  const handleEmailModalClose = () => setEmailModalIsOpen(false);
  const handlePasswordModalOpen = () => setPasswordModalIsOpen(true);
  const handlePasswordModalClose = () => setPasswordModalIsOpen(false);
  const handleDeletingAccountOpen = () => setIsDeletingAccount(true);
  const handleDeletingAccountClose = () => setIsDeletingAccount(false);
  

  useEffect(() => {
    const token = localStorage.getItem("ceipt-geek-auth-token") || "";
    if (!token) {
      router.replace("/");
    }
  }, []);

  const handleUsernameInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const username = event.target.value.trim();
    const usernameRegex = /^[\w.@+-]+$/;
    setUsernameError(null);
    if (username.length <= 30) {
      setUsernameInput(username);
    } else {
      setUsernameError("Username must be 30 characters or less");
    }

    if (username.length < 3) {
      setUsernameError("Username must be at least 3 characters long");
    }

    if (username) {
      if (!usernameRegex.test(username)) {
        setUsernameError(
          "Username can only contain letters, numbers, and @/./+/-/_ characters"
        );
      }
    }
  };

  const handleUpdateUsername = async () => {
    const username = usernameInput?.trim();
    const usernameRegex = /^[\w.@+-]+$/;

    setUsernameInput(username || "");

    if (!username) {
      setUsernameError("Username cannot be blank");
      return;
    } else if (username.length < 3) {
      setUsernameError("Username must be at least 3 characters long");
      return;
    } else if (username.length > 30) {
      setUsernameError("Username must be 30 characters or less");
      return;
    } else if (!usernameRegex.test(username)) {
      setUsernameError(
        "Username can only contain letters, numbers, and @/./+/-/_ characters"
      );
      return;
    }

    setUsernameMutationLoading(true);

    await updateUsernameMutation({
      variables: {
        username,
      },
      onCompleted: (data) => {
        setUserDetails((prev) => {
          const current = { ...prev };
          current.username = data.updateUser?.user?.username!;
          return current;
        });
        setIsEditingUsername(false);
        setUsernameMutationLoading(false);
        setUsernameError(null);
      },
      onError: (error) => {
        setUsernameMutationLoading(false);
        setUsernameError(error.message);
      },
      fetchPolicy: "network-only",
    });
  };

  const handleDeleteAccount = async () => {
    await deleteAccountMutation({
      onCompleted: (data) => {
        if (data.deleteUser?.success) {
          logout();
          router.replace("/");
        } else {
          window.alert("Account deletion unsuccessful");
        }
      },
      onError: (error) => {
        window.alert(error.message);
      },
      fetchPolicy: "network-only",
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" padding="20px">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" padding="20px">
        <Typography>An Error has occurred: {error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={styles.profileContainer}>
        <Box marginBottom={2}>
          {isEditingUsername ? (
            <Box
              display="flex"
              alignItems="center"
              flexDirection="column"
              sx={styles.usernameTextfieldContainer}
            >
              {isLargeScreen ? (
                <TextField
                  variant="standard"
                  value={usernameInput}
                  onChange={handleUsernameInputChange}
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
                  value={usernameInput}
                  onChange={handleUsernameInputChange}
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
                <Typography sx={styles.usernameError}>
                  {usernameError}
                </Typography>
              )}
              <Box sx={styles.usernameButtonContainer}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={styles.usernameSaveButton}
                  onClick={handleUpdateUsername}
                >
                  {usernameMutationLoading ? (
                    <CircularProgress color="warning" size={20} />
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button
                  sx={styles.usernameCancelButton}
                  onClick={() => {
                    setIsEditingUsername(false);
                    setUsernameError(null);
                    setUsernameInput(userDetails?.username || null);
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography sx={styles.username} align="center">
              {userDetails?.username}
              <IconButton
                color="primary"
                sx={styles.usernameEditButton}
                aria-label="edit username"
                onClick={() => setIsEditingUsername(true)}
              >
                <EditIcon fontSize="medium" />
              </IconButton>
            </Typography>
          )}
        </Box>

        <Divider sx={styles.divider}>
          <Chip label="My Profile" variant="outlined" />
        </Divider>

        <Grid container spacing={2} sx={{ padding: "20px" }}>
          <Grid item xs={12} md={6} sx={styles.gridItem}>
            <Typography sx={styles.profileDetailsTypographyLeft}>
              Email: {userDetails?.email}
            </Typography>
            <Typography sx={styles.profileDetailsTypographyLeft}>
              Account created:{" "}
              {new Date(userDetails?.dateJoined).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6} sx={styles.gridItem}>
            <Typography sx={styles.profileDetailsTypographyRight}>
              Receipts created: {userDetails?.receiptCount}
            </Typography>
            <Typography sx={styles.profileDetailsTypographyRight}>
              Tags created: {userDetails?.tagsCount}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={styles.divider}>
          <Chip label="Edit Profile" variant="outlined" />
        </Divider>

        <Box sx={styles.editProfileContainer}>
          <Button
            variant="contained"
            sx={styles.editProfileContainerButton}
            onClick={handleEmailModalOpen}
          >
            Update Email Address
          </Button>
          <Button
            variant="contained"
            sx={styles.editProfileContainerButton}
            onClick={handlePasswordModalOpen}
          >
            Update Password
          </Button>

          <Button
            variant="outlined"
            color="error"
            sx={styles.editProfileContainerButton}
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
          sx={styles.modalContainer}
        >
          <UpdateEmailForm
            setUserDetails={setUserDetails}
            setEmailModalIsOpen={setEmailModalIsOpen}
          />
        </Box>
      </Modal>

      <Modal
        open={passwordModalIsOpen}
        onClose={handlePasswordModalClose}
        aria-labelledby="update password modal"
      >
        <Box
          sx={styles.modalContainer}
        >
          <UpdatePasswordForm />
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
          <Button onClick={handleDeleteAccount} color="error">
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
