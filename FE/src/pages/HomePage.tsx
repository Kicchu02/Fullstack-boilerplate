import { Button, Card, Flex, Spin, Typography } from "antd";
import type React from "react";
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
    <Flex align="center" justify="center" style={{ height: "100%" }}>
      {isLoading ? (
        <Spin size="large" />
      ) : (
        // Card replaces the hand-rolled bordered Stack: it already carries antd's border,
        // radius and padding tokens, so the box follows the theme instead of hardcoding it.
        <Card>
          <Flex vertical gap={16} align="center">
            <Typography.Text>{dummyData}</Typography.Text>
            <Button
              type="primary"
              danger
              loading={isSignOutLoading}
              onClick={async () => {
                await signOut();
                reset();
                navigateHelper.navigateToSignIn();
              }}
            >
              Sign Out
            </Button>
          </Flex>
        </Card>
      )}
    </Flex>
  );
};
