export interface BidirectionalMapper<L, R> {
  toRight(left: L): R;
  toLeft(right: R): L;
}
