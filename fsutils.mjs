
import {promises as fs } from "fs";
import {resolve} from "path";
import Hash from "./Hash.mjs"
import {mod0} from "./Module.mjs"
const readdir = fs.readdir;

//For iterating all files in a directory (recursively)
async function* RecursiveFileGenerator(dir, rdir = '/') {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const fpath = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* RecursiveFileGenerator(fpath, rdir + dirent.name + '/' );
    } else {
      yield rdir + dirent.name;
    }
  }
}
//For iterating all files in a directory (recursively)
async function* FileGenerator(dir, rdir = '/') {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    if (!dirent.isDirectory()) {
      yield rdir + dirent.name;
    }
  }
}
//For iterating all subdirectories in a directory (recursively)
async function* SubdirGenerator(dir, rdir = '/') {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    if (dirent.isDirectory()) {
      yield rdir + dirent.name;
    }
  }
}

function Process(func, generator, ...args) {
(async () => {
  for await (const item of generator(...args)) { func(item); }
})()
}
//apply the function to all files in given directory
export function RecursiveFileProcess( rootdir, func ) {
   Process(func, RecursiveFileGenerator, rootdir);
}
export function FileProcess( dir, func ) {
   Process(func, FileGenerator, dir);
}
export function SubdirProcess( dir, func ) {
   Process(func, SubdirGenerator, dir);
}

//For maintaining files within some root directory
export default class FSManager {
   //rootdir to which all files (and their hashes) are relative
   //pathhashsize, by design of Hash is always correct,
   //	play with this value to optomize performance/memory ratio
   constructor(rootdir, pathhashsize, contmorph = (x => x)) {
      this.root = rootdir;
      this.filehash = new Hash(pathhashsize);
      this.contmorph = contmorph;
      RecursiveFileProcess(this.root, ((f) => this.AddFile(f)))
   }
   Contents( f ) { return this.filehash.Value(f); }
   DoContentProc(f, proc) {
      fs.readFile(this.root + f, "utf-8").then(contents => {
         proc(f, this.contmorph(contents, f));
      })
      .catch(err => {
         mod0.LogErr("FSManager - Cannot load "+ f + " " + err);
      })
   }
   AddFile(f) { this.DoContentProc(f, ((f,c) => this.filehash.Add(f,c))) }
   RemoveFile(f) { this.filehash.Remove(f) }
   RefreshFile( f ) { this.DoContentProc(f, ((f,c) => this.filehash.Modify(f,c))); }
   
   Refresh(subdir = '') {
      RecursiveFileProcess(this.root + subdir, ((f) => this.RefreshFile(f)))
   };
   Reset() { 
      this.filehash.Clear();
      RecursiveFileProcess(this.root, ((f) => this.AddFile(f)))
   }
}


