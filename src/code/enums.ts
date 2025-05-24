export const enum gCustomRouteEnum {
  HOME = "/",
  STOCK = "/inventory",
  REPORTS = "/reports",
  SETTINGS = "/settings",
}

export const enum gStatusEnum {
  // NEUTRAL,
  SUCCESS,
  INFO,
  WARNING,
  ERROR,
}

/**
 * Represents the type of a signal, store, etc
 */
export const enum gReactiveMemberEnum {
  /**
   * Represents an accessor (getter) member.
   */
  ACCESSOR = 0,
  /**
   * Represents a setter member.
   */
  SETTER,
}
