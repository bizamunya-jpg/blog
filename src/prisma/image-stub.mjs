// Lets the seed script import data.ts, which imports .jpg pictures.
// Outside Next.js, Node can't load images, so each one becomes { src: "<file path>" }.
import { registerHooks } from "node:module";

registerHooks({
    load(url, context, nextLoad) {
        if (/\.(jpe?g|png|webp|gif|svg)$/i.test(url)) {
            return {
                format: "module",
                shortCircuit: true,
                source: `export default { src: ${JSON.stringify(url)} };`,
            };
        }
        return nextLoad(url, context);
    },
});
