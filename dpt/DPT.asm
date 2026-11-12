; TheDPT — x86-64 Linux
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
