/**
 * Represents a ham radio operator's information from the callsign database
 */
export interface CallsignEntry {
  callSign: string;
  firstName: string;
  lastName: string;
}

/**
 * Result of a callsign lookup - includes the full name formatted
 */
export interface CallsignLookupResult {
  callSign: string;
  firstName: string;
  lastName: string;
  fullName: string; // "lastName, firstName" format
}
