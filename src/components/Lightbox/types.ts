/** What a lightbox hands the store so its group can find and place it. */
export type RegisteredLightbox = {
  id: string
  groups: string[]
  /** The lightbox's anchor in the page, for ordering. `null` before it mounts. */
  getElement: () => HTMLElement | null
}

/** Everything the store holds, and everything a lightbox watches. */
export type LightboxesStoreState = {
  /** The group currently open, `null` when nothing is. */
  openGroup: string | null
  /** The lightbox currently shown. */
  openLightboxId: string | null
  /** Every mounted lightbox of the page, unordered. */
  lightboxesById: ReadonlyMap<string, RegisteredLightbox>
}
