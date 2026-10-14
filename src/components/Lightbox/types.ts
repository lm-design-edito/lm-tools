/** What a member hands the store so the group can find and place it. */
export type LightboxMember = {
  id: string
  groups: string[]
  /** The member's anchor in the page, for ordering. `null` before it mounts. */
  getElement: () => HTMLElement | null
}

/** What the store holds: at most one open group, and the member it shows. */
export type LightboxState = {
  /** The group currently open, `null` when nothing is. */
  openGroup: string | null
  /** The member currently shown. */
  openMemberId: string | null
}
