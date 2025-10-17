import React from "react";

export default function Divider({ className = "my-2" }) {
  return <hr data-testid="divider" className={`border-border ${className}`} />;
}