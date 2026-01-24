export interface MainViewEntry {
  id?: string;
  call: string;
  first: string;
  lastInitial: string;
  assignment1: string;
  status1: string;
  status2: string;
  status3: string;
  status4: string;
  assignment2: string;
  status5: string;
  status6: string;
  status7: string;
  status8: string;
  notes: string;
  timeIn?: string;
  isEditing?: boolean;
}

export interface MainViewHeader {
  netControlOp: string;
  type: string;
  netOpened: string;
  netStopped: string;
  reasonForNet: string;
  comments: string;
}
