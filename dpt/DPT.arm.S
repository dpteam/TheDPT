// TheDPT — aarch64 Linux
.global _start
.data
msg: .ascii "DPT\n"
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
