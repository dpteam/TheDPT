#version 330 core
out vec4 fragColor;

void main() {
    vec2 uv = gl_FragCoord.xy / vec2(512.0);
    fragColor = vec4(uv.x, uv.y, 0.9, 1.0);
}
