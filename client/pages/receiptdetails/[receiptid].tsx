import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  useTheme,
  InputAdornment,
  Input,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Modal,
} from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CloseIcon from "@mui/icons-material/Close";

import Camera, { FACING_MODES } from "react-html5-camera-photo";
import { isMobile } from "react-device-detect";
import "react-html5-camera-photo/build/css/index.css";

import { receiptDetailsStyles } from "../../styles/receiptdetails.styles";

import {
  useReceiptQuery,
  useUpdateReceiptMutation,
  useGetAllUsersTagsQuery,
  useDeleteReceiptMutation,
  ReceiptInput,
} from "../../graphql/generated/graphql";

import { expenseOptions } from "../../utils/choices";
import expenseMap from "../../constants/expenseMap";

import ReceiptPlaceholder from "../../public/placeholder-receipt.png";

import { useAuth } from "../../utils/useAuth";

export default function ReceiptDetails() {
  const router = useRouter();
  const { receiptid } = router.query;

  const { logout } = useAuth();

  const { data, loading, error, refetch } = useReceiptQuery({
    variables: {
      receiptId: receiptid ? String(receiptid) : "",
    },
    onError: (error) => {
      if (
        error.message.startsWith("Please login") ||
        error.message.startsWith("Invalid Token")
      ) {
        logout();
        router.push("/login");
      }
    },
    fetchPolicy: "cache-and-network",
  });
  useGetAllUsersTagsQuery({
    onCompleted: (data) => {
      const tagNames =
        data?.allUsersTags?.map((tag) => tag?.tagName || "") || [];

      setTags(tagNames);
    },
    fetchPolicy: "cache-and-network",
  });

  const [updateReceiptMutation] = useUpdateReceiptMutation();
  const [deleteReceiptMutation] = useDeleteReceiptMutation();

  const theme = useTheme();
  const styles = receiptDetailsStyles(theme);

  const filter = createFilterOptions<string>();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editedReceipt, setEditedReceipt] = useState<ReceiptInput>({
    storeName: data?.receipt?.storeName || "",
    expense: data?.receipt?.expense || "FOOD",
    date: data?.receipt?.date,
    cost: data?.receipt?.cost,
    tax: data?.receipt?.tax,
    notes: data?.receipt?.notes,
    tags: data?.receipt?.tags.map((tag) => tag.tagName) || [],
    receiptImage: data?.receipt?.receiptImage,
  });
  const [tags, setTags] = useState<string[]>([]);
  const [imageUpload, setImageUpload] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [isPhotoModalOpen, setPhotoModalOpen] = useState(false);
  const [isDeletingReceipt, setIsDeletingReceipt] = useState(false);

  const [mutationError, setMutationError] = useState("");

  useEffect(() => {
    if (data?.receipt) {
      setEditedReceipt({
        storeName: data?.receipt?.storeName,
        expense: data?.receipt?.expense,
        date: data?.receipt?.date,
        cost: data?.receipt?.cost,
        tax: data?.receipt?.tax,
        notes: data?.receipt?.notes,
        tags: data?.receipt?.tags.map((tag) => tag.tagName),
        receiptImage: data?.receipt?.receiptImage,
      });
    }
  }, [data]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
    setEditedReceipt({
      ...editedReceipt,
      storeName: data?.receipt?.storeName!,
      expense: data?.receipt?.expense!,
      cost: data?.receipt?.cost,
      tax: data?.receipt?.tax,
      notes: data?.receipt?.notes,
      tags: data?.receipt?.tags.map((tag) => tag.tagName),
      receiptImage: data?.receipt?.receiptImage,
    });
    setImageUpload(null);
  };

  const handleSubmit = () => {
    const receiptInput = {
      storeName: editedReceipt.storeName,
      expense: editedReceipt.expense,
      date: editedReceipt.date,
      cost: editedReceipt.cost,
      tax: editedReceipt.tax,
      notes: editedReceipt.notes,
      tags: editedReceipt.tags,
      receiptImage: imageUpload,
    };

    updateReceiptMutation({
      variables: {
        receiptId: receiptid ? String(receiptid) : "",
        receiptData: receiptInput,
      },
      onCompleted: (response) => {
        setIsEditing(false);
        refetch();
      },
      onError: (error) => {
        if (
          error.message.startsWith("Please login") ||
          error.message.startsWith("Invalid Token")
        ) {
          logout();
          router.push("/login");
        }

        console.error("Mutation error:", error);
        setMutationError(
          "Something went wrong saving your changes. Please check your inputs and try again."
        );
      },
    });

    setImageUpload(null);
    setFileName("");
  };

  const handleDeleteReceipt = async () => {
    await deleteReceiptMutation({
      variables: {
        receiptId: receiptid as string,
      },
      onCompleted: (data) => {
        if (data?.deleteReceipt?.success) {
          router.replace("/");
        } else {
          window.alert("Receipt deletion unsuccessful");
        }
      },
      onError: (error) => {
        window.alert(error.message);
      },
      fetchPolicy: "network-only",
    });
  };

  const handleTakePhotoAnimationDone = async (dataUri: any) => {
    const photo = new File(
      [await dataURLtoBlob(dataUri)],
      "cameraCapture.png",
      {
        type: "image/png",
      }
    );
    setImageUpload(photo);
    setFileName("cameraCapture.png");
  };

  const dataURLtoBlob = async (dataURL: string) => {
    const response = await fetch(dataURL);
    const blob = await response.blob();
    return blob;
  };

  if (loading) {
    // Render a loading state if the query is still in progress
    return <div>Loading...</div>;
  }

  if (error) {
    // Render an error message if there was an error with the query
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      {isEditing ? (
        <Card sx={styles.card}>
          <Box sx={styles.mainContainer}>
            <CardContent>
              <Box sx={styles.firstColContainer}>
                <TextField
                  variant="standard"
                  onChange={(e) =>
                    setEditedReceipt({
                      ...editedReceipt,
                      storeName: e.target.value,
                    })
                  }
                  type="text"
                  name="storeName"
                  defaultValue={data?.receipt?.storeName}
                  sx={{ mb: 2 }}
                  inputProps={{
                    style: {
                      fontSize: "2rem",
                      fontWeight: "bold",
                    },
                  }}
                />
                <Typography>
                  {new Date(data?.receipt?.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Typography>
                <Box sx={styles.editImage}>
                  <img
                    style={{
                      width: "inherit",
                      cursor: "inherit",
                      marginBottom: "inherit",
                      objectFit: "inherit",
                      height: "inherit",
                      borderRadius: "inherit",
                    }}
                    src={data?.receipt?.receiptImage || ReceiptPlaceholder.src}
                    alt={
                      data?.receipt?.receiptImage
                        ? `${data?.receipt?.storeName} receipt`
                        : `receipt`
                    }
                    onClick={() => setImageModalOpen(true)}
                  />
                </Box>
                <Box sx={styles.uploadbuttonsContainer}>
                  <Button
                    variant="contained"
                    sx={styles.uploadImageButton}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Image
                  </Button>
                  <IconButton
                    aria-label="take photo"
                    onClick={() => {
                      setPhotoModalOpen(true);
                    }}
                  >
                    <CameraAltIcon />
                  </IconButton>
                </Box>
                <Typography sx={styles.fileSelectionText}>
                  {fileName ? fileName : "No File Chosen"}
                </Typography>
                <input
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    let nameOfFile = file?.name || "";
                    if (file) {
                      setImageUpload(file);
                      if (nameOfFile.length > 30) {
                        nameOfFile =
                          nameOfFile.slice(0, 15) +
                          "..." +
                          nameOfFile.slice(
                            nameOfFile.length - 12,
                            nameOfFile.length
                          );
                      }
                      setFileName(nameOfFile);
                    }
                  }}
                />
                <Button
                  sx={styles.buttons}
                  onClick={handleCloseEdit}
                  variant="contained"
                  color="warning"
                >
                  Cancel Edit
                </Button>
                <Button
                  color="secondary"
                  sx={styles.buttons}
                  variant="contained"
                  onClick={() => setIsDeletingReceipt(true)}
                >
                  Delete Receipt
                </Button>
              </Box>
            </CardContent>
            <CardContent sx={styles.secondColContainer}>
              <Autocomplete
                disableClearable
                handleHomeEndKeys
                autoHighlight
                options={expenseOptions}
                defaultValue={{
                  value: data?.receipt?.expense!,
                  label: expenseMap[data?.receipt?.expense!].displayString,
                }}
                onChange={(_event, newValue) => {
                  const selectedExpense = newValue ? newValue : null;
                  setEditedReceipt({
                    ...editedReceipt,
                    expense: (selectedExpense && selectedExpense.value) || "",
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Category"
                    variant="outlined"
                    inputProps={{
                      ...params.inputProps,
                      style: {
                        fontSize: "1.35rem",
                      },
                    }}
                  />
                )}
              />
              <Box sx={styles.editGroup}>
                <Typography sx={styles.receiptDetailsTypography}>
                  Total:
                </Typography>
                <Input
                  onChange={(e) =>
                    setEditedReceipt({ ...editedReceipt, cost: e.target.value })
                  }
                  type="number"
                  name="cost"
                  defaultValue={data?.receipt?.cost.toFixed(2)}
                  startAdornment={
                    <InputAdornment position="start">$</InputAdornment>
                  }
                  inputProps={{
                    style: {
                      fontSize: "1.35rem",
                    },
                    step: "0.01",
                    min: "0",
                    pattern: "\\d*\\.?\\d{0,2}",
                  }}
                  sx={styles.editTextField}
                />
              </Box>
              <Box sx={styles.editGroup}>
                <Typography sx={styles.receiptDetailsTypography}>
                  Tax:
                </Typography>
                <Input
                  onChange={(e) =>
                    setEditedReceipt({ ...editedReceipt, tax: e.target.value })
                  }
                  type="number"
                  name="tax"
                  defaultValue={data?.receipt?.tax.toFixed(2)}
                  startAdornment={
                    <InputAdornment position="start">$</InputAdornment>
                  }
                  inputProps={{
                    style: {
                      fontSize: "1.35rem",
                    },
                    step: "0.01",
                    min: "0",
                    pattern: "\\d*\\.?\\d{0,2}",
                  }}
                  sx={styles.editTextField}
                />
              </Box>
              <Autocomplete
                multiple
                freeSolo
                autoHighlight
                handleHomeEndKeys
                clearOnBlur
                options={tags?.sort((a, b) => a.localeCompare(b))}
                value={editedReceipt.tags || []}
                renderInput={(params) => <TextField {...params} label="Tags" />}
                renderTags={(value, getTagProps) =>
                  value.map((option, index: number) => {
                    if (option) {
                      const label = option.startsWith("Add ")
                        ? option.substring(4)
                        : option;
                      return (
                        <Chip
                          label={label}
                          {...getTagProps({ index })}
                          sx={styles.receiptDetailsTypography}
                        />
                      );
                    }
                    return null; // Handle null option
                  })
                }
                filterOptions={(options, params) => {
                  const filteredOptions = options.filter(
                    (option): option is string => option !== null
                  );

                  const filtered = filter(filteredOptions, params);

                  const { inputValue } = params;
                  const isExisting = options.some(
                    (option) => inputValue === option
                  );

                  if (inputValue !== "" && !isExisting) {
                    filtered.push(`Add ${inputValue}`);
                  }

                  return filtered;
                }}
                onChange={(event, newValues) => {
                  const updatedValues = newValues.map((value) =>
                    value?.startsWith("Add ") ? value?.substring(4) : value
                  );
                  setEditedReceipt({ ...editedReceipt, tags: updatedValues });
                  const currentValue = newValues.slice(-1)[0];
                  if (currentValue && currentValue.startsWith("Add ")) {
                    const temporaryTag = currentValue.substring(4);
                    if (temporaryTag) {
                      tags.push(temporaryTag);
                    }
                  } else if (currentValue && !tags.includes(currentValue)) {
                    tags.push(currentValue);
                  }
                }}
              />
              <Box sx={styles.editGroup}>
                <Typography style={styles.receiptDetailsTypography}>
                  Notes:
                </Typography>
                <TextField
                  variant="standard"
                  onChange={(e) =>
                    setEditedReceipt({
                      ...editedReceipt,
                      notes: e.target.value,
                    })
                  }
                  type="text"
                  name="notes"
                  defaultValue={data?.receipt?.notes || ""}
                  inputProps={{
                    style: {
                      fontSize: "1.35rem",
                    },
                  }}
                  sx={styles.editTextField}
                />
              </Box>
              <Button
                sx={styles.saveButton}
                variant="contained"
                onClick={handleSubmit}
              >
                Save Changes
              </Button>
            </CardContent>
          </Box>
        </Card>
      ) : (
        <Card sx={styles.card}>
          <Box sx={styles.mainContainer}>
            <CardContent>
              <Box sx={styles.firstColContainer}>
                <Typography variant="h4" sx={styles.storeName}>
                  {data?.receipt?.storeName}
                </Typography>
                <Typography>
                  {new Date(data?.receipt?.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Typography>
                <Box sx={styles.image}>
                  <img
                    style={{
                      width: "inherit",
                      cursor: "inherit",
                      marginBottom: "inherit",
                      objectFit: "inherit",
                      height: "inherit",
                      borderRadius: "inherit",
                    }}
                    src={data?.receipt?.receiptImage || ReceiptPlaceholder.src}
                    alt={
                      data?.receipt?.receiptImage
                        ? `${data?.receipt?.storeName} receipt`
                        : `receipt`
                    }
                    onClick={() => setImageModalOpen(true)}
                  />
                </Box>
                <Button
                  onClick={handleEdit}
                  sx={styles.buttons}
                  variant="contained"
                >
                  Edit Receipt
                </Button>
                <Button
                  color="secondary"
                  sx={styles.buttons}
                  variant="contained"
                  onClick={() => setIsDeletingReceipt(true)}
                >
                  Delete Receipt
                </Button>
              </Box>
            </CardContent>
            <CardContent sx={styles.secondColContainer}>
              <Typography style={styles.receiptDetailsTypography}>
                Category: {expenseMap[data?.receipt?.expense!].displayString}
              </Typography>
              <Typography style={styles.receiptDetailsTypography}>
                Total: ${data?.receipt?.cost.toFixed(2)}
              </Typography>
              <Typography style={styles.receiptDetailsTypography}>
                Tax: ${data?.receipt?.tax.toFixed(2)}
              </Typography>
              <Typography style={styles.receiptDetailsTypography}>
                Tags: {data?.receipt?.tags.map((tag) => tag.tagName).join(", ")}
              </Typography>
              <Typography style={styles.receiptDetailsTypography}>
                Notes: {data?.receipt?.notes}
              </Typography>
            </CardContent>
          </Box>
        </Card>
      )}
      <Modal
        open={isImageModalOpen}
        sx={styles.imageModalContainer}
        onClose={() => setImageModalOpen(false)} // Handle click event to close the image modal
      >
        <>
          <img
            style={{
              maxHeight: "90%",
              maxWidth: "90%",
              objectFit: "contain",
            }}
            src={data?.receipt?.receiptImage || ReceiptPlaceholder.src}
            alt={
              data?.receipt?.receiptImage
                ? `${data?.receipt?.storeName} receipt enlarged`
                : `receipt enlarged`
            }
          />
          <IconButton
            aria-label="close image preview"
            onClick={() => {
              setImageModalOpen(false);
            }}
            sx={styles.closeModalButton}
          >
            <CloseIcon />
          </IconButton>
        </>
      </Modal>
      <Modal
        open={isPhotoModalOpen}
        onClose={() => {
          setPhotoModalOpen(false);
        }}
      >
        <>
          <Box
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: `${isMobile ? "100%" : ""}`,
              transform: "translate(-50%, -50%)",
              backgroundColor: "#fff",
              padding: "10px",
              borderRadius: "5px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {isPhotoModalOpen && (
              <Camera
                onTakePhotoAnimationDone={(dataUri) => {
                  handleTakePhotoAnimationDone(dataUri);
                  setPhotoModalOpen(false);
                }}
                idealFacingMode={FACING_MODES.ENVIRONMENT}
              />
            )}
          </Box>
          <IconButton
            aria-label="close camera"
            onClick={() => {
              setPhotoModalOpen(false);
            }}
            sx={styles.closeModalButton}
          >
            <CloseIcon />
          </IconButton>
        </>
      </Modal>
      <Snackbar
        open={!!mutationError}
        autoHideDuration={5000}
        onClose={() => setMutationError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" variant="filled">
          {mutationError}
        </Alert>
      </Snackbar>
      <Dialog
        open={isDeletingReceipt}
        onClose={() => setIsDeletingReceipt(false)}
        aria-labelledby="confirm delete account dialog"
      >
        <DialogTitle id="alert-dialog-title">
          Are you sure you want to delete this receipt?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This is a permanent and irreversible action. All data associated
            with this receipt will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteReceipt} color="error">
            Delete Receipt
          </Button>
          <Button
            onClick={() => setIsDeletingReceipt(false)}
            color="success"
            autoFocus={true}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
