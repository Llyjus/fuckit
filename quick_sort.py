from time import perf_counter
import random

def counter(function, *args):
    startTime = perf_counter()
    function(*args)
    endTime = perf_counter()
    time = endTime - startTime
    return time

def createList(exponent):
    randomList = []
    for i in range(10**exponent):
        n = random.randint(1, 10000)
        randomList.append(n)
    return randomList

def quickSort(arr):

    if len(arr) <= 1:
        return arr

    midNum = arr[ len(arr) // 2 ]

    leftList = []
    rightList = []
    midList = []

    for i in arr:
        if i < midNum:
            leftList.append(i)
        elif i > midNum:
            rightList.append(i)
        else:
            midList.append(i)
    
    return quickSort(leftList) + midList + quickSort(rightList)


if __name__ == '__main__':
    for i in range(1,8):
        sortList = createList(i)
        print(counter(quickSort, sortList))
'''
9.299999874201603e-06
5.130000045028282e-05
0.0006465000005846377
0.007842099999834318
0.09342540000034205
1.0357684000000518
15.6735077000003
'''


