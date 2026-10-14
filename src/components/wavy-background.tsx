import Image from "next/image"
import background from "@/pjeg/background.jpeg"

// full-screen background for the login and signup pages.
// the SVG filter bends the image with slowly changing noise, which reads as a gentle wave;
// it only runs when the visitor hasn't asked for reduced motion (motion-safe)
export function WavyBackground() {
    return (
        <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden">
            <svg className="absolute size-0">
                <filter id="wavy-background">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.003 0.012"
                        numOctaves="2"
                        seed="4"
                        result="noise"
                    >
                        <animate
                            attributeName="baseFrequency"
                            dur="16s"
                            values="0.003 0.012; 0.005 0.016; 0.003 0.012"
                            repeatCount="indefinite"
                        />
                    </feTurbulence>
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="22"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>
            </svg>

            {/* scaled up a little so the wave never pulls the edges into view */}
            <Image
                src={background}
                alt=""
                fill
                sizes="100vw"
                placeholder="blur"
                loading="eager"
                fetchPriority="high"
                className="scale-110 object-cover motion-safe:[filter:url(#wavy-background)]"
            />
        </div>
    )
}
