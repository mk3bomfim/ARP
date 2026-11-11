"""
Advanced Research Projects // ARP.05 Companion Script
Modelagem Micromecânica & Tensor de Elasticidade Anisotrópico em Células Vegetais Densificadas

Resolve o tensor constitutivo de rigidez elástica ortotrópica C_ij (6x6)
em função do grau de densificação celular e orientação das microfibrilas de celulose (MFA).

Requisitos:
    pip install numpy
"""

import numpy as np

def calculate_orthotropic_stiffness(
    e_longitudinal=60.0,    # GPa (módulo longitudinal E_L)
    e_radial=5.2,           # GPa (módulo radial E_R)
    e_tangential=3.1,       # GPa (módulo tangencial E_T)
    g_lr=4.8,               # GPa (módulo de cisalhamento G_LR)
    g_lt=3.9,               # GPa (G_LT)
    g_rt=1.1,               # GPa (G_RT)
    nu_lr=0.38,             # Poisson nu_LR
    nu_lt=0.42,             # Poisson nu_LT
    nu_rt=0.48              # Poisson nu_RT
):
    """
    Monta a matriz de flexibilidade S e inverte para obter a matriz de rigidez C (6x6).
    """
    # Relações de reciprocidade: nu_ij / E_i = nu_ji / E_j
    nu_rl = nu_lr * (e_radial / e_longitudinal)
    nu_tl = nu_lt * (e_tangential / e_longitudinal)
    nu_tr = nu_rt * (e_tangential / e_radial)

    S = np.zeros((6, 6), dtype=np.float64)

    # Termos normais
    S[0, 0] = 1.0 / e_longitudinal
    S[0, 1] = -nu_rl / e_radial
    S[0, 2] = -nu_tl / e_tangential

    S[1, 0] = -nu_lr / e_longitudinal
    S[1, 1] = 1.0 / e_radial
    S[1, 2] = -nu_tr / e_tangential

    S[2, 0] = -nu_lt / e_longitudinal
    S[2, 1] = -nu_rt / e_radial
    S[2, 2] = 1.0 / e_tangential

    # Cisalhamento
    S[3, 3] = 1.0 / g_rt
    S[4, 4] = 1.0 / g_lt
    S[5, 5] = 1.0 / g_lr

    # Rigidez elástica C = S^-1
    C = np.linalg.inv(S)
    return C

def simulate_densification_effect(density_factor=2.8):
    """
    Aplica escala micromecânica de Gibson-Ashby para células com colapso de lúmen.
    """
    print(f"[ARP.05] Simulando colapso de lúmen celular com fator de densificação: {density_factor}x")
    # Aumento não-linear de propriedades axiais e transversais
    e_l = 10.2 * (density_factor ** 1.35)
    e_r = 0.85 * (density_factor ** 1.95)
    e_t = 0.45 * (density_factor ** 2.10)
    
    C_matrix = calculate_orthotropic_stiffness(
        e_longitudinal=e_l,
        e_radial=e_r,
        e_tangential=e_t
    )
    print(f"[ARP.05] Módulo E_L resultante: {e_l:.2f} GPa")
    print(f"[ARP.05] Módulo E_R transversal: {e_r:.2f} GPa")
    print(f"[ARP.05] Componente de rigidez principal C_11: {C_matrix[0, 0]:.2f} GPa")
    return C_matrix

if __name__ == "__main__":
    c_dense = simulate_densification_effect(density_factor=3.14)
    print("\nTensor C_ij (6x6) [GPa]:")
    print(np.round(c_dense, 2))
