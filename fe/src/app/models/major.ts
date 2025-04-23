export interface Major {
  id: number;
  name: string;
  description: string;
  image: string;
}

export type MajorDTO = {
  name: string,
  description:string,
}

export const majors: Major[] = [
  {
    id: 1,
    name: 'Khoa mắt',
    description: 'Kham cho vui nao cha mu',
    image:
      'https://tamanhhospital.vn/wp-content/uploads/2024/02/trung-tam-mat-cong-nghe-cao.png',
  },
  {
    id: 2,
    name: 'Khoa răng',
    description: 'Kham nhai đá nào',
    image:
      'https://tamanhhospital.vn/wp-content/uploads/2023/12/khoa-rang-ham-mat.png',
  },
  {
    id: 3,
    name: 'Khoa tim',
    description: 'Kham xong xào xả ớt',
    image:
      'https://tamanhhospital.vn/wp-content/uploads/2020/12/khoa_noitimmach.png',
  },
  {
    id: 4,
    name: 'Khoa xương khớp',
    description: 'Kham đem nấu cháo',
    image:
      'https://tamanhhospital.vn/wp-content/uploads/2021/03/khoa-noi-co-xuong-khop.png',
  },
  {
    id: 5,
    name: 'Khoa thần kinh',
    description: 'Kham xong điên',
    image:
      'https://tamanhhospital.vn/wp-content/uploads/2020/12/khoa_noithankinh.png',
  },
];
