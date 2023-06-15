import React, { useRef, useState } from "react";
import Camera, { FACING_MODES } from "react-html5-camera-photo";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

import { isMobile } from "react-device-detect";
import "react-html5-camera-photo/build/css/index.css";

const FormWithPhoto = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = (event: any) => {
    const file = event.target.files[0];
    setPhoto(file);
  };

  const handleTakePhotoAnimationDone = async (dataUri: any) => {
    const photo = new File(
      [await dataURLtoBlob(dataUri)],
      "capturedImage.png",
      {
        type: "image/png",
      }
    );
    setPhoto(photo);
  };

  const dataURLtoBlob = async (dataURL: string) => {
    const response = await fetch(dataURL);
    const blob = await response.blob();
    return blob;
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    console.log("photo", photo);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleFileInputClick}
          >
            Upload Photo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePhotoUpload}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setModalIsOpen(true);
            }}
          >
            Take Photo
          </Button>
        </Box>
        {photo && (
          <img
            src={URL.createObjectURL(photo)}
            alt="Preview"
            style={{ width: "75%" }}
          />
        )}
        <Button type="submit" variant="outlined">
          Submit
        </Button>
      </form>
      <Modal
        open={modalIsOpen}
        onClose={() => {
          setModalIsOpen(false);
        }}
      >
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
          {modalIsOpen && (
            <Camera
              onTakePhotoAnimationDone={(dataUri) => {
                handleTakePhotoAnimationDone(dataUri);
                setModalIsOpen(false);
              }}
              idealFacingMode={FACING_MODES.ENVIRONMENT}
            />
          )}
        </Box>
      </Modal>
    </>
  );
};

export default FormWithPhoto;

// const FormWithPhoto = () => {
//   const [photo, setPhoto] = useState<File | null>(null);
//   const [open, setOpen] = useState(false);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const streamRef = useRef<MediaStream | null>(null);

//   const handlePhotoUpload = (event: any) => {
//     const file = event.target.files[0];
//     setPhoto(file);
//   };

//   const handleTakePhoto = async () => {
//     setOpen(true);
//     await new Promise((resolve) => setTimeout(resolve, 100));
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//     streamRef.current = stream;
//     const video = videoRef.current!;
//     video.srcObject = stream;
//     video.play();
//   };

//   const handleCapture = async () => {
//     const video = videoRef.current!;
//     const canvas = document.createElement("canvas");
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     const context = canvas.getContext("2d")!;
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);
//     const photo = canvas.toDataURL("image/png");
//     if (photo) {
//       setPhoto(
//         new File([await dataURLtoBlob(photo)], "capturedImage.png", {
//           type: "image/png",
//         })
//       );
//     }
//     setOpen(false);
//     streamRef.current?.getTracks().forEach((track) => track.stop());
//   };

//   const dataURLtoBlob = async (dataURL: string) => {
//     const response = await fetch(dataURL);
//     const blob = await response.blob();
//     return blob;
//   };

//   const handleSubmit = async (event: any) => {
//     event.preventDefault();
//     console.log("photo", photo);
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <input type="file" accept="image/*" onChange={handlePhotoUpload} />
//       <br />
//       <br />
//       <Button variant="contained" color="primary" onClick={handleTakePhoto}>
//         Take Photo
//       </Button>
//       <br />
//       {photo && <img src={URL.createObjectURL(photo)} alt="Preview" />}
//       <br />
//       <Button type="submit">Submit</Button>
//       <Modal
//         open={open}
//         onClose={() => {
//           setOpen(false);
//           streamRef.current?.getTracks().forEach((track) => track.stop());
//         }}
//       >
//         <Box
//           style={{
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             backgroundColor: "#fff",
//             padding: "20px",
//             borderRadius: "5px",
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//           }}
//         >
//           <video
//             style={{ width: "640px", height: "480px" }}
//             autoPlay
//             ref={videoRef}
//           ></video>
//           <Button
//             style={{ margin: "10px" }}
//             variant="contained"
//             color="primary"
//             onClick={handleCapture}
//           >
//             Capture
//           </Button>
//         </Box>
//       </Modal>
//     </form>
//   );
// };

