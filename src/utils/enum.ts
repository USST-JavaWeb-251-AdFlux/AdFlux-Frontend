export type EnumItem = {
    value: number;
    label: string;
    type?: 'primary' | 'success' | 'info' | 'warning' | 'danger';
    [key: string]: unknown;
};

export type Enum = Record<string, EnumItem>;

export type ValueOf<T extends Enum> = T[keyof T]['value'];

export const getLabel = <T extends Enum>(enumObj: T, value: ValueOf<T>): T[keyof T]['label'] => {
    return Object.values(enumObj)[value]?.label ?? '';
};

export const getType = <T extends Enum>(enumObj: T, value: ValueOf<T>): T[keyof T]['type'] => {
    return Object.values(enumObj)[value]?.type;
};
