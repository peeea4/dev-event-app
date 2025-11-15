import { Event } from "@/database"
import connectDB from "@/lib/mongodb"
import { NextRequest, NextResponse } from "next/server"

import { v2 as cloudinary } from "cloudinary"

export async function POST(req: NextRequest) {
    try {
        await connectDB()
        const formdata = await req.formData()

        let event

        try {
            event = Object.fromEntries(formdata.entries())
        } catch (e) {
            return NextResponse.json({ message: "Invalid JSON" }, { status: 400 })
        }

        const file = formdata.get("image") as File

        if (!file) {
            return NextResponse.json({ message: "Image is required" }, { status: 400 })
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const uploadedResult = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream({ resource_type: "image", folder: "DevEvent" }, (error, results) => {
                    if (error) return reject(error)

                    resolve(results)
                })
                .end(buffer)
        })

        event.image = (uploadedResult as { secure_url: string }).secure_url

        const createdEvent = await Event.create(event)

        return NextResponse.json(
            { message: "Event created successfully", event: createdEvent },
            { status: 201 }
        )
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            {
                message: "Event creating failed",
                error: error instanceof Error ? error.message : "Unknown",
            },
            { status: 400 }
        )
    }
}

export async function GET() {
    try {
        await connectDB()

        const events = await Event.find().sort({ createdAt: -1 })

        return NextResponse.json(
            { message: "Successfully fetched events", events },
            { status: 200 }
        )
    } catch (error) {
        return NextResponse.json({ message: "Failed to get events", error }, { status: 500 })
    }
}
