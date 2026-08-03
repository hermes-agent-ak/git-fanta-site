import { z } from "zod";

const httpsUrl = z.url({ protocol: /^https$/ });

export const githubReleaseAssetSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  browser_download_url: httpsUrl,
  size: z.number().int().nonnegative(),
  download_count: z.number().int().nonnegative(),
  content_type: z.string().nullable(),
});

export const githubReleaseSchema = z.object({
  tag_name: z.string().refine((value) => value.trim().length > 0, {
    message: "Release tag must not be blank",
  }),
  name: z.string().nullable(),
  body: z.string().nullable(),
  html_url: httpsUrl,
  published_at: z.iso.datetime({ offset: true }),
  assets: z.array(githubReleaseAssetSchema),
});

export type GitHubReleaseResponse = z.infer<typeof githubReleaseSchema>;
