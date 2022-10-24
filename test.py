
import platform
import numpy as np
#random
import random as ran

import socket
_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
num_pixels = 100

_prev_pixels = np.tile(253, (3, num_pixels))
pixels = np.tile(1, (3, num_pixels))

udp_ip = "192.168.254.134"
udp_port = 21324

current = False
divisions = 1
num = divisions
thresh =1
n = 0
    
def _update_esp8266():
    global current, num, n, thresh
    # Pixel indices
    m = [1, 1]
    for i in range(num_pixels):
        m.append(i)
        if (i > num*num_pixels/divisions -1) & (i < (num + 1)*num_pixels/divisions):
            if current:
                m.append(255)
                m.append(0)
                m.append(0)
            else:
                m.append(0)
                m.append(120)
                m.append(255)
        else:
            m.append(0)
            m.append(0)
            m.append(0)
            
    m =  bytes(m)
    #increment num while keeping it in range
    current = not current
    n += 1
    if(n > thresh):
        n = 0
        num = (num - 1) % divisions
    _sock.sendto(m, (udp_ip, udp_port))


import time
# Turn all pixels off
print('Starting LED strand test')
m = [1, 255]
for i in range(num_pixels):
    m.append( i)
    m.append(0)
    m.append(0)
    m.append(0)
m =  bytes(m)
_sock.sendto(m, (udp_ip, udp_port))
while True:
    _update_esp8266()
    time.sleep(0.035)