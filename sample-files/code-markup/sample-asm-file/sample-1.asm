section .data
    msg db 'Hello, GetSampleData.com!', 0xa
section .text
    global _start
_start:
    mov edx, 27
    mov ecx, msg
    mov ebx, 1
    mov eax, 4
    int 0x80

; Note 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. (paragraph 1)
