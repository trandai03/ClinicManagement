export interface Booking {
    id: number,
    name: string,
    gender: string,
    dob:string,
    email:string,
    phone:string,
    address?: string,
    date: string,
    idHour: number,
    hourName?: string,
    status: string,
    note: string,
    nameDoctor: string,
    major: string,
    totalMoney: number
}

export type BookingDTO = {
    name:string,
    dob:string,
    phone:string,
    email:string,
    gender:string,
    address:string,
    idMojor:number,
    idUser:number,
    date:string,
    idHour:number,
    note:string,
    status:string
}

