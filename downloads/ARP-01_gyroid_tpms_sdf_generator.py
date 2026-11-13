"""
Advanced Research Projects // ARP.01 Companion Script
Gerador de Geometria Implícita: Gyroid TPMS & Signed Distance Field (SDF)

Equação de Superfície Mínima Triplamente Periódica (Gyroid):
    f(x, y, z) = sin(kx)*cos(ky) + sin(ky)*cos(kz) + sin(kz)*cos(kx) - t

Requisitos:
    pip install numpy
Opcional (para exportar malha 3D STL):
    pip install scikit-image
"""

import math
import numpy as np

def generate_gyroid_volume(
    resolution=64,
    cell_period=math.pi * 2,
    threshold=0.0,
    wall_thickness=0.35,
    bounds=(-math.pi, math.pi)
):
    """
    Gera um volume tridimensional (SDF) para uma parede de Gyroid TPMS.
    Retorna a matriz volumétrica booleana e a matriz contínua de distâncias.
    """
    print(f"[ARP.01] Amostrando volume em resolução {resolution}x{resolution}x{resolution}...")
    x = np.linspace(bounds[0], bounds[1], resolution)
    y = np.linspace(bounds[0], bounds[1], resolution)
    z = np.linspace(bounds[0], bounds[1], resolution)
    X, Y, Z = np.meshgrid(x, y, z, indexing='ij')

    # Frequência espacial
    k = cell_period / (bounds[1] - bounds[0])

    # Equação do Gyroid
    field = (
        np.sin(k * X) * np.cos(k * Y) +
        np.sin(k * Y) * np.cos(k * Z) +
        np.sin(k * Z) * np.cos(k * X)
    )

    # Casca espessada: |f(x,y,z) - t| <= wall_thickness
    gyroid_solid = np.abs(field - threshold) <= (wall_thickness / 2.0)
    
    porosity = 1.0 - (np.count_nonzero(gyroid_solid) / gyroid_solid.size)
    print(f"[ARP.01] Concluído. Porosidade calculada: {porosity*100:.2f}%")
    return gyroid_solid, field

def export_as_raw_voxels(volume, filepath="gyroid_mesh.raw"):
    """Exporta matriz binária para inspeção em kernels volumétricos (PicoGK, OpenVDB)."""
    with open(filepath, "wb") as f:
        f.write(volume.astype(np.uint8).tobytes())
    print(f"[ARP.01] Volume RAW gravado em: {filepath}")

if __name__ == "__main__":
    solid, sdf = generate_gyroid_volume(resolution=48, wall_thickness=0.4)
    export_as_raw_voxels(solid, "ARP-01_gyroid_volume.raw")
    print("[ARP.01] Execução com sucesso. Pronto para manufatura aditiva e simulação estrutural.")

