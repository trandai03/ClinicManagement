export interface Contact {
    id: number,
    dob: string,
    name: string,
    note: string,
    gmail:string,
    phone:string
}

export const contacts:Contact[] = [
    {
        "id": 1,
        "dob": "2024-03-18",
        "name": "Alice Johnson",
        "note": "Interested in our services, requested a callback.",
        "gmail": "alice.johnson@gmail.com",
        "phone": "+1 (123) 456-7890"
    },
    {
        "id": 2,
        "dob": "2024-03-18",
        "name": "Bob Smith",
        "note": "Inquired about pricing for our products.",
        "gmail": "bob.smith@example.com",
        "phone": "+1 (234) 567-8901"
    },
    {
        "id": 3,
        "dob": "2024-03-19",
        "name": "Charlie Brown",
        "note": "Had a general question about our services.",
        "gmail": "charlie.brown@gmail.com",
        "phone": "+1 (345) 678-9012"
    },
    {
        "id": 4,
        "dob": "2024-03-20",
        "name": "David Lee",
        "note": "Left a message regarding technical support.",
        "gmail": "david.lee@example.com",
        "phone": "+1 (456) 789-0123"
    },
    {
        "id": 5,
        "dob": "2024-03-20",
        "name": "Emma Garcia",
        "note": "Sent an email requesting more information.",
        "gmail": "emma.garcia@gmail.com",
        "phone": "+1 (567) 890-1234"
    }
]
