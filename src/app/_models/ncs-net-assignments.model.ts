export interface NetAssignment {
  id: string;
  callsign: string;
  timeIn: string;
  name: string;
  duty: string;
  milageStart: number;
  classification: string;
  timeOut: string;
  milageEnd: number;
  isEditing?: boolean;
}
