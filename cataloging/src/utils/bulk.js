export const JOB_TYPE = 'bulk:Job';

export const STATUS_KEY = 'bulk:status';
export const MATCH_FORM_KEY = 'bulk:matchForm';
export const SHOULD_UPDATE_TIMESTAMP_KEY = 'bulk:shouldUpdateModifiedTimestamp';
export const CHANGE_SPEC_KEY = 'bulk:changeSpec';
export const TARGET_FORM_KEY = 'bulk:targetForm';

export class Status {
  static Draft = 'bulk:Draft';
  static Ready = 'bulk:Ready';
  static Running = 'bulk:Running';
  static Failed = 'bulk:Failed';
  static Completed = 'bulk:Completed';
}

export const BNODE_ID_KEY = 'bulk:formBlankNodeId';
export const MATCHING_MODE_KEY = 'bulk:matchingMode';
export const HAS_ID_KEY = 'bulk:hasId';
export const VALUE_FROM_KEY = 'bulk:valueFrom'
export const ANY_TYPE = "bulk:Any"
export const SUBTYPES_TYPE = "bulk:Subtypes"
export const EXACT_TYPE = 'bulk:Exact'
export const ANY_OF_TYPE = 'bulk:AnyOf'

export class Type {
  static Update = 'bulk:Update';
  static Delete = 'bulk:Delete';
  static Create = 'bulk:Create';
  static Merge = 'bulk:Merge';
  static Other = 'bulk:Other';
}
