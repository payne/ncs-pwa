export interface NetEntry {
  id: string;
  // Common field
  callsign: string;
  // NET Assignments fields
  timeIn: string;
  name: string;
  duty: string;
  milageStart: number;
  classification: string;
  timeOut: string;
  milageEnd: number;
  // View 2 fields
  firstName: string;
  lastName: string;
  classBoxA: string;
  classBoxB: string;
  wtr: string;
  classBoxD: string;
  classBoxE: string;
  classBoxF: string;
  classBoxG: string;
  classBoxH: string;
  headerName: string;
  footerInfo: string;
  // UI state
  isEditing?: boolean;
}
