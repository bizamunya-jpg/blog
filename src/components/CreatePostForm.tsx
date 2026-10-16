"use client"

import { FormEvent, useActionState, useEffect, useRef, useState, useTransition } from "react"
import { ImagePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createPostAction, type CreatePostState } from "@/app/actions/posts"
import { IMAGE_TYPES, MAX_IMAGES, MAX_IMAGE_MB } from "@/lib/schemas"

type Picked = { file: File; preview: string }

const initialState: CreatePostState = { error: "", fields: { title: "", content: "" } }

export default function CreatePostForm() {
    const [state, formAction, pending] = useActionState(createPostAction, initialState)
    const [, startTransition] = useTransition()

    const [pictures, setPictures] = useState<Picked[]>([])
    const [pictureError, setPictureError] = useState("")
    const [dragging, setDragging] = useState(false)

    // previews are temporary browser addresses; free them when the page closes
    const picturesRef = useRef(pictures)
    useEffect(() => {
        picturesRef.current = pictures
    }, [pictures])
    useEffect(() => () => picturesRef.current.forEach((p) => URL.revokeObjectURL(p.preview)), [])

    // same checks as the server (lib/schemas.ts), so people find out straight away
    function addPictures(list: File[]) {
        const problems: string[] = []
        const accepted: File[] = []

        for (const file of list) {
            if (!(IMAGE_TYPES as readonly string[]).includes(file.type)) {
                problems.push(`${file.name} isn't a JPG, PNG, WebP or GIF`)
            } else if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
                problems.push(`${file.name} is bigger than ${MAX_IMAGE_MB} MB`)
            } else {
                accepted.push(file)
            }
        }

        const room = MAX_IMAGES - pictures.length
        if (accepted.length > room) problems.push(`You can add up to ${MAX_IMAGES} images`)

        setPictureError(problems.join(". "))
        setPictures([
            ...pictures,
            ...accepted.slice(0, room).map((file) => ({ file, preview: URL.createObjectURL(file) })),
        ])
    }

    function removePicture(index: number) {
        URL.revokeObjectURL(pictures[index].preview)
        setPictures(pictures.filter((_, i) => i !== index))
        setPictureError("")
    }

    // sent by hand rather than with a plain form action, so the form isn't
    // cleared when something is wrong and people keep their text and pictures
    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        pictures.forEach((p) => formData.append("images", p.file))
        startTransition(() => formAction(formData))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* drop area: clicking it (or pressing Space on it) opens the file picker */}
            <div className="space-y-2">
                <Label htmlFor="images">Images</Label>
                <label
                    onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setDragging(false); addPictures(Array.from(e.dataTransfer.files)) }}
                    className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50 ${
                        dragging ? "border-primary bg-primary/5" : "border-input hover:bg-muted/50"
                    } ${pictures.length >= MAX_IMAGES ? "pointer-events-none opacity-50" : ""}`}
                >
                    <ImagePlus className="size-8 text-muted-foreground" aria-hidden="true" />
                    <span className="text-sm font-medium">Drag and drop images here, or click to choose</span>
                    <span className="text-xs text-muted-foreground">
                        JPG, PNG, WebP or GIF · up to {MAX_IMAGES} images · {MAX_IMAGE_MB} MB each
                    </span>
                    <input
                        id="images"
                        type="file"
                        accept={IMAGE_TYPES.join(",")}
                        multiple
                        disabled={pictures.length >= MAX_IMAGES}
                        className="sr-only"
                        onChange={(e) => {
                            addPictures(Array.from(e.target.files ?? []))
                            // reset so the same file can be picked again
                            e.target.value = ""
                        }}
                    />
                </label>
                {pictureError && <p className="text-sm text-destructive">{pictureError}</p>}

                {pictures.length > 0 && (
                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {pictures.map((picture, index) => (
                            <li key={picture.preview} className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                                {/* a temporary browser preview, which next/image can't load */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={picture.preview} alt={picture.file.name} className="size-full object-cover" />
                                {index === 0 && (
                                    <span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">Cover</span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => removePicture(index)}
                                    aria-label={`Remove ${picture.file.name}`}
                                    className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                                >
                                    <X className="size-3.5" aria-hidden="true" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required maxLength={200} defaultValue={state.fields.title} placeholder="Give your post a title" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="content">Description</Label>
                <textarea
                    id="content"
                    name="content"
                    required
                    rows={10}
                    defaultValue={state.fields.content}
                    placeholder="Write your post. Leave an empty line between paragraphs."
                    className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
            </div>

            {state.error && (
                <p role="alert" className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    {state.error}
                </p>
            )}

            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
                {pending ? "Publishing..." : "Publish post"}
            </Button>
        </form>
    )
}
