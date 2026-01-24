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
  timeIn?: string;
  isEditing?: boolean;
}

export interface MainViewHeader {
  netControlOp: string;
  type: string;
  netOpened: string;
  reasonForNet: string;
  comments: string;
}
