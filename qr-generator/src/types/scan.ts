// src/types/scan.ts

/**
 * Payload sent when submitting a scan from the frontend.
 */
export interface ScanPayload {
    tracking_id: string;
    scanned_quantity: number;
    scanned_weight_kg: number;
    scanned_dimensions_cm: [number, number, number]; // width, height, depth
    location: string;
  }
  
  /**
   * Response from scan submission, indicating match or mismatch.
   */
  export interface ScanResponse {
    tracking_id: string;
    result: 'match' | 'mismatch';
    reasons: string[];
  }
  
  /**
   * One scan entry in the full scan history log.
   */
  export interface ScanLogEntry {
    id: string;
    tracking_id: string;
    scan_time: string;
    scanned_quantity: number;
    scanned_weight_kg: number;
    scanned_dimensions: [number, number, number];
    result: 'match' | 'mismatch';
    notes: string;
    location: string;
    scan_hash: string | null;
  }
  
  /**
   * Response when requesting the full scan history for a given tracking ID.
   */
  export interface ScanHistoryResponse {
    tracking_id: string;
    history: ScanLogEntry[];
  }
  
  /**
   * Used when requesting a Merkle proof for a scan.
   */
  export interface ProofRequest {
    scan_hash: string;
  }
  
  /**
   * Response containing the Merkle proof for a scan hash.
   */
  export interface ProofResponse {
    scan_hash: string;
    root_hash: string;
    proof: string[];
    tracking_id: string;
  }
  
  /**
   * Payload to verify a Merkle proof.
   */
  export interface VerifyProofPayload {
    scan_hash: string;
    root_hash: string;
    proof: string[];
  }
  
  /**
   * Response from verifying a Merkle proof.
   */
  export interface VerifyProofResponse {
    valid: boolean;
  }
  
  /**
   * ✅ Optional: Unified data structure used in dashboards or tables.
   * Feel free to rename or use directly.
   */
  export type ScanData = ScanLogEntry;

