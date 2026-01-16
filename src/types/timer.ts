export type TimerType = 'atomic' | 'loop';
export type EventType = 'work' | 'rest';

export interface TimerNode {
  id: string;
  type: 'atomic';
  eventType: EventType;
  duration: number; // in seconds
  label: string;
}

export interface LoopNode {
  id: string;
  type: 'loop';
  iterations: number;
  children: (TimerNode | LoopNode)[];
}

export interface PlayableEvent {
  duration: number;
  label: string;
  type: 'work' | 'rest'; // For now simplifying to just these, though usage implies generic type
}
