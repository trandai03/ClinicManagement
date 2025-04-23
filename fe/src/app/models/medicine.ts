export interface Medicine {
  id: number;
  quantity: number;
  name: string;
  money: number;
  unit: string;
  description: string;
}

export const medicines: Medicine[] = [];
