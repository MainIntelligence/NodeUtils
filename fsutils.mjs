
import {promises as fs } from "fs";
import {resolve} from "path";
import Hash from "./Hash.mjs"
import {mod0} from "./Module.mjs"
const readdir = fs.readdir;

//For iterating all files in a directory (recursively)
export async function* FileGenerator(dir, rdir = '/') {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const fpath = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* FileGenerator(fpath, rdir + dirent.name + '/' );
    } else {
      yield rdir + dirent.name;
    }
  }
}
//apply the function to all files in given directory (recursive)
export function SubFileProcess( rootdir, func ) {
(async () => {
  for await (const f of FileGenerator(rootdir)) {
     func(f);
  }
})()
}
//For maintaining files within some root directory
export default class FSManager {
   //rootdir to which all files (and their hashes) are relative
   //pathhashsize, by design of Hash is always correct,
   //	play with this value to optomize performance/memory ratio
   constructor(rootdir, pathhashsize) {
      this.root = rootdir;
      this.filehash = new Hash(pathhashsize);
      SubFileProcess(this.root, ((f) => this.AddFile(f)))
   }
   Contents( f ) { return this.filehash.Value(f); }
   DoContentProc(f, proc) {
      fs.readFile(this.root + f).then(contents => {
         proc(f, contents);
      })
      .catch(err => {
         mod0.LogErr("FSManager - Cannot load "+ f + " " + err);
      })
   }
   AddFile(f) { this.DoContentProc(f, ((f,c) => this.filehash.Add(f,c))) }
   RemoveFile(f) { this.filehash.Remove(f) }
   RefreshFile( f ) { this.DoContentProc(f, ((f,c) => this.filehash.Modify(f,c))) }
   
   Refresh(subdir = '') {
      SubFileProcess(this.root + subdir, ((f) => this.RefreshFile(f)))
   };
   Reset() { 
      this.filehash.Clear();
      SubFileProcess(this.root, ((f) => this.AddFile(f)))
   }
}


