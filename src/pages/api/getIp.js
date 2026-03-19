import { ApiError, ensureMethod, withErrorHandling } from "../../lib/apiClient";

const handler = withErrorHandling(async (req, res) => {
  if (!ensureMethod(req, res, ["GET"])) {
    return;
  }

  throw new ApiError("Endpoint retired", 410);
});

export default handler;
