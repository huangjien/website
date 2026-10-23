import { getServerSession } from "next-auth/next";
import { ensureMethod, withErrorHandling } from "../../lib/apiClient";
import { isBlogAuthor } from "../../lib/blogAuthor";
import { authOptions } from "./auth/[...nextauth]";

const handler = withErrorHandling(async (req, res) => {
  if (!ensureMethod(req, res, ["GET"])) return;

  const session = await getServerSession(req, res, authOptions);
  return res.status(200).json({
    authenticated: Boolean(session?.user),
    canPublish: isBlogAuthor(session),
  });
});

export default handler;
