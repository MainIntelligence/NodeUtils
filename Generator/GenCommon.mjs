import Hash from "./../Hash.mjs"

function ReactScript(branch) {
   "<script src=\"https://unpkg.com/react@18/umd/react." + branch + ".js\" crossorigin></script><script src=\"https://unpkg.com/react-dom@18/umd/react-dom." + branch + ".js\" crossorigin></script>"
};

export default class CommonScriptMap {
   constructor(size = 10) {
      this.hasht = new Hash(size);
      
      this.Add("math", "<script src=\"https://polyfill.io/v3/polyfill.min.js?features=es6\"></script><script>MathJax={tex:{inlineMath:[['$','$'],['\\\\(','\\\\)']]}};</script><script id=\"MathJax-script\" async src=\"https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js\"></script>");
      this.Add("reactdev", ReactScript("development"));
      this.Add("react", ReactScript("production.min"));
   }
   Add(alias, script) {
      this.hasht.Add(alias, script);
   }
   Script(alias) {
      return this.hasht.Value(alias.toLowerCase());
   }
};
