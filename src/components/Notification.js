import { toast } from "react-toastify";

export const success = (content) => {
  toast.success(content);
};

export const info = (content) => {
  toast.info(content);
};

export const warn = (content) => {
  toast.warn(content, { autoClose: 8000 });
  content;
};

export const error = (content) => {
  toast.error(content, { autoClose: false });
};
