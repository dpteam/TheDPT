{ stdenv }:
stdenv.mkDerivation {
  pname = "dpt";
  version = "1.0";
  src = ./.;
}
