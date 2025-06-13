export interface DoctorRank {
    id: number;
    name: string;
    description: string;
    code: string;
    basePrice: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export type DoctorRankDTO = {
    name: string,
    description:string,
    code: string,
    basePrice: number,
    createdAt: Date,
    updatedAt: Date,
  }
