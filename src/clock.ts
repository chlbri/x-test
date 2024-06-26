export interface Clock {
  setTimeout(fn: (...args: any[]) => void, timeout: number): any;
  clearTimeout(id: any): void;
}

interface SimulatedTimeout {
  start: number;
  timeout: number;
  fn: (...args: any[]) => void;
}

export class SimulatedClock {
  private timeouts: Map<number, SimulatedTimeout> = new Map();
  private _now: number = 0;
  private _id: number = 0;
  private _flushing = false;
  private _flushingInvalidated = false;

  public now() {
    return this._now;
  }
  private getId() {
    return this._id++;
  }
  public setTimeout(fn: (...args: any[]) => void, timeout: number) {
    this._flushingInvalidated = this._flushing;
    const id = this.getId();
    this.timeouts.set(id, {
      start: this.now(),
      timeout,
      fn,
    });
    return id;
  }
  public clearTimeout(id: number) {
    this._flushingInvalidated = this._flushing;
    this.timeouts.delete(id);
  }
  public set(time: number) {
    if (this._now > time) {
      throw new Error('Unable to travel back in time');
    }

    this._now = time;
    this.flushTimeouts();
  }
  private flushTimeouts() {
    if (this._flushing) {
      this._flushingInvalidated = true;
      return;
    }
    this._flushing = true;

    const sorted = [...this.timeouts].sort(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_idA, timeoutA], [_idB, timeoutB]) => {
        const endA = timeoutA.start + timeoutA.timeout;
        const endB = timeoutB.start + timeoutB.timeout;
        return endB > endA ? -1 : 1;
      },
    );

    for (const [id, timeout] of sorted) {
      if (this._flushingInvalidated) {
        this._flushingInvalidated = false;
        this._flushing = false;
        this.flushTimeouts();
        return;
      }
      if (this.now() - timeout.start >= timeout.timeout) {
        this.timeouts.delete(id);
        timeout.fn.call(null);
      }
    }

    this._flushing = false;
  }
  public increment(ms: number): void {
    this._now += ms;
    this.flushTimeouts();
  }
}
