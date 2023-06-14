import { 
    Box, 
    Card, 
    CardContent, 
    Typography,
    Button
} from "@mui/material";
import { useRouter } from 'next/router';
import { useReceiptQuery, useUpdateReceiptMutation, ReceiptType, ReceiptInput } from "../../graphql/generated/graphql";
import { DialogContent, Dialog } from '@mui/material';
import { useState, useEffect } from "react";
import { expenseOptions } from '../../utils/choices'
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import axios from 'axios';



export default function ReceiptDetails(){
    const router = useRouter()
    const { receiptid } = router.query;
    const { data, loading, error, refetch } = useReceiptQuery({
        variables: {
            receiptId: receiptid ? String(receiptid) : ''
        },
        onCompleted: (data) => {
            if(data.receipt){
                setEditedReceipt(data.receipt as unknown as ReceiptInput) 
            }
            console.log(data.receipt)
        }
    });
    const [updateReceiptMutation] = useUpdateReceiptMutation();
    const [isImageModalOpen, setImageModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedReceipt, setEditedReceipt] = useState<ReceiptInput>({
        storeName: data?.receipt?.storeName || '',
        expense: data?.receipt?.expense || 'FOOD',
        date: data?.receipt?.date,
        cost: data?.receipt?.cost,
        tax: data?.receipt?.tax,
        notes: data?.receipt?.notes,
        tags: data?.receipt?.tags.map(tag => tag.tagName) || [], 
        receiptImage: data?.receipt?.receiptImage,
    });
    console.log("state",editedReceipt)
    const [imageFile, setImageFile] = useState<File | null>(null);
    console.log('image',imageFile)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setImageFile(file || null);
    };


    useEffect(() => {
        if (data?.receipt) {
            setEditedReceipt((prevState) => ({
            ...prevState,
            storeName: data?.receipt?.storeName || '',
            expense: data?.receipt?.expense || 'FOOD',
            date: data?.receipt?.date,
            cost: data?.receipt?.cost,
            tax: data?.receipt?.tax,
            notes: data?.receipt?.notes || '',
            tags: data?.receipt?.tags.map((tag) => tag.tagName) || [],
            receiptImage: data?.receipt?.receiptImage,
            }));
        }
    }, [data]);

    const handleEdit = () => {
        setIsEditing(true)
    };

    const handleSubmit = () => {
        try {
        const receiptInput = {
            storeName: editedReceipt.storeName,
            expense: editedReceipt.expense,
            date: editedReceipt.date,
            cost: editedReceipt.cost,
            tax: editedReceipt.tax,
            notes: editedReceipt.notes,
            tags: editedReceipt.tags,
            receiptImage: editedReceipt.receiptImage
          };
      
          // Perform the file upload if an image file exist
            // Call the mutation to update the receipt without the image file
            console.log("receipt input",receiptInput)
            updateReceiptMutation({
              variables: {
                receiptId: receiptid ? String(receiptid) : '',
                receiptData: receiptInput
              },
            })
            .then((response) => {
              // Handle successful response
              console.log("update",response);
              setIsEditing(false); // Reset the state and exit edit mode
      
              // Update the state with the updated data
              if (response?.data?.updateReceipt) {
                const updatedReceipt = {
                  ...editedReceipt,
                  ...response.data.updateReceipt
                };
                console.log("updated receipt", updatedReceipt)
                setEditedReceipt(updatedReceipt);
                refetch(); // Refetch the data to get the updated receipt
              }
            })
            .catch((error) => {
              // Handle error
              console.error(error);
            });
          
        } catch (error) {
          // Handle error
          console.error(error);
        }
      };

    // console.log('Data', data)
    
    if (loading) {
        // Render a loading state if the query is still in progress
        return <div>Loading...</div>;
    }
    
    if (error) {
        // Render an error message if there was an error with the query
        return <div>Error: {error.message}</div>;
    }
    return(
        <>
            {isEditing ? (
                <Card sx={{ width: "45rem", height:"31rem", padding: "1rem", marginTop: "3rem" }}>
                    <Typography variant="h4" sx={{ fontWeight: "bold", padding: "1rem"}}>
                        <TextField  variant="standard" onChange={(e) => setEditedReceipt({ ...editedReceipt, storeName: e.target.value })} type="text" name="storeName" value={editedReceipt.storeName} style={{fontSize: "1.2rem", color:"white", borderRight:"none", backgroundColor: 'transparent'}} />
                    </Typography>       
                    <Box sx={{display: "flex",marginTop: -2}}>
                        <CardContent sx={{marginRight:10}}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'left'}}>
                                <img 
                                    style={{cursor: "pointer",
                                    marginBottom:".5rem",
                                    border: '1px solid black',
                                    objectFit:"cover",
                                    width:"200px",
                                    height:'250px'
                                    }}
                                    src={data?.receipt?.receiptImage || "https://us.123rf.com/450wm/yupiramos/yupiramos1906/yupiramos190634334/124990112-receipt-paper-isolated-icon-vector-illustration-design.jpg?ver=6"}
                                    alt="your-image-alt"
                                    onClick={() => setImageModalOpen(true)}
                                />
                                <input type="file" onChange={(e) => {
                                    const file = e.target.files && e.target.files[0];
                                    if (file) {
                                        setEditedReceipt({ ...editedReceipt, receiptImage: file });
                                    }
                                }} />
                                <p style={{marginBottom: 1, marginTop: -4}}>Created: {data?.receipt?.date} </p>
                                <Button sx={{height:"35px", width:"150px", mb: 2}} onClick={handleEdit} variant="contained" >Edit Receipt</Button>
                                <Button color="secondary" sx={{height:"35px", width:"150px", mb: 2}} variant="contained"><p style={{ margin: 0 , lineHeight: 1 }}>Delete Receipt</p></Button>
                            </Box>
                        </CardContent>
                        <CardContent>
                            {/* Use autocomplete component */}
                            <Autocomplete
                                options={expenseOptions}
                                value={editedReceipt.expense ? { value: editedReceipt.expense, label: editedReceipt.expense } : null}
                                onChange={(_event, newValue) => {
                                    const selectedExpense = newValue ? newValue : null;
                                    setEditedReceipt({ ...editedReceipt, expense: (selectedExpense && selectedExpense.value) || '' });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                    {...params}
                                    label="Category"
                                    variant="outlined"
                                    style={{ fontSize: '1.2rem', color: 'white', borderRight: 'none', backgroundColor: 'transparent' }}
                                    />
                                )}
                            />
                            <p style={{fontSize: "1.5rem"}}>Total:<TextField variant="standard" onChange={(e) => setEditedReceipt({ ...editedReceipt, cost: e.target.value })} type="text" name="cost" value={editedReceipt.cost} style={{fontSize: "1.2rem", color:"white", borderRight:"none", backgroundColor: 'transparent'}} /></p>
                            <p style={{fontSize: "1.5rem"}}>Tax:<TextField variant="standard" onChange={(e) => setEditedReceipt({ ...editedReceipt, tax: e.target.value })} type="text" name="tax" value={editedReceipt.tax} style={{fontSize: "1.2rem", color:"white", borderRight:"none", backgroundColor: 'transparent'}} /></p>
                            {/* Use autocomplete component */}
                            <Autocomplete
                                freeSolo
                                multiple
                                options={[]}
                                value={editedReceipt.tags || undefined}
                                onChange={(event, newValue) => {
                                    setEditedReceipt({ ...editedReceipt, tags: newValue });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                    {...params}
                                    variant="filled"
                                    style={{ fontSize: '1.2rem', color: 'white', borderRight: 'none', backgroundColor: 'transparent' }}
                                    />
                                )}
                                />
                                <p style={{fontSize: "1.5rem"}}>Notes:<TextField variant="standard" onChange={(e) => setEditedReceipt({ ...editedReceipt, notes: e.target.value })} type="text" name="notes" value={editedReceipt.notes || ''}/></p>
                            <Button sx={{height:"35px", width:"150px", mb: 2, ml:5}} variant="contained" onClick={handleSubmit}>Save Changes</Button>
                        </CardContent>
                    </Box>
                </Card>
                ):(
                <Card sx={{ width: "45rem", height:"31rem", padding: "1rem", marginTop: "3rem" }}>
                    <Typography variant="h4" sx={{ fontWeight: "bold", padding: "1rem"}}>
                            {data?.receipt?.storeName}
                    </Typography>       
                    <Box sx={{display: "flex",marginTop: -2}}>
                        <CardContent sx={{marginRight:10}}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'left'}}>
                                <img 
                                    style={{cursor: "pointer",
                                    marginBottom:".5rem",
                                    border: '1px solid black',
                                    objectFit:"cover",
                                    width:"200px",
                                    height:'250px'
                                    }}
                                    src={data?.receipt?.receiptImage || "https://us.123rf.com/450wm/yupiramos/yupiramos1906/yupiramos190634334/124990112-receipt-paper-isolated-icon-vector-illustration-design.jpg?ver=6"}
                                    alt="your-image-alt"
                                    onClick={() => setImageModalOpen(true)}
                                />                
                                <p style={{marginBottom: 1, marginTop: -4}}>Created: {data?.receipt?.date} </p>
                                <Button onClick={handleEdit} sx={{height:"35px", width:"150px", mb: 2}} variant="contained">Edit Receipt</Button>
                                <Button color="secondary" sx={{height:"35px", width:"150px", mb: 2}} variant="contained"><p style={{ margin: 0 , lineHeight: 1 }}>Delete Receipt</p></Button>
                            </Box>
                        </CardContent>
                        <CardContent>
                            <p style={{fontSize: "1.2rem"}}>Category: {data?.receipt?.expense}</p>
                            <p style={{fontSize: "1.5rem"}}>Total: ${data?.receipt?.cost}</p>
                            <p style={{fontSize: "1.5rem"}}>Tax: ${data?.receipt?.tax}</p>
                            <p style={{fontSize: "1.5rem"}}>Tags: {data?.receipt?.tags.map(tag => tag.tagName).join(', ')}</p>
                            <p style={{fontSize: "1.5rem"}}>Notes: {data?.receipt?.notes}</p>
                        </CardContent>
                    </Box>
                </Card>
            )}
        {isImageModalOpen && (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999
            }}
          onClick={() => setImageModalOpen(false)} // Handle click event to close the image modal
        >
            <img
                style={{
                maxHeight: "90%",
                maxWidth: "90%",
                objectFit: "contain"
                }}
            src={data?.receipt?.receiptImage || "https://us.123rf.com/450wm/yupiramos/yupiramos1906/yupiramos190634334/124990112-receipt-paper-isolated-icon-vector-illustration-design.jpg?ver=6"}
            alt="enlarged-image"
            />
        </div>
    )}
    </>
    )
}
