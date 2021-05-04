import { State } from './state.class';

type Index = string | number | symbol | any;

export class Where {
  key: number | string;
  value: any;
  constructor(key, value) {
    this.key = key;
    this.value = value;
  }
}

export type Model = {
  id: number;
};

export class Store<T extends { [key: string]: any }> extends State<T> {
  protected constructor(public init: T) {
    super(init);
  }

  /*
   ** Adds an item to a stored array with the specified key or a stored array with the specified key
   ** and a set index. For example a stored list that has an index of an id of its related parent model
   */
  add(value: any, ...path: Index[]) {
    if (path.length < 1) {
      return;
    }
    this.setState(this.addToState(value, this.state, path));
  }

  remove(...path: Index[]) {
    if (path.length < 1) {
      return;
    }
    this.setState(this.updateState(null, this.state, path));
  }

  update(value: any, ...path: Index[]) {
    if (path.length < 1) {
      return;
    }
    this.setState(this.updateState(value, this.state, path));
  }

  private addToState(value: any, stateSubtree: any, path: Index[]): any {
    const key = path[0];
    // If current path is an instanceof Where, and is the last path item,
    // the state subtree must be an array check if the item already exist based on the proveide
    // key valu pair.
    // If it's not the last item of the given path and the item exists in the stateSubtree, selfinvoke and return new
    // statesubtree to traverse.
    // If index exist and the path is the last item, throw error.
    if (key instanceof Where && stateSubtree instanceof Array){
      const index = stateSubtree.findIndex(
        (i) => i[key.key] === key.value
      );
      // value doesn't exist and is last subtree, add value to array
      if (index < 0  && path.length === 1){
        return [
          ...stateSubtree,
          value
        ];
      }
      // Item found and not last subtree, continue traversing down the path
      if (index >= 0  && path.length > 1){
        return {
          ...stateSubtree,
          [index]:  this.addToState(value, stateSubtree[index], path.slice(1)),
        };
      }
      // TODO item already exists throw error
      if (index >= 0  && path.length === 1){
        throw new Error('Value already exists!');
      }
    }
    // If current path is an array, and is the last path item, push new item.
    // If it's not the last item of the given path selfinvoke and return new
    // statesubtree to traverse.
    if (stateSubtree[key] instanceof Array){
      if (path.length > 1){
        return {
          ...stateSubtree,
          [key]:  Object.assign([], stateSubtree[key], this.addToState(value, stateSubtree[key], path.slice(1))),
        };
      }
      // If last value, set new value
      if (path.length === 1) {
        // push new value at index
        return {
          ...stateSubtree,
          ...stateSubtree[key].push(value),
        };
      }
    }

    // If current stateSubtree is not an array, return new stateSubtree
    // else set new key/value pair
    if(path.length > 1){
      return {
        ...stateSubtree,
        [key]: this.addToState(value, stateSubtree[key], path.slice(1)),
      };
    } else {
      return {
        ...stateSubtree,
        [key]: value,
      };
    }
  }

  private updateState(value: any, stateSubtree: any, path: Index[]): any {
    const key = path[0];

    // If current stateSubtree is an array and is a key value pair,
    // find the index of the object with the key,value comparison.
    // If it's not the last value of the given path selfinvoke and return new
    // statesubtree to traverse.
    // If it's the last value, replace old item with new item.
    if (key instanceof Where && stateSubtree instanceof Array){

      const index = stateSubtree.findIndex(
        (i) => i[key.key] === key.value
      );

      if (path.length > 1){
        return {
          ...stateSubtree,
          [index]:  this.updateState(value, stateSubtree[index], path.slice(1)),
        };
      }
      // If last value, set new value
      if (path.length === 1) {
        // remove from array
        if(value === null){
          return  delete stateSubtree[index];
        }
        // set new value at index
        return {
          ...stateSubtree,
          [index]: value,
        };
      }
    }
    // If the last stateSubtree is an array, return new stateSubtree and reassing array
    // When not doing this the existing array is turned into an object.
    // If it's an other value, replace the current value with the new value

    if (stateSubtree[key] instanceof Array){
      // If current stateSubtree is an array, return new stateSubtree and reassing array
      // When not doing this the existing array is turned into an object.
      if(path.length > 1){
        return {
          ...stateSubtree,
          [key]:  Object.assign([], stateSubtree[key], this.updateState(value, stateSubtree[key], path.slice(1))),
        };
      } else {
        return {
          ...stateSubtree,
          [key]:  Object.assign([], stateSubtree[key], value),
        };
      }
    } else {
      if (path.length > 1){
        return {
          ...stateSubtree,
          [key]: this.updateState(value, stateSubtree[key], path.slice(1)),
        };
      } else {
        return {
          ...stateSubtree,
          [key]: value,
        };
      }
    }
  }
}
