import { memo, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import Skeleton from "./ui/skeleton";

const toProxyUrl = (value) =>
  `/api/image-proxy?url=${encodeURIComponent(value)}`;

/**
 * Attachments in a private GitHub repository need the GitHub token, so the
 * browser cannot load them on its own. They go straight to the proxy.
 * @param {string} value - The image source
 * @returns {boolean} - True for a private GitHub attachment
 */
const isPrivateAttachment = (value) =>
  typeof value === "string" &&
  value.startsWith("https://github.com/user-attachments/");

/**
 * Build the attempt list for an image source.
 *
 * 1. A private attachment: the proxy only. The Next.js image optimizer sends
 *    no GitHub token, so it cannot read a private attachment.
 * 2. Every other source: the image itself, then the proxy, then the image
 *    again as a plain element that skips the image optimizer.
 *
 * @param {string} src - The image source
 * @returns {Array} - The attempts, each with a url and a plain flag
 */
const buildAttempts = (src) => {
  if (!src) return [];
  const proxyUrl = toProxyUrl(src);
  if (isPrivateAttachment(src)) {
    return [{ url: proxyUrl, plain: false }];
  }
  return [
    { url: src, plain: false },
    { url: proxyUrl, plain: false },
    { url: src, plain: true },
  ];
};

const SmartImageComponent = ({
  src,
  alt,
  className,
  node: _node,
  ...props
}) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState("loading"); // loading, success, failed
  const [attempt, setAttempt] = useState(0);
  const width = Number(props.width) || 800;
  const height = Number(props.height) || 600;

  const attempts = useMemo(() => buildAttempts(src), [src]);
  const current = attempts[attempt];

  useEffect(() => {
    setStatus("loading");
    setAttempt(0);
  }, [src]);

  const handleError = () => {
    if (attempt + 1 < attempts.length) {
      setStatus("retrying");
      setAttempt((value) => value + 1);
      return;
    }
    setStatus("failed");
  };

  const handleLoad = () => {
    setStatus("success");
  };

  const imageClass = `rounded-lg shadow-md my-4 max-w-full h-auto transition-opacity duration-300 ${
    status === "success" ? "opacity-100" : "opacity-0 absolute top-0 left-0"
  }`;

  return (
    <div className={`relative ${className || ""}`}>
      {status === "loading" || status === "retrying" ? (
        <Skeleton
          variant='rectangle'
          height='h-64'
          className='w-full rounded-lg'
        />
      ) : null}

      {status !== "failed" &&
        (current?.plain ? (
          // The Next.js image component rejects hosts outside remotePatterns.
          // A plain element loads the image without the optimizer.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            {...props}
            data-testid='smart-image-direct'
            src={current.url}
            alt={alt || ""}
            width={width}
            height={height}
            loading='lazy'
            decoding='async'
            referrerPolicy='no-referrer'
            onError={handleError}
            onLoad={handleLoad}
            className={imageClass}
          />
        ) : (
          <Image
            src={current?.url || ""}
            alt={alt || ""}
            width={width}
            height={height}
            unoptimized={current?.url?.startsWith("/api/image-proxy")}
            className={imageClass}
            loading='lazy'
            onError={handleError}
            onLoad={handleLoad}
            style={{ height: "auto" }}
            {...props}
          />
        ))}

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
              d='M16 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
            ></path>
          </svg>
          <p className='text-sm text-gray-500 text-center'>
            {t("smart_image.load_failed", {
              defaultValue: "Image failed to load",
            })}
            <br />
            <a
              href={src}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-500 hover:underline'
            >
              {t("smart_image.try_direct_link", {
                defaultValue: "Try direct link",
              })}
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export const SmartImage = memo(SmartImageComponent);
SmartImage.displayName = "SmartImage";
