export class MinHeap<T> {
  private data: { value: T, key: number }[] = [];

  constructor() {}

  /** Insert a value with priority (key) */
  push(value: T, key: number): void {
    this.data.push({ value, key });
    this.bubbleUp(this.data.length - 1);
  }

  /** Returns minimum key without removing */
  peek(): T | null {
    return this.data.length > 0 ? this.data[0].value : null;
  }

  /** Removes and returns minimum value */
  pop(): T | null {
    if (this.data.length === 0) return null;
    if (this.data.length === 1) return this.data.pop()!.value;

    const min = this.data[0].value;
    this.data[0] = this.data.pop()!;
    this.bubbleDown(0);
    return min;
  }

  size(): number {
    return this.data.length;
  }

  isEmpty(): boolean {
    return this.data.length === 0;
  }

  /** --- Internal Helpers --- */

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);

      if (this.data[index].key >= this.data[parent].key) break;

      this.swap(index, parent);
      index = parent;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.data.length;

    while (true) {
      const left = index * 2 + 1;
      const right = index * 2 + 2;
      let smallest = index;

      if (left < length && this.data[left].key < this.data[smallest].key) {
        smallest = left;
      }

      if (right < length && this.data[right].key < this.data[smallest].key) {
        smallest = right;
      }

      if (smallest === index) break;

      this.swap(index, smallest);
      index = smallest;
    }
  }

  private swap(i: number, j: number): void {
    [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
  }
}
