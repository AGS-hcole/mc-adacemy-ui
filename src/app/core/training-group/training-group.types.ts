import { Site, UUID } from '../session/session.types';
import { FormulaType } from '../user/user.types';

export interface TrainingGroupMemberUser {
    id: UUID;
    firstname: string;
    lastname: string;
    email: string;
    role?: string;
    formula?: FormulaType | null;
    currentRanking?: number | null;
}

export interface TrainingGroupMember {
    id: UUID;
    trainingGroupId?: UUID;
    userId: UUID;
    user?: TrainingGroupMemberUser | null;
    createdAt?: Date | string;
    updatedAt?: Date | string | null;
}

export interface TrainingGroupSchedule {
    id: UUID;
    trainingGroupId?: UUID;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    createdAt?: Date | string;
    updatedAt?: Date | string | null;
}

export interface TrainingGroup {
    id: UUID;
    name: string;
    siteId: UUID;
    site?: Site | null;
    isActive: boolean;
    members: TrainingGroupMember[];
    schedules: TrainingGroupSchedule[];
    createdAt: Date | string;
    updatedAt?: Date | string | null;
}

export interface CreateTrainingGroupRequest {
    name: string;
    siteId: UUID;
    isActive?: boolean;
    memberUserIds?: UUID[];
    schedules?: CreateTrainingGroupScheduleRequest[];
}

export interface UpdateTrainingGroupRequest {
    name?: string;
    siteId?: UUID;
    isActive?: boolean;
}

export interface TrainingGroupMemberBulkRequest {
    userIds: UUID[];
}

export interface CreateTrainingGroupScheduleRequest {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

export interface UpdateTrainingGroupScheduleRequest {
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
}
