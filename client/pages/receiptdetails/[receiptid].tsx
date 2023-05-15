import { 
    Box, 
    Card, 
    CardContent, 
    Typography,
    Button
} from "@mui/material";

//import hook

export default function ReceiptDetails(){
    return(
        <>
        <Card sx={{ width: "45rem", height:"31rem", padding: "1rem", marginTop: "3rem" }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", padding: "1rem"}}>
                    Store Name
            </Typography>
            <Box sx={{display: "flex",marginTop: -2}}>
                <CardContent sx={{marginRight:10}}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'left'}}>
                        <img style={{marginBottom:".5rem", border: '1px solid black', objectFit:"cover", width:"200px", height:'250px'}} src="https://templates.invoicehome.com/receipt-template-us-band-blue-750px.png" alt="your-image-alt" />
                        <p style={{marginBottom: 1, marginTop: -4}}>Created: 05/07/2023 </p>
                        <Button sx={{height:"35px", width:"150px", mb: 2}} variant="contained">Button 1</Button>
                        <Button sx={{height:"35px", width:"150px", mb: 2}} variant="contained">Button 2</Button>
                    </Box>
                </CardContent>
                <CardContent>
                    <p>Category:</p>
                    <p>Total:</p>
                    <p>Tax:</p>
                    <p>Tags:</p>
                    <p>Notes:</p>
                </CardContent>
            </Box>
        </Card>
    </>
    )
}
