// Программирующие языки: каждый файл печатает DPT.
// Поле note — то, что попадёт в таблицу README.

export const langs = [
  { ext: 'py', name: 'Python', note: 'печатает `DPT`', body: `# TheDPT — DartPower Team
print("DPT")
` },
  { ext: 'pyw', name: 'Python (windowless)', note: 'то же, но без консоли', body: `import sys
if sys.platform == "win32":
    import ctypes
    ctypes.windll.user32.MessageBoxW(0, "DPT", "TheDPT", 0x40)
else:
    print("DPT")
` },
  { ext: 'ipynb', name: 'Jupyter Notebook', note: 'ноутбук с одной ячейкой', body: `{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": ["# TheDPT\\n", "DartPower Team"]
  },
  {
   "cell_type": "code",
   "execution_count": 1,
   "metadata": {},
   "outputs": [
    {
     "name": "stdout",
     "output_type": "stream",
     "text": ["DPT\\n"]
    }
   ],
   "source": ["print(\\"DPT\\")"]
  }
 ],
 "metadata": {
  "kernelspec": { "display_name": "Python 3", "language": "python", "name": "python3" }
 },
 "nbformat": 4,
 "nbformat_minor": 5
}
` },
  { ext: 'js', name: 'JavaScript', note: 'печатает `DPT`', body: `// TheDPT — DartPower Team
console.log('DPT');
` },
  { ext: 'mjs', name: 'JavaScript (ESM)', note: 'ES-модуль, печатает `DPT`', body: `const team = 'DartPower Team';
export const dpt = () => console.log('DPT');
dpt();
` },
  { ext: 'cjs', name: 'CommonJS', note: 'модуль для Node', body: `module.exports = 'DPT';
console.log(module.exports);
` },
  { ext: 'jsx', name: 'React JSX', note: 'компонент `<DPT />`', body: `export function DPT() {
  return <h1>DPT</h1>;
}
` },
  { ext: 'ts', name: 'TypeScript', note: 'типизированный `DPT`', body: `type Team = 'DartPower Team';
const name: Team = 'DartPower Team';
const shout = (s: string): string => s.toUpperCase();
console.log(shout('DPT'), \`— \${name}\`);
` },
  { ext: 'tsx', name: 'TypeScript + JSX', note: 'типизированный компонент', body: `type Props = { label?: string };
export const DPT = ({ label = 'DPT' }: Props) => <b>{label}</b>;
` },
  { ext: 'coffee', name: 'CoffeeScript', note: 'печатает `DPT`', body: `# TheDPT
dpt = -> console.log "DPT"
dpt()
` },
  { ext: 'dart', name: 'Dart', note: 'печатает `DPT`', body: `void main() {
  print('DPT');
}
` },
  { ext: 'java', name: 'Java', note: 'печатает `DPT`', body: `public class DPT {
    public static void main(String[] args) {
        System.out.println("DPT");
    }
}
` },
  { ext: 'kt', name: 'Kotlin', note: 'печатает `DPT`', body: `fun main() = println("DPT")
` },
  { ext: 'kts', name: 'Kotlin Script', note: 'скрипт, печатает `DPT`', body: `val team = "DartPower Team"
println("DPT ($team)")
` },
  { ext: 'scala', name: 'Scala', note: 'печатает `DPT`', body: `object DPT extends App {
  println("DPT")
}
` },
  { ext: 'sc', name: 'Scala Script', note: 'скрипт-однострочник', body: `println("DPT")
` },
  { ext: 'groovy', name: 'Groovy', note: 'печатает `DPT`', body: `println 'DPT'
` },
  { ext: 'clj', name: 'Clojure', note: 'печатает `DPT`', body: `(println "DPT")
` },
  { ext: 'cljs', name: 'ClojureScript', note: 'печатает `DPT` в консоль', body: `(js/console.log "DPT")
` },
  { ext: 'cljc', name: 'Clojure (common)', note: 'работает и в JVM, и в JS', body: `(ns dpt.core)
(defn -main [] (println "DPT"))
` },
  { ext: 'edn', name: 'EDN', note: 'данные: команда DPT', body: `{:team "DartPower Team"
 :name "DPT"
 :members 3
 :tags #{:dart :power :team}}
` },
  { ext: 'ex', name: 'Elixir', note: 'печатает `DPT`', body: `defmodule DPT do
  def hello, do: IO.puts("DPT")
end

DPT.hello()
` },
  { ext: 'exs', name: 'Elixir Script', note: 'скрипт, печатает `DPT`', body: `IO.puts("DPT")
` },
  { ext: 'erl', name: 'Erlang', note: 'печатает `DPT`', body: `-module(dpt).
-export([main/0]).

main() -> io:format("DPT~n").
` },
  { ext: 'hrl', name: 'Erlang Header', note: 'заголовок с макросом', body: `-define(DPT, "DartPower Team").
-define(HELLO, io:format("DPT~n")).
` },
  { ext: 'hs', name: 'Haskell', note: 'печатает `DPT`', body: `main :: IO ()
main = putStrLn "DPT"
` },
  { ext: 'lhs', name: 'Literate Haskell', note: 'текст, который компилируется', body: `> main :: IO ()
> main = putStrLn "DPT"

Файл читается как обычный текст, а строки с \`>\` — код.
` },
  { ext: 'ml', name: 'OCaml', note: 'печатает `DPT`', body: `let () = print_endline "DPT"
` },
  { ext: 'mli', name: 'OCaml Interface', note: 'сигнатура модуля', body: `(** TheDPT — DartPower Team *)
val name : string
val hello : unit -> unit
` },
  { ext: 'fs', name: 'F#', note: 'печатает `DPT`', body: `[<EntryPoint>]
let main _ =
    printfn "DPT"
    0
` },
  { ext: 'fsx', name: 'F# Script', note: 'скрипт, печатает `DPT`', body: `printfn "DPT"
` },
  { ext: 'vb', name: 'Visual Basic .NET', note: 'печатает `DPT`', body: `Module DPT
    Sub Main()
        Console.WriteLine("DPT")
    End Sub
End Module
` },
  { ext: 'cs', name: 'C#', note: 'печатает `DPT`', body: `using System;

class DPT
{
    static void Main() => Console.WriteLine("DPT");
}
` },
  { ext: 'c', name: 'C', note: 'печатает `DPT`', body: `/* TheDPT — DartPower Team */
#include <stdio.h>

int main(void)
{
    puts("DPT");
    return 0;
}
` },
  { ext: 'h', name: 'C Header', note: 'заголовок с константой', body: `#ifndef DPT_H
#define DPT_H

#define DPT_NAME "DartPower Team"
#define DPT_SHOUT "DPT"

void dpt_hello(void);

#endif
` },
  { ext: 'cpp', name: 'C++', note: 'печатает `DPT`', body: `#include <iostream>

int main() {
    std::cout << "DPT" << std::endl;
}
` },
  { ext: 'hpp', name: 'C++ Header', note: 'шаблон `dpt::hello`', body: `#pragma once
#include <string_view>

namespace dpt {
inline constexpr std::string_view name = "DartPower Team";
inline constexpr std::string_view shout = "DPT";
}
` },
  { ext: 'cc', name: 'C++ (cc)', note: 'тот же C++, другое расширение', body: `#include <cstdio>

int main() { std::puts("DPT"); }
` },
  { ext: 'm', name: 'Objective-C', note: 'печатает `DPT`', body: `#import <Foundation/Foundation.h>

int main() {
    @autoreleasepool {
        NSLog(@"DPT");
    }
    return 0;
}
` },
  { ext: 'mm', name: 'Objective-C++', note: 'печатает `DPT`', body: `#include <iostream>

int main() {
    std::cout << "DPT" << std::endl;
}
` },
  { ext: 'swift', name: 'Swift', note: 'печатает `DPT`', body: `print("DPT")
` },
  { ext: 'go', name: 'Go', note: 'печатает `DPT`', body: `package main

import "fmt"

func main() {
	fmt.Println("DPT")
}
` },
  { ext: 'rs', name: 'Rust', note: 'печатает `DPT`', body: `fn main() {
    println!("DPT");
}
` },
  { ext: 'rb', name: 'Ruby', note: 'печатает `DPT`', body: `# TheDPT
puts 'DPT'
` },
  { ext: 'rake', name: 'Rakefile (Ruby DSL)', note: 'задача `dpt`', body: `desc 'TheDPT'
task :dpt do
  puts 'DPT'
end
` },
  { ext: 'php', name: 'PHP', note: 'печатает `DPT`', body: `<?php
// TheDPT — DartPower Team
echo "DPT\\n";
` },
  { ext: 'phtml', name: 'PHP Template', note: 'HTML + PHP', body: `<!doctype html>
<h1><?php echo "DPT"; ?></h1>
` },
  { ext: 'pl', name: 'Perl', note: 'печатает `DPT`', body: `#!/usr/bin/perl
use strict;
use warnings;
print "DPT\\n";
` },
  { ext: 'pm', name: 'Perl Module', note: 'модуль `DPT`', body: `package DPT;
use strict;
our $VERSION = '1.0';
sub hello { return "DPT" }
1;
` },
  { ext: 'raku', name: 'Raku', note: 'печатает `DPT`', body: `say 'DPT';
` },
  { ext: 'lua', name: 'Lua', note: 'печатает `DPT`', body: `print("DPT")
` },
  { ext: 'tcl', name: 'Tcl', note: 'печатает `DPT`', body: `puts "DPT"
` },
  { ext: 'awk', name: 'AWK', note: 'печатает `DPT`', body: `BEGIN { print "DPT" }
` },
  { ext: 'sed', name: 'sed', note: 'заменяет `hello` на `DPT`', body: `s/hello/DPT/g
` },
  { ext: 'sh', name: 'POSIX Shell', note: 'печатает `DPT`', body: `#!/bin/sh
echo "DPT"
` },
  { ext: 'bash', name: 'Bash', note: 'печатает `DPT`', body: `#!/usr/bin/env bash
set -euo pipefail
echo "DPT"
` },
  { ext: 'zsh', name: 'Zsh', note: 'печатает `DPT`', body: `#!/usr/bin/env zsh
print -r -- "DPT"
` },
  { ext: 'fish', name: 'Fish', note: 'печатает `DPT`', body: `#!/usr/bin/env fish
echo "DPT"
` },
  { ext: 'ps1', name: 'PowerShell', note: 'печатает `DPT`', body: `Write-Host 'DPT' -ForegroundColor Cyan
` },
  { ext: 'psm1', name: 'PowerShell Module', note: 'функция `Get-DPT`', body: `function Get-DPT {
    [CmdletBinding()]
    param([string]$Name = 'DartPower Team')
    "DPT ($Name)"
}

Export-ModuleMember -Function Get-DPT
` },
  { ext: 'bat', name: 'Batch', note: 'печатает `DPT` и красит консоль', body: `@echo off
chcp 65001 >nul
title TheDPT
color 0B
echo DPT
` },
  { ext: 'cmd', name: 'cmd (без @echo off)', note: 'печатает `DPT`', body: `echo DPT
` },
  { ext: 'vbs', name: 'VBScript', note: 'окно с `DPT`', body: `MsgBox "DPT", vbInformation, "TheDPT"
` },
  { ext: 'ahk', name: 'AutoHotkey', note: 'хоткей, показывающий `DPT`', body: `; TheDPT
^!d::MsgBox, DPT
` },
  { ext: 'au3', name: 'AutoIt', note: 'окно с `DPT`', body: `MsgBox(64, "TheDPT", "DPT")
` },
  { ext: 'applescript', name: 'AppleScript', note: 'диалог с `DPT`', body: `display dialog "DPT" with title "TheDPT"
` },
  { ext: 'nim', name: 'Nim', note: 'печатает `DPT`', body: `echo "DPT"
` },
  { ext: 'cr', name: 'Crystal', note: 'печатает `DPT`', body: `puts "DPT"
` },
  { ext: 'd', name: 'D', note: 'печатает `DPT`', body: `import std.stdio;

void main() {
    writeln("DPT");
}
` },
  { ext: 'zig', name: 'Zig', note: 'печатает `DPT`', body: `const std = @import("std");

pub fn main() !void {
    try std.io.getStdOut().writer().print("DPT\\n", .{});
}
` },
  { ext: 'v', name: 'V', note: 'печатает `DPT`', body: `fn main() {
	println('DPT')
}
` },
  { ext: 'odin', name: 'Odin', note: 'печатает `DPT`', body: `package dpt

import "core:fmt"

main :: proc() {
	fmt.println("DPT")
}
` },
  { ext: 'pas', name: 'Pascal', note: 'печатает `DPT`', body: `program DPT;
begin
  WriteLn('DPT');
end.
` },
  { ext: 'dpr', name: 'Delphi Project', note: 'печатает `DPT`', body: `program DPT;

{$APPTYPE CONSOLE}

begin
  Writeln('DPT');
end.
` },
  { ext: 'lpr', name: 'Lazarus Project', note: 'печатает `DPT`', body: `program DPT;
{$mode objfpc}{$H+}
begin
  WriteLn('DPT');
end.
` },
  { ext: 'delphi', name: 'Delphi (unit)', note: 'юнит `DPT`', body: `unit DPT;

interface

const DPT_NAME = 'DartPower Team';

implementation

end.
` },
  { ext: 'bas', name: 'BASIC', note: 'печатает `DPT`', body: `10 REM TheDPT
20 PRINT "DPT"
30 END
` },
  { ext: 'frm', name: 'Visual Basic 6 Form', note: 'форма с надписью DPT', body: `VERSION 5.00
Begin VB.Form frmDPT
   Caption         =   "TheDPT"
   Begin VB.Label lbl
      Caption         =   "DPT"
   End
End
Attribute VB_Name = "frmDPT"
` },
  { ext: 'cbl', name: 'COBOL', note: 'печатает `DPT`', body: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. DPT.
       PROCEDURE DIVISION.
           DISPLAY "DPT".
           STOP RUN.
` },
  { ext: 'cob', name: 'COBOL (cob)', note: 'то же, другое расширение', body: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. DPTCOB.
       PROCEDURE DIVISION.
           DISPLAY "DPT".
           STOP RUN.
` },
  { ext: 'f77', name: 'Fortran 77', note: 'печатает `DPT`', body: `      PROGRAM DPT
      WRITE(*,*) 'DPT'
      END
` },
  { ext: 'f90', name: 'Fortran 90', note: 'печатает `DPT`', body: `program dpt
  print *, "DPT"
end program dpt
` },
  { ext: 'f95', name: 'Fortran 95', note: 'печатает `DPT`', body: `program dpt95
  implicit none
  write (*, '(A)') 'DPT'
end program dpt95
` },
  { ext: 'ada', name: 'Ada', note: 'печатает `DPT`', body: `with Ada.Text_IO;

procedure DPT is
begin
   Ada.Text_IO.Put_Line ("DPT");
end DPT;
` },
  { ext: 'adb', name: 'Ada Body', note: 'тело пакета', body: `package body DPT is
   procedure Hello is
   begin
      Ada.Text_IO.Put_Line ("DPT");
   end Hello;
end DPT;
` },
  { ext: 'ads', name: 'Ada Spec', note: 'спецификация пакета', body: `package DPT is
   Team : constant String := "DartPower Team";
   procedure Hello;
end DPT;
` },
  { ext: 'vhd', name: 'VHDL', note: 'сущность `DPT`', body: `entity DPT is
end entity;

architecture rtl of DPT is
begin
  -- печатает DPT в симуляторе
  process
  begin
    report "DPT" severity note;
    wait;
  end process;
end architecture;
` },
  { ext: 'sv', name: 'SystemVerilog', note: 'модуль с `$display`', body: `module DPT;
  initial begin
    $display("DPT");
    $finish;
  end
endmodule
` },
  { ext: 'verilog', name: 'Verilog', note: 'модуль с `$display`', body: `module DPT;
  initial $display("DPT");
endmodule
` },
  { ext: 'asm', name: 'x86 Assembly (NASM)', note: 'пишет `DPT` через syscall', body: `; TheDPT — x86-64 Linux
global _start

section .data
    msg db "DPT", 10
    len equ $ - msg

section .text
_start:
    mov rax, 1
    mov rdi, 1
    mov rsi, msg
    mov rdx, len
    syscall
    mov rax, 60
    xor rdi, rdi
    syscall
` },
  { ext: 's', name: 'GNU as', note: 'то же на AT&T-синтаксисе', body: `.section .rodata
msg: .ascii "DPT\\n"
.set len, . - msg

.text
.globl _start
_start:
    movl $1, %eax
    movl $1, %edi
    leaq msg(%rip), %rsi
    movl $len, %edx
    syscall
    movl $60, %eax
    xorl %edi, %edi
    syscall
` },
  { ext: 'nasm', name: 'NASM (16-bit DOS)', note: 'COM-программа для DOS', body: `org 0x100
mov dx, msg
mov ah, 0x09
int 0x21
mov ax, 0x4c00
int 0x21
msg db "DPT$"
` },
  { ext: 'arm.S', name: 'ARM Assembly', note: 'Linux ARM64, `DPT` в stdout', body: `// TheDPT — aarch64 Linux
.global _start
.data
msg: .ascii "DPT\\n"
.text
_start:
    mov x0, #1
    adr x1, msg
    mov x2, #4
    mov x8, #64
    svc #0
    mov x0, #0
    mov x8, #93
    svc #0
` },
  { ext: 'wat', name: 'WebAssembly Text', note: 'модуль, возвращающий 0', body: `(module
  (memory (export "memory") 1)
  (data (i32.const 0) "DPT")
  (func (export "dpt") (result i32)
    i32.const 3))
` },
  { ext: 'll', name: 'LLVM IR', note: 'печатает `DPT` через printf', body: `@dpt = private unnamed_addr constant [4 x i8] c"DPT\\00"

declare i32 @puts(ptr)

define i32 @main() {
  %1 = call i32 @puts(ptr @dpt)
  ret i32 0
}
` },
  { ext: 'mlir', name: 'MLIR', note: 'функция, возвращающая 0', body: `module {
  func.func @dpt() -> i32 {
    %0 = arith.constant 0 : i32
    return %0 : i32
  }
}
` },
  { ext: 'sol', name: 'Solidity', note: 'контракт `DPT`', body: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DPT {
    string public constant name = "DPT";
    string public constant team = "DartPower Team";
}
` },
  { ext: 'vy', name: 'Vyper', note: 'контракт `DPT`', body: `# @version ^0.3.10
name: public(String[3])

@external
def __init__():
    self.name = "DPT"
` },
  { ext: 'cairo', name: 'Cairo', note: 'функция, возвращающая 0', body: `fn dpt() -> felt252 {
    0
}
` },
  { ext: 'move', name: 'Move', note: 'модуль `DPT`', body: `module dpt::dpt {
    public fun name(): vector<u8> {
        b"DPT"
    }
}
` },
  { ext: 'hx', name: 'Haxe', note: 'печатает `DPT`', body: `class DPT {
    static function main() {
        trace("DPT");
    }
}
` },
  { ext: 'as', name: 'ActionScript', note: 'печатает `DPT`', body: `package {
    public class DPT {
        public function DPT() { trace("DPT"); }
    }
}
` },
  { ext: 'elm', name: 'Elm', note: 'печатает `DPT`', body: `module Main exposing (main)

import Html exposing (text)

main =
    text "DPT"
` },
  { ext: 'purs', name: 'PureScript', note: 'печатает `DPT`', body: `module Main where

import Effect.Console (log)

main = log "DPT"
` },
  { ext: 're', name: 'Reason', note: 'печатает `DPT`', body: `Js.log("DPT");
` },
  { ext: 'rei', name: 'Reason Interface', note: 'интерфейс модуля', body: `let name: string;
let hello: unit => unit;
` },
  { ext: 'res', name: 'ReScript', note: 'печатает `DPT`', body: `Js.log("DPT")
` },
  { ext: 'pro', name: 'Prolog', note: 'печатает `DPT`', body: `:- initialization(main).

main :- write('DPT'), nl, halt.
` },
  { ext: 'lisp', name: 'Common Lisp', note: 'печатает `DPT`', body: `(format t "DPT~%")
` },
  { ext: 'el', name: 'Emacs Lisp', note: 'сообщение в минибуфере', body: `(message "DPT")
` },
  { ext: 'scm', name: 'Scheme', note: 'печатает `DPT`', body: `(display "DPT")
(newline)
` },
  { ext: 'rkt', name: 'Racket', note: 'печатает `DPT`', body: `#lang racket
(displayln "DPT")
` },
  { ext: 'cl', name: 'Common Lisp (cl)', note: 'то же, другое расширение', body: `(print "DPT")
` },
  { ext: 'jl', name: 'Julia', note: 'печатает `DPT`', body: `println("DPT")
` },
  { ext: 'r', name: 'R', note: 'печатает `DPT`', body: `cat("DPT\\n")
` },
  { ext: 'gd', name: 'GDScript', note: 'печатает `DPT` в Godot', body: `extends Node

func _ready() -> void:
	print("DPT")
` },
  { ext: 'ino', name: 'Arduino', note: 'шлёт `DPT` в Serial', body: `void setup() {
  Serial.begin(9600);
  Serial.println("DPT");
}

void loop() {}
` },
  { ext: 'pde', name: 'Processing', note: 'рисует `DPT` на холсте', body: `void setup() {
  size(300, 120);
  textSize(48);
  text("DPT", 40, 80);
}
` },
  { ext: 'qml', name: 'QML', note: 'окно с надписью DPT', body: `import QtQuick 2.15

Rectangle {
    width: 300; height: 120
    color: "#0B1022"
    Text { anchors.centerIn: parent; text: "DPT"; color: "#6EE7FF"; font.pixelSize: 48 }
}
` },
  { ext: 'ui', name: 'Qt Designer UI', note: 'XML-описание окна', body: `<?xml version="1.0" encoding="UTF-8"?>
<ui version="4.0">
 <class>DPT</class>
 <widget class="QWidget" name="DPT">
  <property name="windowTitle"><string>TheDPT</string></property>
  <widget class="QLabel" name="label"><property name="text"><string>DPT</string></property></widget>
 </widget>
</ui>
` },
  { ext: 'glsl', name: 'GLSL', note: 'фрагментный шейдер рисует градиент', body: `#version 330 core
out vec4 fragColor;

void main() {
    vec2 uv = gl_FragCoord.xy / vec2(512.0);
    fragColor = vec4(uv.x, uv.y, 0.9, 1.0);
}
` },
  { ext: 'vert', name: 'Vertex Shader', note: 'вершинный шейдер', body: `#version 330 core
layout (location = 0) in vec3 aPos;

void main() {
    gl_Position = vec4(aPos, 1.0);
}
` },
  { ext: 'frag', name: 'Fragment Shader', note: 'фрагментный шейдер', body: `#version 330 core
out vec4 fragColor;

void main() {
    fragColor = vec4(0.43, 0.36, 1.0, 1.0);
}
` },
  { ext: 'hlsl', name: 'HLSL', note: 'пиксельный шейдер', body: `float4 PSMain(float4 pos : SV_POSITION) : SV_TARGET {
    return float4(0.43, 0.36, 1.0, 1.0);
}
` },
  { ext: 'metal', name: 'Metal', note: 'шейдер для Apple GPU', body: `#include <metal_stdlib>
using namespace metal;

fragment float4 dpt_frag() {
    return float4(0.43, 0.36, 1.0, 1.0);
}
` },
  { ext: 'comp', name: 'GLSL Compute', note: 'compute-шейдер', body: `#version 430
layout (local_size_x = 64) in;

void main() {
    // DPT
}
` },
  { ext: 'cu', name: 'CUDA', note: 'ядро, печатающее `DPT`', body: `#include <stdio.h>

__global__ void dpt() { printf("DPT\\n"); }

int main() { dpt<<<1, 1>>>(); cudaDeviceSynchronize(); return 0; }
` },
  { ext: 'cuh', name: 'CUDA Header', note: 'заголовок с ядром', body: `#pragma once
__global__ void dpt_hello();
` },
  { ext: 'rexx', name: 'Rexx', note: 'печатает `DPT`', body: `say "DPT"
` },
  { ext: 'apl', name: 'APL', note: 'печатает `DPT`', body: `⎕←'DPT'
` },
  { ext: 'j', name: 'J', note: 'печатает `DPT`', body: `echo 'DPT'
` },
  { ext: 'forth', name: 'Forth', note: 'печатает `DPT`', body: `." DPT" cr
` },
  { ext: 'st', name: 'Smalltalk', note: 'печатает `DPT`', body: `Transcript show: 'DPT'; cr.
` },
  { ext: 'vala', name: 'Vala', note: 'печатает `DPT`', body: `void main() {
    print("DPT\\n");
}
` },
  { ext: 'sql', name: 'SQL', note: 'выборка строки `DPT`', body: `SELECT 'DPT' AS team;
` },
  { ext: 'plsql', name: 'PL/SQL', note: 'анонимный блок', body: `BEGIN
  DBMS_OUTPUT.PUT_LINE('DPT');
END;
/
` },
  { ext: 'tsql', name: 'T-SQL', note: 'печатает `DPT`', body: `PRINT 'DPT';
GO
` },
  { ext: 'psql', name: 'PL/pgSQL', note: 'функция возвращает `DPT`', body: `CREATE OR REPLACE FUNCTION dpt() RETURNS text AS $$
BEGIN
  RETURN 'DPT';
END;
$$ LANGUAGE plpgsql;
` },
  { ext: 'mysql', name: 'MySQL', note: 'выборка `DPT`', body: `SELECT 'DPT' AS team;
` },
  { ext: 'cypher', name: 'Cypher', note: 'узел команды DPT', body: `CREATE (t:Team {name: 'DPT'}) RETURN t;
` },
  { ext: 'sparql', name: 'SPARQL', note: 'запрос к графу', body: `PREFIX dpt: <https://dpteam.dev/>
SELECT ?team WHERE { ?team dpt:name "DPT" }
` },
  { ext: 'gql', name: 'GraphQL', note: 'запрос `dpt`', body: `query {
  dpt {
    name
    team
  }
}
` },
  { ext: 'proto', name: 'Protocol Buffers', note: 'сообщение `DPT`', body: `syntax = "proto3";
package dpt;

message Team {
  string name = 1;
  string shout = 2;
}
` },
  { ext: 'thrift', name: 'Thrift', note: 'структура `DPT`', body: `namespace * dpt

struct Team {
  1: string name,
  2: string shout
}
` },
  { ext: 'avsc', name: 'Avro Schema', note: 'схема записи', body: `{
  "type": "record",
  "name": "DPT",
  "fields": [{ "name": "shout", "type": "string" }]
}
` },
  { ext: 'xq', name: 'XQuery', note: 'печатает `DPT`', body: `xquery version "3.1";
"DPT"
` },
  { ext: 'jq', name: 'jq', note: 'фильтр, возвращающий `DPT`', body: `"DPT"
` },
  { ext: 'cmake', name: 'CMake', note: 'печатает `DPT` при конфигурации', body: `cmake_minimum_required(VERSION 3.20)
project(DPT LANGUAGES C)
message(STATUS "DPT")
` },
  { ext: 'mk', name: 'Makefile', note: 'цель `dpt`', body: `dpt:
	@echo DPT
` },
  { ext: 'nix', name: 'Nix', note: 'деривация, печатающая `DPT`', body: `{ stdenv }:
stdenv.mkDerivation {
  pname = "dpt";
  version = "1.0";
  src = ./.;
}
` },
  { ext: 'dhall', name: 'Dhall', note: 'конфиг команды', body: `let Team = { name : Text, shout : Text }
in { name = "DartPower Team", shout = "DPT" } : Team
` },
  { ext: 'cue', name: 'CUE', note: 'схема и значение', body: `#Team: {
	name:  string
	shout: string
}

dpt: #Team & {
	name:  "DartPower Team"
	shout: "DPT"
}
` },
  { ext: 'jsonnet', name: 'Jsonnet', note: 'генерирует JSON с `DPT`', body: `{
  team: 'DartPower Team',
  shout: 'DPT',
}
` },
  { ext: 'hcl', name: 'HCL', note: 'блок с `DPT`', body: `team "dpt" {
  name = "DartPower Team"
  shout = "DPT"
}
` },
  { ext: 'tf', name: 'Terraform', note: 'вывод `DPT`', body: `output "dpt" {
  value = "DPT"
}
` },
  { ext: 'bicep', name: 'Bicep', note: 'вывод `DPT`', body: `output dpt string = 'DPT'
