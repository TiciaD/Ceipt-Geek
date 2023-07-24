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
} from "@mui/material";
import {
  useReceiptQuery,
  useUpdateReceiptMutation,
  ReceiptInput,
  useGetAllUsersTagsQuery,
} from "../../graphql/generated/graphql";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

import { receiptDetailsStyles } from "./receiptdetails.styles";

import { expenseOptions } from "../../utils/choices";
import expenseMap from "../../constants/expenseMap";

import ReceiptPlaceholder from "../../public/placeholder-receipt.png";

export default function ReceiptDetails() {
  const router = useRouter();
  const { receiptid } = router.query;

  const { data, loading, error, refetch } = useReceiptQuery({
    variables: {
      receiptId: receiptid ? String(receiptid) : "",
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

  const theme = useTheme();
  const styles = receiptDetailsStyles(theme);

  const filter = createFilterOptions<string>();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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
      tags: data?.receipt?.tags.map((tag) => tag.tagName),
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
        console.error("Mutation error:", error);
        setMutationError(
          "Something went wrong saving your changes. Please check your inputs and try again."
        );
      },
    });

    setImageUpload(null);
    setFileName("");
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
                  value={data?.receipt?.storeName}
                  sx={{ mb: 2 }}
                  inputProps={{
                    style: {
                      fontSize: "2rem",
                      fontWeight: "bold",
                      maxWidth: "200px",
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
                <img
                  style={{
                    cursor: "pointer",
                    marginBottom: "0.5rem",
                    border: "1px solid black",
                    objectFit: "cover",
                    width: "200px",
                    height: "250px",
                  }}
                  src={data?.receipt?.receiptImage || ReceiptPlaceholder.src}
                  alt={
                    data?.receipt?.receiptImage
                      ? `${data?.receipt?.storeName} receipt`
                      : `receipt`
                  }
                  onClick={() => setImageModalOpen(true)}
                />
                <Button
                  variant="contained"
                  sx={styles.uploadImageButton}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Image
                </Button>
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
                          variant="outlined"
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
                <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                  {data?.receipt?.storeName}
                </Typography>
                <Typography>
                  {new Date(data?.receipt?.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Typography>
                <img
                  style={{
                    cursor: "pointer",
                    marginBottom: "1.5rem",
                    border: "1px solid black",
                    objectFit: "cover",
                    width: "200px",
                    height: "250px",
                  }}
                  src={data?.receipt?.receiptImage || ReceiptPlaceholder.src}
                  alt={
                    data?.receipt?.receiptImage
                      ? `${data?.receipt?.storeName} receipt`
                      : `receipt`
                  }
                  onClick={() => setImageModalOpen(true)}
                />
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
      {isImageModalOpen && (
        <Box
          sx={styles.imageModalContainer}
          onClick={() => setImageModalOpen(false)} // Handle click event to close the image modal
        >
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
        </Box>
      )}
    </>
  );
}
