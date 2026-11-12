@dpt = private unnamed_addr constant [4 x i8] c"DPT\00"

declare i32 @puts(ptr)

define i32 @main() {
  %1 = call i32 @puts(ptr @dpt)
  ret i32 0
}
