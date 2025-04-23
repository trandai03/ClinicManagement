export interface Schedule {
  id: number;
  idDoctor: number;
  weekday: string;
  session: string;
  date: string;
  note: string;
  patient: {
    id: number;
    gender: string;
    dob: string;
  };
}

export type Schedules =  {
  id: number,
  date: string,
  session:string;
}

export const schedules: Schedule[] = [
  {
    id: 1,
    idDoctor: 101,
    weekday: 'Monday',
    session: 'Morning',
    date: '12/03/2024',
    note: 'Regular check-up',
    patient: {
      id: 201,
      gender: 'Male',
      dob: '1990-05-15',
    },
  },
  {
    id: 2,
    idDoctor: 102,
    weekday: 'Wednesday',
    session: 'Afternoon',
    date: '13/03/2024',
    note: 'Dental cleaning',
    patient: {
      id: 202,
      gender: 'Female',
      dob: '1985-10-20',
    },
  },
  {
    id: 3,
    idDoctor: 103,
    weekday: 'Friday',
    session: 'Morning',
    date: '14/03/2024',
    note: 'Flu vaccination',
    patient: {
      id: 203,
      gender: 'Male',
      dob: '1978-03-12',
    },
  },
  {
    id: 4,
    idDoctor: 104,
    weekday: 'Tuesday',
    session: 'Morning',
    date: '21/03/2024',
    note: 'Blood pressure check',
    patient: {
      id: 204,
      gender: 'Female',
      dob: '1967-08-25',
    },
  },
  {
    id: 5,
    idDoctor: 105,
    weekday: 'Thursday',
    session: 'Afternoon',
    date: '25/03/2024',
    note: 'Follow-up consultation',
    patient: {
      id: 205,
      gender: 'Male',
      dob: '1982-12-03',
    },
  },
];
