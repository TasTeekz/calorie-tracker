export interface ProductBase {
  name: string;
  calPer100g: number;
  protPer100g: number;
  fatPer100g: number;
  carbPer100g: number;
}

export const PRODUCT_DATABASE: ProductBase[] = [
  { name: 'Куриное филе', calPer100g: 153, protPer100g: 30, fatPer100g: 3, carbPer100g: 0 },
  { name: 'Гречка вареная', calPer100g: 110, protPer100g: 4, fatPer100g: 1, carbPer100g: 21 },
  { name: 'Яблоко', calPer100g: 52, protPer100g: 0.3, fatPer100g: 0.2, carbPer100g: 14 },
  { name: 'Творог 5%', calPer100g: 121, protPer100g: 17, fatPer100g: 5, carbPer100g: 2 }
];