export interface ProductCreationAttrs {
    name: string;
    price: number;
    userId: number;
}

export enum ProductStatus {
    DELETED = 'DELETED',
    ACTIVE = 'ACTIVE'
}