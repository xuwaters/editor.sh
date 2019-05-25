use failure::{format_err, Fallible, ResultExt};
use std::collections;
use std::process::ExitStatus;

mod cmd;
mod util;

mod run_assembly;
mod run_bash;
mod run_c;
mod run_clojure;
mod run_coffeescript;
mod run_cpp;
mod run_crystal;
mod run_csharp;
mod run_elixir;
mod run_erlang;
mod run_fsharp;
mod run_go;
mod run_groovy;
mod run_haskell;
mod run_java;
mod run_javascript;
mod run_julia;
mod run_kotlin;
mod run_lua;
mod run_markdown;
mod run_mysql;
mod run_objc;
mod run_ocaml;
mod run_perl;
mod run_perl6;
mod run_php;
mod run_postgres;
mod run_python2;
mod run_python3;
mod run_r;
mod run_ruby;
mod run_rust;
mod run_scala;
mod run_swift;
mod run_typescript;
mod run_vb;

type LangRunFn = fn(files: Vec<&str>, stdin: &str) -> Fallible<ExitStatus>;
type LangRunFnMap = collections::HashMap<&'static str, LangRunFn>;

lazy_static! {
    static ref LANGUAGES: LangRunFnMap = {
        let mut languages = LangRunFnMap::new();

        languages.insert("assembly", run_assembly::run as LangRunFn);
        languages.insert("bash", run_bash::run as LangRunFn);
        languages.insert("c", run_c::run as LangRunFn);
        languages.insert("clojure", run_clojure::run as LangRunFn);
        languages.insert("coffeescript", run_coffeescript::run as LangRunFn);
        languages.insert("cpp", run_cpp::run as LangRunFn);
        languages.insert("crystal", run_crystal::run as LangRunFn);
        languages.insert("csharp", run_csharp::run as LangRunFn);
        languages.insert("elixir", run_elixir::run as LangRunFn);
        languages.insert("erlang", run_erlang::run as LangRunFn);
        languages.insert("fsharp", run_fsharp::run as LangRunFn);
        languages.insert("go", run_go::run as LangRunFn);
        languages.insert("groovy", run_groovy::run as LangRunFn);
        languages.insert("haskell", run_haskell::run as LangRunFn);
        languages.insert("java", run_java::run as LangRunFn);
        languages.insert("javascript", run_javascript::run as LangRunFn);
        languages.insert("julia", run_julia::run as LangRunFn);
        languages.insert("kotlin", run_kotlin::run as LangRunFn);
        languages.insert("lua", run_lua::run as LangRunFn);
        languages.insert("markdown", run_markdown::run as LangRunFn);
        languages.insert("mysql", run_mysql::run as LangRunFn);
        languages.insert("objc", run_objc::run as LangRunFn);
        languages.insert("ocaml", run_ocaml::run as LangRunFn);
        languages.insert("perl", run_perl::run as LangRunFn);
        languages.insert("perl6", run_perl6::run as LangRunFn);
        languages.insert("php", run_php::run as LangRunFn);
        languages.insert("postgres", run_postgres::run as LangRunFn);
        languages.insert("python2", run_python2::run as LangRunFn);
        languages.insert("python3", run_python3::run as LangRunFn);
        languages.insert("r", run_r::run as LangRunFn);
        languages.insert("ruby", run_ruby::run as LangRunFn);
        languages.insert("rust", run_rust::run as LangRunFn);
        languages.insert("scala", run_scala::run as LangRunFn);
        languages.insert("swift", run_swift::run as LangRunFn);
        languages.insert("typescript", run_typescript::run as LangRunFn);
        languages.insert("vb", run_vb::run as LangRunFn);

        languages
    };
}

fn languages() -> &'static LangRunFnMap {
    &LANGUAGES
}

pub fn supported_languages() -> Vec<&'static str> {
    let mut all_langs: Vec<_> = languages().keys().map(|s| *s).collect();
    all_langs.sort();
    all_langs
}

pub fn is_supported(language: &str) -> bool {
    languages().contains_key(language)
}

pub fn run_code(lang: &str, file_paths: Vec<&str>, stdin: Option<&str>) -> Fallible<ExitStatus> {
    assert!(file_paths.len() > 0);
    match languages().get(lang) {
        None => Err(format_err!("not supported language")),
        Some(run_fn) => run_fn(file_paths, stdin.unwrap_or("")),
    }
}

pub fn run_bash_stdin(work_dir: &str, command: &str, stdin: Option<&str>) -> Fallible<ExitStatus> {
    cmd::run_bash_stdin(work_dir, command, stdin.unwrap_or(""))
}
