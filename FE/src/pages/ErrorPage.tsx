import { Button, Stack, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import type React from "react";
import { useNavigateHelper } from "../RoutesHelper";

export const ErrorPage = observer((): React.ReactElement => {
  const navigateHelper = useNavigateHelper();

  return (
    <Stack height="100%" alignItems="center" justifyContent="center" gap={2}>
      <Typography variant="h1">500</Typography>
      <Typography variant="h2">Internal Server Error</Typography>
      <Button
        variant="outlined"
        size="large"
        onClick={() => navigateHelper.navigateToHome()}
      >
        Go to Home
      </Button>
    </Stack>
  );
});
