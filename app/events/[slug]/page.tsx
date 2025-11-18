import Image from "next/image"
import { notFound } from "next/navigation"
import { FC } from "react"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

type EventDetailItemProps = {
    src: string
    alt: string
    label: string
}

const EventDetailItem: FC<EventDetailItemProps> = ({ alt, src, label }) => {
    return (
        <div className="flex row-gap-2 items-center">
            <Image src={src} alt={alt} width={17} height={17} />
            <p>{label}</p>
        </div>
    )
}

type EventAgendaProps = {
    agendaItems: string[]
}

const EventAgenda: FC<EventAgendaProps> = ({ agendaItems }) => {
    return (
        <div className="agenda">
            <h2>Agenda</h2>
            <ul>
                {agendaItems?.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    )
}

type EventTagsProps = {
    tags: string[]
}

const EventTags: FC<EventTagsProps> = ({ tags }) => {
    return (
        <div className="flex flex-row gap-1.5 flex-wrap">
            {tags?.map((tag) => (
                <div className="pill" key={tag}>
                    {tag}
                </div>
            ))}
        </div>
    )
}

const EventDetailPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params

    let event

    try {
        const request = await fetch(`${BASE_URL}/api/events/${slug}`, {
            next: { revalidate: 60 },
        })

        if (!request.ok) {
            if (request.status === 404) return notFound()

            throw new Error(`Failed to fetch event: ${request.statusText}`)
        }

        const response = await request.json()
        event = response.event

        if (!event) return notFound()
    } catch (error) {
        console.error(`Error fetching event: ${error}`)

        return notFound()
    }

    return (
        <section id="event">
            <div className="header">
                <h1>Event Description</h1>

                <p>{event.description}</p>
            </div>

            <div className="details">
                <div className="content">
                    <Image src={event.image} alt="Event Banner" width={800} height={800} />

                    <section className="flex-col gap-2">
                        <h2>Overview</h2>

                        <p>{event.overview}</p>
                    </section>

                    <section className="flex-col gap-2">
                        <h2>Details</h2>

                        <EventDetailItem
                            src="/icons/calendar.svg"
                            alt="calendar"
                            label={event.date}
                        />
                        <EventDetailItem src="/icons/clock.svg" alt="clock" label={event.time} />
                        <EventDetailItem src="/icons/pin.svg" alt="pin" label={event.location} />
                        <EventDetailItem src="/icons/mode.svg" alt="mode" label={event.mode} />
                        <EventDetailItem
                            src="/icons/audience.svg"
                            alt="audience"
                            label={event.audience}
                        />
                    </section>

                    <EventAgenda agendaItems={JSON.parse(event.agenda)} />

                    <section className="flex-col-gap-2">
                        <h2>About Organizer</h2>
                        <p>{event.organizer}</p>
                    </section>

                    <EventTags tags={JSON.parse(event.tags)} />
                </div>

                <aside className="booking">
                    <p className="text-lg font-semibold">Book Event</p>
                </aside>
            </div>
        </section>
    )
}

export default EventDetailPage
