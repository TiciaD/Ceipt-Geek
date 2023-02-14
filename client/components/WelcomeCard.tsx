import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";
import Link from "next/link";

export default function WelcomeCard() {
  return (
    <Card sx={{ minWidth: 275, padding: "2rem" }}>
      <CardContent>
        <Typography variant="h4" sx={{ fontWeight: "bold" }} gutterBottom>
          Welcome to Receipt Tracker
        </Typography>
        <Typography>
          Stay on track with your expenses by storing and organizing your
          receipt information
        </Typography>
      </CardContent>
      <CardActions>
        <Button variant="contained" size="small">
          <Link href="/login">LOGIN</Link>
        </Button>
        <Button variant="contained" size="small">
          <Link href="/createaccount">CREATE AN ACCOUNT</Link>
        </Button>
      </CardActions>
    </Card>
  );
}
