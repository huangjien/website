import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  const handleReset = () => {
    if (typeof reset === "function") {
      reset();
    }
  };

  return (
    <div className='hallmark-page' data-route='error'>
      <div className='hallmark-error'>
        <p className='hallmark-error-stat'>
          500<span className='hallmark-error-stat__dot'>.</span>
        </p>
        <h1 className='hallmark-error-message'>Something went wrong.</h1>
        <p className='hallmark-error-lede'>
          An unexpected error occurred. You can try again, or head back to the
          home page.
        </p>
        <div className='hallmark-error-actions'>
          <button
            type='button'
            className='hallmark-cta hallmark-cta--primary'
            onClick={handleReset}
          >
            Try again
          </button>
          <Link className='hallmark-cta hallmark-cta--secondary' href='/'>
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
