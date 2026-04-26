import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import { AdSlot } from "./AdSlot";

const components: MDXRemoteProps["components"] = {
  AdSlot,
};

export function MDXContent({ source }: { source: string }) {
  return (
    <div className="prose-hey mx-auto max-w-prose px-4 py-10">
      <MDXRemote source={source} components={components} />
    </div>
  );
}
