import { Button, Flex, Typography } from "antd";
import type React from "react";
import { useNavigateHelper } from "../RoutesHelper";

export const PageNotFoundPage = (): React.ReactElement => {
  const navigate = useNavigateHelper();

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      gap={16}
      style={{ height: "100%" }}
    >
      <Typography.Title level={1} style={{ marginBottom: 0 }}>
        404
      </Typography.Title>
      <Typography.Title level={2} style={{ marginTop: 0 }}>
        Page Not Found
      </Typography.Title>
      <Button
        size="large"
        onClick={() => {
          navigate.navigateToHome();
        }}
      >
        Go to Home
      </Button>
    </Flex>
  );
};
