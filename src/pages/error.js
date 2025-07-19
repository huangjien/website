import React, { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  const handleReset = () => {
    if (typeof reset === 'function') {
      reset();
    }
  };

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={handleReset}>
        Try again
      </button>
    </div>
  );
}
