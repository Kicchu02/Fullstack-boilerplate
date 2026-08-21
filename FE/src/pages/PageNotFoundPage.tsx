import { Button, Stack, Typography } from "@mui/material";
import type React from "react";
import { useNavigateHelper } from "../RoutesHelper";

export const PageNotFoundPage = (): React.ReactElement => {
  const navigate = useNavigateHelper();

  return (
    <Stack
      sx={{
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <Typography variant="h1">404</Typography>
      <Typography variant="h2">Page Not Found</Typography>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => {
          navigate.navigateToHome();
        }}
      >
        Go to Home
      </Button>
    </Stack>
  );
};