// export default FormWithPhoto;

// import React, { useState } from "react";

// const FormWithPhoto = () => {
//   const [photo, setPhoto] = useState<File | null>(null);

//   const handlePhotoUpload = (event: any) => {
//     const file = event.target.files[0];
//     setPhoto(file);
//   };

//   const handleTakePhoto = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//     const video = document.createElement("video");
//     video.srcObject = stream;
//     video.play();
//     const canvas = document.createElement("canvas");
//     canvas.width = 640;
//     canvas.height = 480;
//     const context = canvas.getContext("2d")!;

//     // Create modal container and add styles
//     const modalContainer = document.createElement("div");
//     modalContainer.style.position = "fixed";
//     modalContainer.style.top = "0";
//     modalContainer.style.left = "0";
//     modalContainer.style.width = "100%";
//     modalContainer.style.height = "100%";
//     modalContainer.style.display = "flex";
//     modalContainer.style.justifyContent = "center";
//     modalContainer.style.alignItems = "center";
//     modalContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

//     // Create video container and add styles
//     const videoContainer = document.createElement("div");
//     videoContainer.style.position = "relative";
//     videoContainer.style.width = "640px";
//     videoContainer.style.height = "480px";

//     // Add video and capture button to the video container
//     videoContainer.appendChild(video);
//     const captureButton = document.createElement("button");
//     captureButton.innerText = "Capture";
//     captureButton.style.position = "absolute";
//     captureButton.style.bottom = "0";
//     captureButton.style.left = "50%";
//     captureButton.style.transform = "translateX(-50%)";
//     videoContainer.appendChild(captureButton);

//     // Create close button and add styles
//     const closeButton = document.createElement("button");
//     closeButton.innerText = "X";
//     closeButton.style.position = "absolute";
//     closeButton.style.top = "10px";
//     closeButton.style.right = "10px";
//     closeButton.style.backgroundColor = "transparent";
//     closeButton.style.border = "none";
//     closeButton.style.fontSize = "24px";
//     closeButton.style.fontWeight = "bold";
//     closeButton.style.color = "#fff";
//     closeButton.style.cursor = "pointer";

//     // Close modal when close button is clicked
//     closeButton.addEventListener("click", () => {
//       modalContainer.remove();
//       stream.getTracks().forEach((track) => track.stop());
//     });

//     // Close modal when user clicks outside of the video container
//     modalContainer.addEventListener("click", (event) => {
//       if (event.target === modalContainer) {
//         modalContainer.remove();
//         stream.getTracks().forEach((track) => track.stop());
//       }
//     });

//     // Capture photo and set it as the value of the photo state
//     captureButton.addEventListener("click", async () => {
//       context.drawImage(video, 0, 0, canvas.width, canvas.height);
//       const photo = canvas.toDataURL("image/png");
//       if (photo) {
//         setPhoto(
//           new File([await dataURLtoBlob(photo)], "capturedImage.png", {
//             type: "image/png",
//           })
//         );
//       }
//       modalContainer.remove();
//       stream.getTracks().forEach((track) => track.stop());
//     });

//     // Add video container and close button to the modal container
//     modalContainer.appendChild(videoContainer);
//     modalContainer.appendChild(closeButton);

//     // Add modal container to the document body
//     document.body.appendChild(modalContainer);
//   };

//   const dataURLtoBlob = async (dataURL: string) => {
//     const response = await fetch(dataURL);
//     const blob = await response.blob();
//     return blob;
//   };

//   const handleSubmit = async (event: any) => {
//     event.preventDefault();
//     const formData = new FormData();
//     if (photo) {
//       formData.append("photo", photo);
//     }
//     console.log("form", formData);
//     console.log("photo", photo);
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <label>
//         Choose File:
//         <input type="file" accept="image/*" onChange={handlePhotoUpload} />
//       </label>
//       <br />
//       <button type="button" onClick={handleTakePhoto}>
//         Take Photo
//       </button>
//       <br />
//       {photo && <img src={URL.createObjectURL(photo)} alt="Preview" />}
//       <br />
//       <button type="submit">Submit</button>
//     </form>
//   );
// };

// export default FormWithPhoto;
