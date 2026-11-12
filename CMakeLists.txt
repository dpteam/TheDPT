cmake_minimum_required(VERSION 3.20)
project(TheDPT VERSION 1.0.0 LANGUAGES C)

add_executable(DPT dpt/DPT.c)
set_target_properties(DPT PROPERTIES OUTPUT_NAME "DPT")
