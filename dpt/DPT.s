.section .rodata
msg: .ascii "DPT\n"
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
