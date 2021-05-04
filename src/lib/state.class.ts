import { Observable, BehaviorSubject } from "rxjs";

export class State<T> {
  state$: Observable<T>;
  private readonly _state$: BehaviorSubject<T>;

  protected constructor(public init: T) {
    this._state$ = new BehaviorSubject(init);
    this.state$ = this._state$.asObservable();
  }

  get state(): T {
    return this._state$.getValue();
  }

  setState(val: T) {
    this._state$.next(val);
  }
}