` },
  { ext: 'ps', name: 'PostScript', note: 'рисует `DPT` на странице', body: `%!PS-Adobe-3.0
/Helvetica-Bold findfont 48 scalefont setfont
72 700 moveto
(DPT) show
showpage
` },
  { ext: 'reg', name: 'Windows Registry', note: 'ключ команды', body: `Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\\Software\\DartPower\\DPT]
"Name"="DartPower Team"
"Shout"="DPT"
` },
  { ext: 'wasm', name: 'WebAssembly (binary)', note: 'бинарный модуль с `DPT` в памяти', body: null },
  { ext: 'g4', name: 'ANTLR Grammar', note: 'грамматика языка DPT', body: `grammar DPT;

dpt : 'DPT' EOF ;
WS  : [ \\t\\r\\n]+ -> skip ;
` },
  { ext: 'y', name: 'Yacc', note: 'грамматика `DPT`', body: `%token DPT
%%
program: DPT { printf("ok\\n"); } ;
%%
` },
  { ext: 'l', name: 'Lex', note: 'лексер, узнающий `DPT`', body: `%%
DPT  { return 1; }
.    { }
%%
` },
  { ext: 'pest', name: 'Pest Grammar', note: 'грамматика для Rust', body: `dpt = { "DPT" }
WHITESPACE = _{ " " }
` },
];
