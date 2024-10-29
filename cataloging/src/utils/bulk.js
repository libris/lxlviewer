export const STATUS_KEY = 'bulk:status';
export const MATCH_FORM_KEY = 'bulk:matchForm';
export const SHOULD_UPDATE_TIMESTAMP_KEY = 'bulk:shouldUpdateModifiedTimestamp';
export const CHANGE_SPEC_KEY = 'bulk:changeSpec';
export const TARGET_FORM_KEY = 'bulk:targetForm';
export const JOB_TYPE = 'bulk:Job';

export class Status {
  static Draft = 'bulk:Draft';
  static Ready = 'bulk:Ready';
  static Running = 'bulk:Running';
  static Failed = 'bulk:Failed';
  static Completed = 'bulk:Completed';
}
