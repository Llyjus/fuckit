.data
	input: .asciiz "plz enter a integer between 0-99: \n"
	str: .space 8
	int: .word 0
	
.text
	.globl main
	main:
		la, $a0, input
		li, $v0, 4
		syscall
		
		li, $a1, 3
		li, $v0, 8
		la, $a0, str
		move $a0, $t0
		syscall
		
		la $s0, ($t0)
		lbu $t1, 0($s0)
		sub $t1, $t1 , 48
		lbu $t2, 1($s0)
		sub $t2, $t2, 48
		mul $t1, $t1, 10
		add $t3, $t1, $t2
		sw $t3, int
		
		lw $a0, int
		li $v0, 5
		syscall
		
		lw $t0, int	
		add $t1, $zero, 0x80
		add $t2, $zero, 8
		
	loop:
		bgt $t5, $zero, end
		sub $t5, $t5, 1
		and $t3, $t1, $t0
		beqz $t3, zero
		
	one:
		li $a0, 1
		li $v0, 5
		syscall
		j sl
		
	zero:
		li $a0, 0
		li $v0, 5
		syscall 
		
	sl:
		srl $t1, $t1, 1
		j loop
		
	end:
		li $t0, 1
				
		
	