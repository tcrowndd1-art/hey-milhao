import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import { AdSlot } from "./AdSlot";

const components: MDXRemoteProps["components"] = {
  AdSlot,
};

const mdxOptions = {
  mdxOptions: {
    rehypePlugins: [rehypeSlug],
  },
};

export function MDXContent({ source }: { source: string }) {
  return (
    <div className="prose-hey">
      <MDXRemote source={source} components={components} options={mdxOptions} />
    </div>
  );
}
