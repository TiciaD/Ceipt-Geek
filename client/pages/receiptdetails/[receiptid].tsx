import { 
    Box, 
    Card, 
    CardContent, 
    Typography,
    Button,
    Chip
} from "@mui/material";
import { useRouter } from 'next/router';
import { useReceiptQuery, useUpdateReceiptMutation, ReceiptInput, useGetAllUsersTagsQuery } from "../../graphql/generated/graphql";
import { useState, useEffect } from "react";
import { expenseOptions } from '../../utils/choices'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import expenseMap from "../../constants/expenseMap";



export default function ReceiptDetails(){
    const router = useRouter()
    const { receiptid } = router.query;
    const { data, loading, error, refetch } = useReceiptQuery({
        variables: {
            receiptId: receiptid ? String(receiptid) : ''
        },
        fetchPolicy: "cache-and-network"
    });
    useGetAllUsersTagsQuery({
        onCompleted: (data) => {

            const tagNames = data?.allUsersTags?.map(tag => tag?.tagName || "") || []
            
                setTags(tagNames)
        },
        fetchPolicy: "cache-and-network"
    })
    
    const filter = createFilterOptions<string>();
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
    const [tags, setTags] = useState<string[]>([]);
    const [imageUpload, setImageUpload] = useState<File | null>(null)

    const handleEdit = () => {
        setIsEditing(true)
    };
    useEffect(() => {
        if (data?.receipt) {
            setEditedReceipt({
                storeName: data?.receipt?.storeName,
                expense: data?.receipt?.expense,
                date: data?.receipt?.date,
                cost: data?.receipt?.cost,
                tax: data?.receipt?.tax,
                notes: data?.receipt?.notes,
                tags: data?.receipt?.tags.map(tag => tag.tagName), 
                receiptImage: data?.receipt?.receiptImage,
            });
        }
    }, [data]);

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
            refetch()
        },
        onError: (error) => {
            console.error("Mutation error:", error);
        },
    });
    setImageUpload(null)
};

    
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
                <Card sx={{ width: "45rem", height: "auto", padding: "1rem", marginTop: "3rem" }}>
                    <Typography variant="h4" sx={{ fontWeight: "bold", padding: "1rem"}}>
                        <TextField  variant="standard" onChange={(e) => setEditedReceipt({ ...editedReceipt, storeName: e.target.value })} type="text" name="storeName" value={data?.receipt?.storeName} style={{fontSize: "1.2rem", color:"white", borderRight:"none", backgroundColor: 'transparent'}} />
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
                                        setImageUpload(file);
                                    }
                                }} />
                                <p style={{marginBottom: 1, marginTop: -4}}>Created: {data?.receipt?.date} </p>
                                <Button sx={{height:"35px", width:"150px", mb: 2}} onClick={handleEdit} variant="contained" >Edit Receipt</Button>
                                <Button color="secondary" sx={{height:"35px", width:"150px", mb: 2}} variant="contained"><p style={{ margin: 0 , lineHeight: 1 }}>Delete Receipt</p></Button>
                            </Box>
                        </CardContent>
                        <CardContent>
                            <Autocomplete
                                options={expenseOptions}
                                defaultValue={{value:data?.receipt?.expense!, label:expenseMap[data?.receipt?.expense!].displayString}}
                                disableClearable
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
                            <p style={{fontSize: "1.5rem"}}>Total:<TextField variant="standard" onChange={(e) => setEditedReceipt({ ...editedReceipt, cost: e.target.value })} type="text" name="cost" value={data?.receipt?.cost} style={{fontSize: "1.2rem", color:"white", borderRight:"none", backgroundColor: 'transparent'}} /></p>
                            <p style={{fontSize: "1.5rem"}}>Tax:<TextField variant="standard" onChange={(e) => setEditedReceipt({ ...editedReceipt, tax: e.target.value })} type="text" name="tax" value={data?.receipt?.tax} style={{fontSize: "1.2rem", color:"white", borderRight:"none", backgroundColor: 'transparent'}} /></p>
                            <Autocomplete
                                freeSolo
                                multiple
                                autoHighlight
                                handleHomeEndKeys
                                clearOnBlur
                                options={tags?.sort((a, b) => a.localeCompare(b))}
                                sx={{ width: 300, mt:2 }}
                                value={editedReceipt.tags || []}
                                renderInput={(params) => (
                                    <TextField
                                    {...params}
                                    variant="filled"
                                    style={{ fontSize: '1.2rem', color: 'white', borderRight: 'none', backgroundColor: 'transparent' }}
                                    />
                                )}
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
                                                />
                                            );
                                        }
                                        return null; // Handle null option
                                    })
                                }
                                filterOptions={(options, params) => {
                                    const filteredOptions = options.filter((option): option is string => option !== null);
                                    
                                    const filtered = filter(filteredOptions, params);

                                    const { inputValue } = params;
                                    const isExisting = options.some((option) => inputValue === option);
                        
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
                                <p style={{fontSize: "1.5rem"}}>Notes:<TextField variant="standard" onChange={(e) => setEditedReceipt({ ...editedReceipt, notes: e.target.value })} type="text" name="notes" value={data?.receipt?.notes || ''}/></p>
                            <Button sx={{height:"35px", width:"150px", mb: 2, ml:5}} variant="contained" onClick={handleSubmit}>Save Changes</Button>
                        </CardContent>
                    </Box>
                </Card>
                ):(
                <Card sx={{ width: "45rem", height: "auto", padding: "1rem", marginTop: "3rem" }}>
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
                            <p style={{fontSize: "1.2rem"}}>Category: {expenseMap[data?.receipt?.expense!].displayString}</p>
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
