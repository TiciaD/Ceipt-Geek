import { useRef, useState } from "react";
import { useRouter } from "next/router";

import {
  Button,
  FormControl,
  Grid,
  TextField,
  Alert,
  Autocomplete,
  Box,
  Typography,
  IconButton,
  Modal,
  Chip,
  createFilterOptions,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CloseIcon from "@mui/icons-material/Close";
import ReceiptPlaceholder from "../public/placeholder-receipt.png";

import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

import Camera, { FACING_MODES } from "react-html5-camera-photo";
import { isMobile } from "react-device-detect";
import "react-html5-camera-photo/build/css/index.css";

import { useFormik } from "formik";
import { CreateReceiptSchema } from "../types/schemas";
import {
  useCreateReceiptMutation,
  useGetAllTagsByUserQuery,
} from "../graphql/generated/graphql";

import expenseOptions from "../utils/maps";

import { useAuth } from "../utils/useAuth";

export default function CreateReceiptForm() {
  const router = useRouter();
  const { logout } = useAuth();

  const { loading: isTagsLoading, error: tagsError } = useGetAllTagsByUserQuery(
    {
      onCompleted: (data) => {
        setTagOptions(data.allUsersTags?.map((tag) => tag?.tagName!)!);
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
    }
  );
  const [createReceipt] = useCreateReceiptMutation();
  const [tagOptions, setTagOptions] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [imageName, setImageName] = useState("");
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filter = createFilterOptions<string>();

  const formik = useFormik({
    initialValues: {
      storeName: "",
      cost: 0,
      tax: 0,
      date: dayjs(Date.now()),
      expense: expenseOptions[0],
      tags: [],
      notes: "",
      receiptImage: null,
    },
    validationSchema: CreateReceiptSchema,
    onSubmit: async (values) => {
      if (!values.date.isValid()) {
        setError("Invalid Date");
      } else {
        console.log(values);
        createReceipt({
          variables: {
            storeName: values.storeName,
            cost: values.cost.toFixed(2),
            tax: values.tax.toFixed(2),
            date: values.date.toISOString().split("T")[0],
            expense: values.expense.value,
            tags: values.tags,
            notes: values.notes.trim(),
            receiptImage: values.receiptImage,
          },
          onError: (error) => {
            setError(error.message);

            if (
              error.message.startsWith("Please login") ||
              error.message.startsWith("Invalid Token")
            ) {
              logout();
              router.push("/login");
            }
          },
          onCompleted: () => {
            setError("");
            router.push("/");
          },
          refetchQueries: ["AllReceiptsByUser"],
        });
      }
    },
  });

    const handleTakePhotoAnimationDone = async (dataUri: any) => {
      const photo = new File(
        [await dataURLtoBlob(dataUri)],
        "cameraCapture.png",
        {
          type: "image/png",
        }
      );
      formik.setFieldValue("receiptImage", photo, true);
      setImageName("cameraCapture.png");
    };

    const dataURLtoBlob = async (dataURL: string) => {
      const response = await fetch(dataURL);
      const blob = await response.blob();
      return blob;
    };

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Grid
          container
          alignItems="center"
          justifyContent="center"
          direction="column"
          spacing={3}
          sx={{ py: { sm: "1rem", xs: "initial" } }}
        >
          {error && (
            <Grid item>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
          <Grid item>
            <TextField
              sx={{
                width: { xs: "18rem", sm: "25rem" },
                "@media (max-width: 430px)": {
                  width: "11rem",
                },
              }}
              id="storeName"
              name="storeName"
              label="Store Name"
              value={formik.values.storeName}
              onChange={formik.handleChange}
              error={
                formik.touched.storeName && Boolean(formik.errors.storeName)
              }
              helperText={formik.touched.storeName && formik.errors.storeName}
            />
          </Grid>
          <Grid item>
            <Box
              sx={{
                width: { xs: "18rem", sm: "25rem" },
                "@media (max-width: 430px)": {
                  width: "11rem",
                },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img
                src={
                  formik.values.receiptImage
                    ? URL.createObjectURL(formik.values.receiptImage)
                    : ReceiptPlaceholder.src
                }
                alt="Preview"
                style={{
                  width: "100%",
                  maxHeight: "25rem",
                  borderRadius: "5px",
                  cursor: `${
                    formik.values.receiptImage ? "pointer" : "initial"
                  }`,
                }}
                onClick={() => {
                  if (!formik.values.receiptImage) return;
                  setIsImageModalOpen(true);
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  mt: 1,
                }}
              >
                <Button
                  variant="outlined"
                  color="success"
                  sx={{
                    flexGrow: 1,
                    mr: 1,
                    "@media (max-width: 430px)": {
                      fontSize: "12.5px",
                    },
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Image
                </Button>
                <IconButton
                  aria-label="take photo"
                  onClick={() => {
                    setIsPhotoModalOpen(true);
                  }}
                >
                  <CameraAltIcon />
                </IconButton>
                <input
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    let imageName = file?.name || "";
                    if (file) {
                      formik.setFieldValue("receiptImage", file, true);
                      if (imageName.length > 30) {
                        imageName =
                          imageName.slice(0, 15) +
                          "..." +
                          imageName.slice(
                            imageName.length - 12,
                            imageName.length
                          );
                      }
                      setImageName(imageName);
                    }
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: "12px", alignSelf: "start" }}>
                {imageName ? imageName : "No File Chosen"}
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <DatePicker
              sx={{
                width: { xs: "18rem", sm: "25rem" },
                "@media (max-width: 430px)": {
                  width: "11rem",
                },
              }}
              label="Date"
              value={formik.values.date}
              onChange={(value) => formik.setFieldValue("date", value, true)}
              slotProps={{
                textField: {
                  variant: "outlined",
                  error:
                    formik.touched.date && Boolean(formik.errors.date?.isValid),
                  helperText:
                    formik.touched.date &&
                    (formik.errors.date?.isValid as boolean),
                },
              }}
            />
          </Grid>
          <Grid item>
            <Autocomplete
              disablePortal
              disableClearable
              id="expense"
              value={formik.values.expense}
              onChange={(e, value) => formik.setFieldValue("expense", value)}
              options={expenseOptions}
              sx={{
                width: { xs: "18rem", sm: "25rem" },
                "@media (max-width: 430px)": {
                  width: "11rem",
                },
              }}
              renderInput={(params) => (
                <TextField {...params} label="Expense Type" />
              )}
            />
          </Grid>
          <Grid item>
            <TextField
              sx={{
                width: { xs: "18rem", sm: "25rem" },
                "@media (max-width: 430px)": {
                  width: "11rem",
                },
              }}
              id="cost"
              name="cost"
              label="Cost"
              type="number"
              value={formik.values.cost}
              onChange={formik.handleChange}
              error={formik.touched.cost && Boolean(formik.errors.cost)}
              helperText={formik.touched.cost && formik.errors.cost}
            />
          </Grid>
          <Grid item>
            <TextField
              sx={{
                width: { xs: "18rem", sm: "25rem" },
                "@media (max-width: 430px)": {
                  width: "11rem",
                },
              }}
              id="tax"
              name="tax"
              label="Tax"
              type="number"
              value={formik.values.tax}
              onChange={formik.handleChange}
              error={formik.touched.tax && Boolean(formik.errors.tax)}
              helperText={formik.touched.tax && formik.errors.tax}
            />
          </Grid>

          <Grid item>
            <FormControl>
              {!tagsError && !isTagsLoading ? (
                <>
                  <Autocomplete
                    id="tags"
                    multiple
                    freeSolo
                    autoHighlight
                    handleHomeEndKeys
                    clearOnBlur
                    sx={{
                      width: { xs: "18rem", sm: "25rem" },
                      "@media (max-width: 430px)": {
                        width: "11rem",
                      },
                    }}
                    options={tagOptions.sort((a, b) => a.localeCompare(b))}
                    value={formik.values.tags}
                    renderInput={(params) => (
                      <TextField {...params} label="Tags" placeholder="Tags" />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index: number) => {
                        if (option) {
                          const label = option.startsWith("Add ")
                            ? option.substring(4)
                            : option;
                          return (
                            <Chip label={label} {...getTagProps({ index })} />
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
                      formik.setFieldValue("tags", updatedValues, true);

                      const currentValue = newValues.slice(-1)[0];
                      if (currentValue && currentValue.startsWith("Add ")) {
                        const temporaryTag = currentValue.substring(4);
                        if (temporaryTag) {
                          setTagOptions((prev) => [...prev, temporaryTag]);
                        }
                      } else if (
                        currentValue &&
                        !tagOptions.includes(currentValue)
                      ) {
                        setTagOptions((prev) => [...prev, currentValue]);
                      }
                    }}
                  />
                </>
              ) : (
                <Typography>No tags found</Typography>
              )}
            </FormControl>
          </Grid>
          <Grid item>
            <TextField
              sx={{
                width: { xs: "18rem", sm: "25rem" },
                "@media (max-width: 430px)": {
                  width: "11rem",
                },
              }}
              id="notes"
              name="notes"
              label="Notes"
              type="text"
              value={formik.values.notes}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid
            item
            xs={8}
            sx={{
              mt: 1,
            }}
          >
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                "@media (max-width: 430px)": {
                  fontSize: "13px",
                },
              }}
            >
              CREATE RECEIPT
            </Button>
          </Grid>
        </Grid>
      </form>
      <Modal
        open={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <>
          <img
            style={{
              maxHeight: "90%",
              maxWidth: "90%",
              objectFit: "contain",
              position: "relative",
            }}
            src={
              formik.values.receiptImage
                ? URL.createObjectURL(formik.values.receiptImage)
                : ReceiptPlaceholder.src
            }
            alt={
              formik.values.storeName
                ? `${formik.values.storeName} receipt enlarged`
                : `receipt enlarged`
            }
          />
          <IconButton
            aria-label="close image preview"
            onClick={() => {
              setIsImageModalOpen(false);
            }}
            sx={{ position: "absolute", top: 10, right: 10 }}
          >
            <CloseIcon />
          </IconButton>
        </>
      </Modal>
      <Modal
        open={isPhotoModalOpen}
        onClose={() => {
          setIsPhotoModalOpen(false);
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
                  setIsPhotoModalOpen(false);
                }}
                idealFacingMode={FACING_MODES.ENVIRONMENT}
              />
            )}
          </Box>
          <IconButton
            aria-label="close camera"
            onClick={() => {
              setIsPhotoModalOpen(false);
            }}
            sx={{ position: "absolute", top: 10, right: 10 }}
          >
            <CloseIcon />
          </IconButton>
        </>
      </Modal>
    </>
  );
}
