#include <stdio.h>

__global__ void dpt() { printf("DPT\n"); }

int main() { dpt<<<1, 1>>>(); cudaDeviceSynchronize(); return 0; }
