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
; Note 2: Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui. (paragraph 2)
; Note 3: Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. Blanditiis praesentium voluptatum deleniti atque corrupti quos dolores. (paragraph 3)
