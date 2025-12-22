export type EnumItem = {
    value: number;
    label: string;
};

export type Enum = Record<string, EnumItem>;

export type ValueOf<T extends Enum> = T[keyof T]['value'];

export const getLabel = <T extends Enum>(enumObj: T, value: ValueOf<T>): string => {
    return Object.values(enumObj)[value]?.label ?? '';
};
