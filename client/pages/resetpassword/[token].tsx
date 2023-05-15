import { useRouter } from "next/router";
import { Box, CircularProgress } from "@mui/material";

import ResetPasswordUI from "../../components/ResetPasswordUI";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;

  if (!token) {
    return (
      <Box display="flex" justifyContent="center" padding="20px">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return <ResetPasswordUI token={token as string} />;
}
