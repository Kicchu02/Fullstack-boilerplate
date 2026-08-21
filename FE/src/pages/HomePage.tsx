import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { useNavigateHelper } from "../RoutesHelper";
import { useHomePageStore } from "../stores/HomePageStore";

export const HomePage = (): React.ReactElement => {
  const navigateHelper = useNavigateHelper();
  const isLoading = useHomePageStore((s) => s.isLoading);
  const dummyData = useHomePageStore((s) => s.dummyData);
  const isSignOutLoading = useHomePageStore((s) => s.isSignOutLoading);
  const dummyAPI = useHomePageStore((s) => s.dummyAPI);
  const signOut = useHomePageStore((s) => s.signOut);
  const reset = useHomePageStore((s) => s.reset);

  // Zustand actions keep a stable identity for the life of the store, so depending on
  // them here does not re-fire the effect. Depending on the store object itself would.
  useEffect(() => {
    void dummyAPI();
    return reset;
  }, [dummyAPI, reset]);

  return (
    <Stack sx={{ height: "100%", alignItems: "center", justifyContent: "center" }}>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <Stack
          sx={{
            gap: 2,
            alignItems: "center",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            p: 2,
          }}
        >
          <Typography variant="subtitle1">{dummyData}</Typography>
          <Button
            variant="contained"
            color="error"
            loading={isSignOutLoading}
            onClick={async () => {
              await signOut();
              reset();
              navigateHelper.navigateToSignIn();
            }}
          >
            Sign Out
          </Button>
        </Stack>
      )}
    </Stack>
  );
};
