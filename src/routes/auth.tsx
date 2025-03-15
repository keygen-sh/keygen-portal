import { createFileRoute } from "@tanstack/react-router";
import * as Layout from "@layouts/index";

export const Route = createFileRoute("/auth")({
  component: () => <Layout.Auth />,
});
