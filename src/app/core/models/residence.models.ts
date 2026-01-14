export type UUID = string;

export interface ManorDto {
    id: UUID;
    name: string;
    address?: string | null;
    city?: string | null;
    capacity: number;
    enforceCapacity: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export type ResidenceStayStatus = 'PLANNED' | 'CANCELED';

export interface ResidenceStayDto {
    id: UUID;
    date: string; // normalize to YYYY-MM-DD in UI
    status: ResidenceStayStatus;
    overCapacity: boolean;
    manor: Pick<ManorDto, 'id' | 'name' | 'capacity' | 'enforceCapacity'>;
}
