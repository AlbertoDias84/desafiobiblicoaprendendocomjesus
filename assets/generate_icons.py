"""Gera os ícones PNG do PWA usando apenas a biblioteca padrão do Python."""
import math
import struct
import zlib
from pathlib import Path


def chunk(kind, data):
    body = kind + data
    return struct.pack('>I', len(data)) + body + struct.pack('>I', zlib.crc32(body) & 0xffffffff)


def render(size):
    navy, gold = (27, 42, 74), (240, 217, 132)
    cx = cy = (size - 1) / 2
    radius, ring = size * .36, size * .024
    cross_w, cross_h = size * .105, size * .56
    arm_w, arm_h = size * .42, size * .105
    rows = bytearray()
    for y in range(size):
        rows.append(0)
        for x in range(size):
            dx, dy = x - cx, y - cy
            rounded = (x < size*.20 and y < size*.20 and math.hypot(x-size*.20,y-size*.20) > size*.20) or (x > size*.80 and y < size*.20 and math.hypot(x-size*.80,y-size*.20) > size*.20) or (x < size*.20 and y > size*.80 and math.hypot(x-size*.20,y-size*.80) > size*.20) or (x > size*.80 and y > size*.80 and math.hypot(x-size*.80,y-size*.80) > size*.20)
            if rounded:
                pixel = (0, 0, 0, 0)
            elif abs(math.hypot(dx,dy)-radius) < ring:
                pixel = (*gold, 255)
            elif (abs(dx) < cross_w/2 and abs(dy) < cross_h/2) or (abs(dx) < arm_w/2 and abs(dy+size*.035) < arm_h/2):
                pixel = (*gold, 255)
            else:
                pixel = (*navy, 255)
            rows.extend(pixel)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>2I5B', size, size, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(bytes(rows), 9)) + chunk(b'IEND', b'')


for dimension in (192, 512):
    Path(__file__).with_name(f'icon-{dimension}.png').write_bytes(render(dimension))
