import type { StaticImageData } from "next/image";
import { localPictures } from "@/app/data/data";

// A post's saved image name like "pictures/post-slide-1.jpg" becomes the imported
// picture from src/pictures; anything else (a /path on this site or a full web
// address) is used as it is.
export function resolvePicture(url: string): StaticImageData | string {
    return localPictures[url as keyof typeof localPictures] ?? url;
}
