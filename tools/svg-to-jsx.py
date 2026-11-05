#!/usr/bin/env python3
"""
svg_to_jsx.py

Convert a svg file into a react native component following this format:

    import Svg, { Path } from "react-native-svg";
    import { useTheme } from "@/hooks/useThemeStore";

    export default function XxxIcon({ size = 30, fill = "white", props = {} }) {

      return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill={fill}>
          <Path
            d="..."
            fillRule="evenodd"
            clipRule="evenodd"
          ></Path>
        </Svg>
      );
    }

Usage:
    python svg_to_jsx.py input.svg
    python svg_to_jsx.py input.svg --name AccountIcon
    python svg_to_jsx.py input.svg -o output.jsx
    python svg_to_jsx.py *.svg --out-dir ./icons
"""
import argparse
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path as FsPath

SVG_NS = "{http://www.w3.org/2000/svg}"

ATTR_MAP = {
    "fill-rule": "fillRule",
    "clip-rule": "clipRule",
    "stroke-width": "strokeWidth",
    "stroke-linecap": "strokeLinecap",
    "stroke-linejoin": "strokeLinejoin",
    "stroke-dasharray": "strokeDasharray",
    "fill-opacity": "fillOpacity",
    "stroke-opacity": "strokeOpacity",
}

IGNORED_ATTRS = {"fill", "stroke", "id", "class"}


def pascal_case(name: str) -> str:
    cleaned = re.sub(r"[^0-9a-zA-Z]+", " ", name)
    parts = cleaned.split()
    return "".join(p[:1].upper() + p[1:] for p in parts if p)


def derive_component_name(svg_path: FsPath, override: str | None) -> str:
    if override:
        name = override
    else:
        stem = svg_path.stem 
        name = pascal_case(stem)
        if not name:
            name = "MyIcon"
        if not name.lower().endswith("icon"):
            name += "Icon"
    return name


def parse_svg(svg_path: FsPath):
    tree = ET.parse(svg_path)
    root = tree.getroot()

    view_box = root.get("viewBox")
    if not view_box:
        w = root.get("width", "100").replace("px", "")
        h = root.get("height", "100").replace("px", "")
        view_box = f"0 0 {w} {h}"

    paths = []
    for elem in root.iter():
        tag = elem.tag.split("}")[-1]
        if tag == "path":
            paths.append(elem)

    return view_box, paths


def build_path_jsx(elem, keep_per_path_fill: bool, indent: str = "      ") -> str:
    attrs_out = []

    d = elem.get("d", "")
    attrs_out.append(f'd="{d}"')

    for attr_name, attr_val in elem.attrib.items():
        if attr_name == "d":
            continue
        if attr_name in IGNORED_ATTRS and not (
            keep_per_path_fill and attr_name in ("fill", "stroke")
        ):
            continue
        jsx_attr = ATTR_MAP.get(attr_name, attr_name)
        if ":" in jsx_attr:
            continue
        attrs_out.append(f'{jsx_attr}="{attr_val}"')

    attrs_str = "\n".join(f"{indent}  {a}" for a in attrs_out)
    return f"{indent}<Path\n{attrs_str}\n{indent}></Path>"


def build_jsx(component_name: str, view_box: str, paths_jsx: list[str]) -> str:
    paths_block = "\n".join(paths_jsx)
    return f'''import Svg, {{ Path }} from "react-native-svg";

export default function {component_name}({{ size = 30, fill = "white", ...props }}) {{
  return (
    <Svg width={{size}} height={{size}} viewBox="{view_box}" fill={{fill}} {{...props}}>
{paths_block}
    </Svg>
  );
}}
'''


def convert_one(svg_file: FsPath, out_dir: FsPath | None, name_override: str | None,
                 keep_per_path_fill: bool, explicit_out: FsPath | None):
    component_name = derive_component_name(svg_file, name_override)
    view_box, paths = parse_svg(svg_file)

    if not paths:
        print(f"Aucun <path> trouvé dans {svg_file}, fichier ignoré.")
        return None

    paths_jsx = [build_path_jsx(p, keep_per_path_fill) for p in paths]
    jsx_content = build_jsx(component_name, view_box, paths_jsx)

    if explicit_out:
        out_path = explicit_out
    else:
        target_dir = out_dir if out_dir else svg_file.parent
        target_dir.mkdir(parents=True, exist_ok=True)
        out_path = target_dir / f"{component_name}.jsx"

    out_path.write_text(jsx_content, encoding="utf-8")
    print(f"{svg_file.name} -> {out_path}")
    return out_path


def main():
    parser = argparse.ArgumentParser(
        description="Convertit un ou plusieurs SVG en composants JSX react-native-svg."
    )
    parser.add_argument("svg_files", nargs="+", help="Fichier(s) SVG source")
    parser.add_argument("--name", help="Nom du composant (uniquement si un seul fichier)")
    parser.add_argument("-o", "--output", help="Chemin du fichier .jsx de sortie (uniquement si un seul fichier)")
    parser.add_argument("--out-dir", help="Dossier de sortie pour les fichiers générés")
    parser.add_argument(
        "--keep-per-path-fill",
        action="store_true",
        help="Conserve les attributs fill/stroke individuels de chaque <path> au lieu de tout retirer.",
    )
    args = parser.parse_args()

    svg_files = [FsPath(f) for f in args.svg_files]
    out_dir = FsPath(args.out_dir) if args.out_dir else None
    explicit_out = FsPath(args.output) if args.output else None

    if explicit_out and len(svg_files) > 1:
        print("Erreur: --output ne peut être utilisé qu'avec un seul fichier SVG.")
        sys.exit(1)
    if args.name and len(svg_files) > 1:
        print("Erreur: --name ne peut être utilisé qu'avec un seul fichier SVG.")
        sys.exit(1)

    for svg_file in svg_files:
        if not svg_file.exists():
            print(f"Fichier introuvable: {svg_file}")
            continue
        convert_one(svg_file, out_dir, args.name, args.keep_per_path_fill, explicit_out)


if __name__ == "__main__":
    main()