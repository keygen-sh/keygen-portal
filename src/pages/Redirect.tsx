import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export default function Redirect() {
  const navigate = useNavigate();
  const user = false; // dummy

  useEffect(() => {
    if (user) {
      void navigate({ to: "/app/home" });
    } else {
      void navigate({ to: "/auth/login" });
    }
  }, [user, navigate]);

  return null;
}
