import { Langcode, Langcodes } from './langcodes.model';

// monaco supported languages:
// plaintext, json, bat, coffeescript, c, cpp, csharp, csp, css, dockerfile, fsharp, go,
// handlebars, html, ini, java, javascript, kotlin, less, lua, markdown, msdax, mysql,
// objective-c, pascal, pgsql, php, postiats, powerquery, powershell, pug, python, r, razor,
// redis, redshift, ruby, rust, sb, scss, sol, sql, st, swift, tcl, typescript, vb, xml, yaml,
// scheme, clojure, shell, perl, azcli, apex, graphql

export class Language {
  constructor(
    public readonly id: string, // unique language identifier, for backend uid
    public readonly name: string, // for human view
    public readonly editorLanguage: string, // for editor coloring
    public readonly langcode: Langcode,
  ) {
  }
}

export class Languages {
  static readonly bash = new Language('bash', 'Bash', 'shell', Langcodes.bash);
  static readonly c = new Language('c', 'C', 'c', Langcodes.c);
  static readonly csharp = new Language('csharp', 'CSharp', 'csharp', Langcodes.csharp);
  static readonly cpp = new Language('cpp', 'Cpp', 'cpp', Langcodes.cpp);
  static readonly clojure = new Language('clojure', 'Clojure', 'clojure', Langcodes.clojure);
  static readonly coffeescript = new Language('coffeescript', 'CoffeeScript', 'coffeescript', Langcodes.coffeescript);
  static readonly crystal = new Language('crystal', 'Crystal', 'ruby', Langcodes.crystal);
  static readonly elixir = new Language('elixir', 'Elixir', 'elixir', Langcodes.elixir);
  static readonly erlang = new Language('erlang', 'Erlang', 'erlang', Langcodes.erlang);
  static readonly fsharp = new Language('fsharp', 'FSharp', 'fsharp', Langcodes.fsharp);
  static readonly go = new Language('go', 'Go', 'go', Langcodes.go);
  static readonly haskell = new Language('haskell', 'Haskell', 'haskell', Langcodes.haskell);
  static readonly java = new Language('java', 'Java', 'java', Langcodes.java);
  static readonly javascript = new Language('javascript', 'JavaScript', 'javascript', Langcodes.javascript);
  static readonly kotlin = new Language('kotlin', 'Kotlin', 'kotlin', Langcodes.kotlin);
  static readonly markdown = new Language('markdown', 'Markdown', 'markdown', Langcodes.markdown);
  static readonly mysql = new Language('mysql', 'MySQL', 'mysql', Langcodes.mysql);
  static readonly ocaml = new Language('ocaml', 'OCaml', 'ocaml', Langcodes.ocaml);
  static readonly objc = new Language('objc', 'Objective-C', 'objective-c', Langcodes.objc);
  static readonly php = new Language('php', 'PHP', 'php', Langcodes.php);
  static readonly perl = new Language('perl', 'Perl', 'perl', Langcodes.perl);
  static readonly perl6 = new Language('perl6', 'Perl 6', 'perl', Langcodes.perl6);
  static readonly plaintext = new Language('plaintext', 'Plain Text', 'plaintext', Langcodes.plaintext);
  static readonly postgres = new Language('postgres', 'PostgreSQL', 'sql', Langcodes.postgres);
  static readonly python2 = new Language('python2', 'Python 2', 'python', Langcodes.python2);
  static readonly python3 = new Language('python3', 'Python 3', 'python', Langcodes.python3);
  static readonly r = new Language('r', 'R', 'r', Langcodes.r);
  static readonly ruby = new Language('ruby', 'Ruby', 'ruby', Langcodes.ruby);
  static readonly rust = new Language('rust', 'Rust', 'rust', Langcodes.rust);
  static readonly scala = new Language('scala', 'Scala', 'scala', Langcodes.scala);
  static readonly swift = new Language('swift', 'Swift 5', 'swift', Langcodes.swift);
  static readonly typescript = new Language('typescript', 'Typescript', 'typescript', Langcodes.typescript);
  static readonly vb = new Language('vb', 'Visual Basic', 'vb', Langcodes.vb);

  static getLanguageById(id: string): Language {
    return LanguageList.find(it => it.id === id);
  }
}

export const LanguageList: Language[] = [
  Languages.bash,
  Languages.c,
  Languages.csharp,
  Languages.cpp,
  Languages.clojure,
  Languages.coffeescript,
  Languages.crystal,
  Languages.elixir,
  Languages.erlang,
  Languages.fsharp,
  Languages.go,
  Languages.haskell,
  Languages.java,
  Languages.javascript,
  Languages.kotlin,
  Languages.markdown,
  Languages.mysql,
  Languages.ocaml,
  Languages.objc,
  Languages.php,
  Languages.perl,
  Languages.perl6,
  Languages.plaintext,
  Languages.postgres,
  Languages.python2,
  Languages.python3,
  Languages.r,
  Languages.ruby,
  Languages.rust,
  Languages.scala,
  Languages.swift,
  Languages.typescript,
  Languages.vb,
];
