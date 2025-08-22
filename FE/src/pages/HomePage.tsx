import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useNavigateHelper } from "../RoutesHelper";
import { useHomePageStore } from "../stores/hooks";

export const HomePage = observer((): React.ReactElement => {
  const homePageStore = useHomePageStore();
  const navigateHelper = useNavigateHelper();

  useEffect(() => {
    homePageStore.dummyAPI();
    return homePageStore.reset;
  }, [homePageStore]);

  return (
    <Stack height="100%" alignItems="center" justifyContent="center">
      {homePageStore.isLoading ? (
        <CircularProgress />
      ) : (
        <Stack
          gap={2}
          alignItems="center"
          border="1px solid"
          borderColor="divider"
          borderRadius={2}
          p={2}
        >
          <Typography variant="subtitle1">{homePageStore.dummyData}</Typography>
          <Button
            variant="contained"
            color="error"
            loading={homePageStore.isSignOutLoading}
            onClick={async () => {
              await homePageStore.signOut();
              homePageStore.reset();
              navigateHelper.navigateToSignIn();
            }}
          >
            Sign Out
          </Button>
        </Stack>
      )}
    </Stack>
  );
});
