import { memo, useState, useEffect } from "react";
import Skeleton from "./ui/skeleton";

const SmartImageComponent = ({ src, alt, className, node, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [status, setStatus] = useState("loading"); // loading, success, error, retrying, failed
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setImgSrc(src);
    setStatus("loading");
    setAttempt(0);
  }, [src]);

  const handleError = () => {
    if (attempt === 0) {
      // First failure: try the proxy
      setStatus("retrying");
      setAttempt(1);
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(src)}`;
      setImgSrc(proxyUrl);
    } else {
      // Second failure: show fallback
      setStatus("failed");
    }
  };

  const handleLoad = () => {
    setStatus("success");
  };

  return (
    <div className={`relative ${className || ""}`}>
      {status === "loading" || status === "retrying" ? (
        <Skeleton
          variant='rectangle'
          height='h-64'
          className='w-full rounded-lg'
        />
      ) : null}

      {status !== "failed" && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={imgSrc}
          alt={alt || ""}
          width={props.width || 800}
          height={props.height || 600}
          className={`rounded-lg shadow-md my-4 max-w-full h-auto transition-opacity duration-300 ${
            status === "success"
              ? "opacity-100"
              : "opacity-0 absolute top-0 left-0"
          }`}
          loading='lazy'
          onError={handleError}
          onLoad={handleLoad}
          {...props}
        />
      )}

      {status === "failed" && (
        <div className='flex flex-col items-center justify-center w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
          <svg
            className='w-12 h-12 text-gray-400 mb-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
            ></path>
          </svg>
          <p className='text-sm text-gray-500 text-center'>
            Image failed to load
            <br />
            <a
              href={src}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-500 hover:underline'
            >
              Try direct link
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export const SmartImage = memo(SmartImageComponent);
SmartImage.displayName = "SmartImage";
