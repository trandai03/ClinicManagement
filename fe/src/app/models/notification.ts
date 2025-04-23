export interface Notification{
    id: number,
    sender: string,
    receiver:string,
    date: string,
    content:string
}

export const notifications: Notification[] = [
    {
      "id": 1,
      "sender": "John Doe",
      "receiver": "Jane Smith",
      "date": "2024-03-19T09:00:00Z",
      "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    {
      "id": 2,
      "sender": "Alice Johnson",
      "receiver": "Bob Brown",
      "date": "2024-03-19T10:30:00Z",
      "content": "Nulla facilisi. Sed eget metus id nisi sollicitudin tempor."
    },
    {
      "id": 3,
      "sender": "Emma Lee",
      "receiver": "David Wang",
      "date": "2024-03-19T13:15:00Z",
      "content": "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae."
    },
    {
      "id": 4,
      "sender": "Michael Brown",
      "receiver": "Sarah Johnson",
      "date": "2024-03-19T15:45:00Z",
      "content": "Suspendisse potenti. Fusce gravida, lorem non imperdiet eleifend, justo elit facilisis elit."
    },
    {
      "id": 5,
      "sender": "Sophia Clark",
      "receiver": "Daniel Martinez",
      "date": "2024-03-19T18:20:00Z",
      "content": "Donec nec urna a felis dapibus rhoncus vel nec magna."
    }
  ]
  