export interface SlackParams {
    id: string
    source: string
    device: string
    deviceStatus: string
    eventType: string
    eventTime: string

}
function sendToSlack(data: SlackParams) {
    const attachments = [
        {
            fallback: "This is a message with JSON data",
            color: "#36a64f",
            pretext: "NaC Notifications",
            author_name: "NaC",
            author_link: "https://networkascode.nokia.io/",
            author_icon: "https://networkascode.nokia.io/static-assets/default/dark-logo-1abf47ae-2af8-497d-9a8c-98a363044d5f-83c1f9f5-e37d-4802-9961-e7462ecc5e88.png",
            title: "NaC API Documentation",
            title_link: "https://developer.networkascode.nokia.io/",
            text: "This is the main text of the attachment.",
            fields: [
                {
                    title: "ID",
                    value: data.id,
                    short: false
                },
                {
                    title: "Source",
                    value: data.source,
                    short: false
                },
                {
                    title: "Device",
                    value: data.device,
                    short: false
                },
                {
                    title: "Device Status",
                    value: data.deviceStatus,
                    short: false
                },
                {
                    title: "Event type",
                    value: data.eventType,
                    short: false
                },
                {
                    title: "Event time",
                    value: data.eventTime,
                    short: false
                }
            ],
            image_url: "hhttps://networkascode.nokia.io/static-assets/default/dark-logo-1abf47ae-2af8-497d-9a8c-98a363044d5f-83c1f9f5-e37d-4802-9961-e7462ecc5e88.png",
            thumb_url: "https://networkascode.nokia.io/static-assets/default/dark-logo-1abf47ae-2af8-497d-9a8c-98a363044d5f-83c1f9f5-e37d-4802-9961-e7462ecc5e88.png"
        }
    ];


    return attachments
}

export { sendToSlack }