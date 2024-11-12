export interface ScheduleCreationAttrs {
    userId: number;
    customerId: number;
    date: string;
    timeStart: string;
    timeEnd: string;
}

export enum ScheduleStatus {
    SUCCESS = 'SUCCESS',
    CANCELED = 'CANCELED',
    PROCESS = 'PROCESS'
}