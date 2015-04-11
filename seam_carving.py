import cv2
import numpy as np
from pprint import pprint
import copy as cp
import heapq
import time

def getSobel(img):
    scale = 1
    delta = 0
    ddepth = cv2.CV_16S

    img = cv2.GaussianBlur(img,(3,3),0)
    gray = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)

    # Gradient-X
    grad_x = cv2.Sobel(gray,ddepth,1,0,ksize = 3, scale = scale, delta = delta,borderType = cv2.BORDER_DEFAULT)
    #grad_x = cv2.Scharr(gray,ddepth,1,0)

    # Gradient-Y
    grad_y = cv2.Sobel(gray,ddepth,0,1,ksize = 3, scale = scale, delta = delta, borderType = cv2.BORDER_DEFAULT)
    #grad_y = cv2.Scharr(gray,ddepth,0,1)

    abs_grad_x = cv2.convertScaleAbs(grad_x)   # converting back to uint8
    abs_grad_y = cv2.convertScaleAbs(grad_y)

    dst = cv2.addWeighted(abs_grad_x,0.5,abs_grad_y,0.5,0)
    #dst = cv2.add(abs_grad_x,abs_grad_y)

    return dst

def f(a,N): return np.argsort(a)[::-1][:N]

def reduceStepVert(sobel):
    mindoe = 10000000000000
    theimage = []
    # thecolorimage = []
    deletion = []
    for ind in f(sobel[:,0].tolist(),100):
        summ = 0
        deletions = [ind]
        copy = np.delete(sobel[:,0],ind)
        # copy2 = np.delete(img[:,0],ind,axis=0)
        newimg = [copy.tolist()]
        # newcolorimg = [copy2.tolist()]
        for i in range(1,sobel.shape[1]):
            nums = []
            for j in range(deletions[i-1]-1,deletions[i-1]+2):
                if j >= 0 and j<sobel.shape[0]:
                    nums.append(sobel[j,i])
                else:
                    nums.append(1000)

            ind = np.argmin(np.array(nums))
            ind = ind-1 #0->-1 , 1->0 , 2->1
            deletions.append(deletions[i-1]+ind)
            #print deletions[i]
            summ+=sobel[deletions[i],i]
            copy = np.delete(sobel[:,i],deletions[i])
            # copy2 = np.delete(img[:,i],deletions[i],axis=0)
            # cv2.rectangle(sobel2,(i,deletions[i]),(i+1,deletions[i]+1),(0,255,0),1)

            #print 'copy:',copy.shape
            newimg.append(copy.tolist())
            # newcolorimg.append(copy2.tolist())
        if summ<mindoe:
            mindoe = summ
            theimage = newimg
            # thecolorimage = newcolorimg
            deletion = deletions

    # print 'theimage',len(theimage),len(theimage[0])
    #print newimg
    return (cv2.flip(np.rot90(np.array(theimage,dtype='uint8')),0),deletion)#, cv2.flip(np.rot90(np.array(thecolorimage,dtype='uint8')),0))

def reduceStepHori(sobel):
    mindoe = 10000000000000
    theimage = []
    # thecolorimage = []
    deletion = []
    for ind in f(sobel[0,:].tolist(),100):
        summ = 0
        deletions = [ind]
        copy = np.delete(sobel[0,:],ind)
        # copy2 = np.delete(img[:,0],ind,axis=0)
        newimg = [copy.tolist()]
        # newcolorimg = [copy2.tolist()]
        for i in range(1,sobel.shape[0]):
            nums = []
            for j in range(deletions[i-1]-1,deletions[i-1]+2):
                if j >= 0 and j<sobel.shape[1]:
                    nums.append(sobel[i,j])
                else:
                    nums.append(1000)

            ind = np.argmin(np.array(nums))
            ind = ind-1 #0->-1 , 1->0 , 2->1
            deletions.append(deletions[i-1]+ind)
            #print deletions[i]
            summ+=sobel[i,deletions[i]]
            copy = np.delete(sobel[i,:],deletions[i])
            # copy2 = np.delete(img[:,i],deletions[i],axis=0)
            # cv2.rectangle(sobel2,(i,deletions[i]),(i+1,deletions[i]+1),(0,255,0),1)

            #print 'copy:',copy.shape
            newimg.append(copy.tolist())
            # newcolorimg.append(copy2.tolist())
        if summ<mindoe:
            mindoe = summ
            theimage = newimg
            # thecolorimage = newcolorimg
            deletion = deletions

    # print 'theimage',len(theimage),len(theimage[0])
    #print newimg
    return (np.array(theimage,dtype='uint8'),deletion)#, cv2.flip(np.rot90(np.array(thecolorimage,dtype='uint8')),0))



img = cv2.imread('polarbear.jpg')

sobel = getSobel(img)

print img.shape
deletionsa = None
deletions  =None
# for i in range(0,100):
#     if deletions != None:
#         for i in range(0,len(deletions)):
#             copy = np.delete(img[:,i],deletions[i],axis=0)
#             newimg.append(copy.tolist())
#         img = cv2.flip(np.rot90(np.array(newimg,dtype='uint8')),0)
#         cv2.imshow('reduce',img)

#     sobel,deletions = reduceStepVert(sobel)
#     if deletionsa == None:
#         deletionsa = deletions
#     else:
#         # print sum([a_i - b_i for a_i, b_i in zip(deletionsa, deletions)])
#         # print deletions[0]
#         deletionsa = deletions

#     #sobel2 = cv2.cvtColor(sobel2,cv2.COLOR_GRAY2BGR)
#     for i in range(0,len(deletions)):
#         color = (0,0,255)
#         cv2.rectangle(img,(i,deletions[i]),(i+1,deletions[i]+1),color,1)
#     print img.shape
#     newimg = []

for i in range(0,200):
    if deletions != None:
        for i in range(0,len(deletions)):
            copy = np.delete(img[i,:],deletions[i],axis=0)
            newimg.append(copy.tolist())
        img = np.array(newimg,dtype='uint8')

    sobel,deletions = reduceStepHori(sobel)
    #print 'sobel:',sobel.shape
    if deletionsa == None:
        deletionsa = deletions
    else:
        # print sum([a_i - b_i for a_i, b_i in zip(deletionsa, deletions)])
        # print deletions[0]
        deletionsa = deletions

    #sobel2 = cv2.cvtColor(sobel2,cv2.COLOR_GRAY2BGR)
    # for i in range(0,len(deletions)):
    #     color = (0,0,255)
    #     cv2.rectangle(img,(deletions[i],i),(deletions[i]+1,i+1),color,1)
    # print img.shape
    newimg = []
    
cv2.imshow('reduce',img)








raw_input()
cv2.destroyAllWindows()