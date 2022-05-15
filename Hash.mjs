'use strict';

export default class {
   constructor(size, ...args) {
      this.size = size;
      this.harrs = Array(size);
      for (let i = 0; i < args.length;) {
         this.Add(args[i++], args[i++]);
      }
   };
   Clear(size) {
      this.size = size;
      this.harrs = Array(size);
   }
   Clear() { this.harrs = Array(this.size); }
   Hash(key) { return key % this.size; }
   Add(key, value) {
      let i = this.Hash(key);
      if (this.harrs[i] == undefined) { this.harrs[i] = []; }
      this.harrs[i].push({ Key:key, Value:value });
   }
   Modify(key, value) {
      let i = this.Hash(key);
      if (this.harrs[i] == undefined) {
         this.harrs[i] = [];
      }
      
      let j = this.harrs[i].findIndex( kvp => (kvp.Key == key) );
      if (j == -1) { 
         this.harrs[i].push({ Key:key, Value:value });
      } else {
         this.harrs[i][j].Value = value;
      }
   }
   Remove( key ) {
      let arr = this.harrs[this.Hash(key)];
      if (arr == null) { return; }
      let i = arr.findIndex(kvp => kvp.Key == key);
      if (i == -1) { return; }
      for (; i < arr.length - 1; i++) { arr[i] = arr[i + 1]; }
      arr.pop();
      return null;
   }
   //null if no node with Key == key exists
   Value( key ) {
      let arr = this.harrs[this.Hash(key)];
      if (arr == null) { return null; }
      for (let i = 0; i < arr.length; i++) {
         if (arr[i].Key == key) { return arr[i].Value; }
      }
      return null;
   }
};

