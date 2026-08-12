/** Standard success envelope used by most TAC endpoints. */
export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}
