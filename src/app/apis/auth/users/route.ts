import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/users";


export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const result = await createUser(body);
    if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ id: result.id }, { status: 201 });
}
