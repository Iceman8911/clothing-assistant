export const enum gEnumCustomRoute {
  HOME = "/",
  STOCK = "/inventory",
  REPORTS = "/reports",
  SETTINGS = "/settings",
}

export const enum gEnumStatus {
  // NEUTRAL,
  SUCCESS,
  INFO,
  WARNING,
  ERROR,
}

/**
 * Represents the type of a signal, store, etc
 */
export const enum gEnumReactiveMember {
  /**
   * Represents an accessor (getter) member.
   */
  ACCESSOR = 0,
  /**
   * Represents a setter member.
   */
  SETTER,
}
