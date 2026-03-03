"use client";

import { memo, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { useTheme } from "next-themes";

export const ToastProvider = memo(() => {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <ToastContainer
      autoClose={5000}
      limit={3}
      pauseOnHover
      closeOnClick
      theme={
        mounted && (currentTheme === "dark" || theme === "dark")
          ? "dark"
          : "light"
      }
      draggable
    />
  );
});
