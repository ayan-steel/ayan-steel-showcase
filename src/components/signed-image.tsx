import { useEffect, useState } from "react";
import { getSignedUrl } from "@/lib/storage";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & { path?: string | null };

export function SignedImage({ path, alt = "", ...rest }: Props) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let alive = true;
    if (!path) { setUrl(""); return; }
    getSignedUrl(path).then((u) => { if (alive) setUrl(u); });
    return () => { alive = false; };
  }, [path]);
  if (!url) return <div {...(rest as any)} aria-label={alt} />;
  return <img src={url} alt={alt} {...rest} />;
}
