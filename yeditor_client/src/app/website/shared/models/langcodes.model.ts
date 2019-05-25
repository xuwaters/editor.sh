

export class Langcode {
  constructor(
    public readonly code: string, // for human view
  ) {
  }
}

export class Langcodes {

  static readonly bash = new Langcode(`
#!/usr/bin/env bash

echo "Hello World!"
`);

  static readonly c = new Langcode(`
#include <stdio.h>

int main() {
  printf("Hello World!\\n");
  return 0;
}
`);

  static readonly csharp = new Langcode(`
using System;

class MainClass {
  static void Main() {
    Console.WriteLine("Hello World!");
  }
}
`);

  static readonly cpp = new Langcode(`
#include <iostream>

int main() {
  std::cout << "Hello World!" << std::endl;
  return 0;
}
`);

  static readonly clojure = new Langcode(`
(println "Hello World!")
`);

  static readonly coffeescript = new Langcode(`
console.log "Hello World!"
`);

  static readonly crystal = new Langcode(`
puts "Hello World!"
`);

  static readonly elixir = new Langcode(`
IO.puts "Hello World!"
`);

  static readonly erlang = new Langcode(`
% escript will ignore the first line

main(_) ->
  io:format("Hello World").
`);

  static readonly fsharp = new Langcode(`
printfn "Hello World!"
`);

  static readonly go = new Langcode(`
package main

import (
  "fmt"
)

func main() {
  fmt.Println("Hello World!")
}
`);

  static readonly haskell = new Langcode(`
main = putStrLn "Hello World!"
`);

  static readonly java = new Langcode(`
public class source {
  public static void main(String[] args) {
    System.out.println("Hello World!");
  }
}
`);

  static readonly javascript = new Langcode(`
console.log('Hello World!');
`);

  static readonly kotlin = new Langcode(`
fun main(args : Array<String>){
  println("Hello World!")
}
`);

  static readonly markdown = new Langcode(`
Hello World!
`);

  static readonly mysql = new Langcode(`
SELECT "Hello World!" AS Title;
`);

  static readonly ocaml = new Langcode(`
print_endline "Hello World!"
`);

  static readonly objc = new Langcode(`
#import <Foundation/Foundation.h>

int main () {
  @autoreleasepool {
    NSLog(@"Hello world!");
  }
  return 0;
}
`);

  static readonly php = new Langcode(`
<?php
echo "Hello World!";
`);

  static readonly perl = new Langcode(`
print "Hello World!\\n"
`);

  static readonly perl6 = new Langcode(`
say 'Hello World!';
`);

  static readonly plaintext = new Langcode(`
Hello World!
`);

  static readonly postgres = new Langcode(`
\\echo Hello World!
`);

  static readonly python2 = new Langcode(`
print("Hello World!")
`);

  static readonly python3 = new Langcode(`
print("Hello World!")
`);

  static readonly r = new Langcode(`
print("Hello World!")
`);

  static readonly ruby = new Langcode(`
puts "Hello World!"
`);

  static readonly rust = new Langcode(`
fn main() {
  println!("Hello World!");
}
`);

  static readonly scala = new Langcode(`
object Main extends App {
  println("Hello World!")
}
`);

  static readonly swift = new Langcode(`
print("Hello World!")
`);

  static readonly typescript = new Langcode(`
console.log("Hello World!")
`);

  static readonly vb = new Langcode(`
Module HelloWorld
  Sub Main()
      System.Console.WriteLine("Hello World!")
  End Sub
End Module
`);

}
