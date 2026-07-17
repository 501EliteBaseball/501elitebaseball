export type ScheduleEvent={id:string;title:string;event_type:string;starts_at:string;ends_at:string|null;arrival_at:string|null;location_name:string;location_address:string;notes:string;audience:string;status:string;recurrence_group_id:string|null};
export const EVENT_TYPES=["practice","game","tournament","meeting","deadline","other"] as const;
