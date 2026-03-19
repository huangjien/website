import { ApiError, ensureMethod, withErrorHandling } from "../../lib/apiClient";

const handler = withErrorHandling(async (req, res) => {
  if (!ensureMethod(req, res, ["POST"])) {
    return;
  }

  throw new ApiError("Endpoint retired", 410);
});

export default handler;
