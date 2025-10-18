import React from "react";

export default function Divider({ className = "my-3" }) {
  return (
    <hr
      data-testid='divider'
      className={`border-border/60 ring-0 ${className}`}
    />
  );
}
