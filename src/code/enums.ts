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

export const enum gEnumClothingConflictReason {
  /** Both client and server have the same clothing item albeit, the server has an updated version */
  SERVER_HAS_NEWER = 0,

  /** Both client and server have the same clothing item albeit, the client has an updated version */
  CLIENT_HAS_NEWER,

  /** Only the client has the clothing item */
  MISSING_ON_SERVER,

  /** Only the server has the clothing item */
  MISSING_ON_CLIENT,
}
