export interface Doctor {
    id: number,
    avatar:string,
    fullName:string,
    userName:string,
    phone:string,
    email:string,
    trangthai:string,
    description:string,
    roleId:number,
    enabled:boolean,
    major: {
        id: number,
        name:string,
        description: string,
        image:string
    }
}





// export const doctors:Doctor[] = [
//     {
//         "id": "doc001",
//         "avatar": "https://tse3.mm.bing.net/th?id=OIP.qIu2wcvur-VB04HW0V0j0QHaFj&pid=Api&P=0&h=180",
//         "name": "Dr. John Smith",
//         "khoa": {
//             "id": 101,
//             "name": "Cardiology"
//         },
//         "age": 45,
//         "phone": "+1 (123) 456-7890",
//         "active": true
//     },
//     {
//         "id": "doc002",
//         "avatar": "https://tse3.mm.bing.net/th?id=OIP.qIu2wcvur-VB04HW0V0j0QHaFj&pid=Api&P=0&h=180",
//         "name": "Dr. Sarah Johnson",
//         "khoa": {
//             "id": 102,
//             "name": "Dermatology"
//         },
//         "age": 38,
//         "phone": "+1 (234) 567-8901",
//         "active": false
//     },
//     {
//         "id": "doc003",
//         "avatar": "https://tse3.mm.bing.net/th?id=OIP.qIu2wcvur-VB04HW0V0j0QHaFj&pid=Api&P=0&h=180",
//         "name": "Dr. Michael Brown",
//         "khoa": {
//             "id": 103,
//             "name": "Oncology"
//         },
//         "age": 50,
//         "phone": "+1 (345) 678-9012",
//         "active": true
//     },
//     {
//         "id": "doc004",
//         "avatar": "https://tse3.mm.bing.net/th?id=OIP.qIu2wcvur-VB04HW0V0j0QHaFj&pid=Api&P=0&h=180",
//         "name": "Dr. Emily Lee",
//         "khoa": {
//             "id": 104,
//             "name": "Pediatrics"
//         },
//         "age": 42,
//         "phone": "+1 (456) 789-0123",
//         "active": false
//     },
//     {
//         "id": "doc005",
//         "avatar": "https://tse3.mm.bing.net/th?id=OIP.qIu2wcvur-VB04HW0V0j0QHaFj&pid=Api&P=0&h=180",
//         "name": "Dr. David Patel",
//         "khoa": {
//             "id": 105,
//             "name": "Neurology"
//         },
//         "age": 55,
//         "phone": "+1 (567) 890-1234",
//         "active": true
//     }
// ]
