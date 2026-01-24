import { memo } from "react";

const CustomImageComponent = ({ src, alt, ...props }) => {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt || ""}
      className='rounded-lg shadow-md my-4 max-w-full h-auto'
      loading='lazy'
      {...props}
    />
  );
};

export const CustomImage = memo(CustomImageComponent);
CustomImage.displayName = "CustomImage";
