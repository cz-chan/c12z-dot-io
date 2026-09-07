# Colores — global.css

`src/styles/global.css` es la fuente de la verdad. Si este documento y el CSS no
coinciden, manda el CSS y lo que hay que arreglar es este archivo.

---

## Modos

Por defecto el fondo es oscuro (**burntpaper**). Para el modo claro
(**recycledpaper**) hay que añadir `data-theme="light"` al `<html>`.

```html
<html data-theme="light"></html>
```

No existe un valor `data-theme="dark"`: el oscuro es lo que ya hay en `:root`.

**Una columna vacía en las tablas significa que ese token no se redefine en
claro** — conserva el valor oscuro en los dos temas. Casi siempre es a propósito:
el color vive sobre una superficie que tampoco cambia (ver `--ink-fixed`).

---

## Fondo y superficie

Para capas, no para texto.

| Variable      | burntpaper | recycledpaper | Cuándo                       |
| ------------- | ---------- | ------------- | ---------------------------- |
| `--bg`        | `#17181b`  | `#f3efe5`     | Fondo de página              |
| `--surface-1` | `#1e2024`  | `#ffffff`     | Tarjetas, nav, modales       |
| `--surface-2` | `#232529`  | `#eeebe2`     | Hover states, capas internas |
| `--surface-3` | `#2c2f35`  | `#e6e2d8`     | Inputs, fondos muy anidados  |

El color de página lo pinta `<html>`, no `<body>` — el `body` va en
`background: none` para que las capas de textura queden por encima.

---

## Bordes

| Variable      | burntpaper | recycledpaper | Cuándo                        |
| ------------- | ---------- | ------------- | ----------------------------- |
| `--border`    | `#34373e`  | `#e6e2d8`     | Borde estándar                |
| `--border-2`  | `#43474f`  | `#d4cec0`     | Borde reforzado / separadores |
| `--border-3`  | `#696e79`  |               | Borde de más contraste        |

Dos atajos que son declaraciones `border` completas, no colores:

```css
border: var(--hairline); /* 1px solid var(--border)   */
border: var(--hairline-2); /* 1px solid var(--border-2) */
```

---

## Texto

| Variable | burntpaper | recycledpaper | Cuándo                        |
| -------- | ---------- | ------------- | ----------------------------- |
| `--fg`   | `#f3f4f6`  | `#17161a`     | Títulos, texto prominente     |
| `--fg-2` | `#c8cad0`  | `#55544f`     | Párrafos, texto body          |
| `--fg-3` | `#70747c`  | `#86847d`     | Labels, metadata, texto muted |

---

## Acento

El acento principal del sitio es **rosa**. Para elementos interactivos,
highlights y decoración clave.

| Variable                | burntpaper           | recycledpaper | Cuándo                                    |
| ----------------------- | -------------------- | ------------- | ----------------------------------------- |
| `--accent`              | `#ff6e91`            | `#e0447a`     | Bordes de acento, outlines de foco        |
| `--accent-ink`          | `#e05a7a`            | `#c2325f`     | Texto de acento (el par más oscuro)       |
| `--accent-2`            | `#ccff33`            |               | Segundo acento (lima), usar con moderación |
| `--accent-selection-bg` | `hsl(345, 84%, 71%)` |               | Fondo de `::selection`                    |
| `--accent-selection-fg` | `hsl(345, 85%, 16%)` |               | Texto de `::selection`                    |

---

## Colores por sección de contenido

Cada sección tiene su color. Para elementos contextuales: badges, bordes
laterales, iconos de sección.

| Variable           | burntpaper | recycledpaper | Sección       |
| ------------------ | ---------- | ------------- | ------------- |
| `--c-behavior`     | `#e22ef6`  | `#d62ae9`     | Behavior      |
| `--c-bias`         | `#a58faa`  | `#7a5680`     | Sesgos        |
| `--c-mental-model` | `#e66c54`  |               | Modelos mentales |
| `--c-design`       | `#96b5ec`  |               | Design laws   |
| `--c-source`       | `#88ee8b`  |               | Fuentes       |
| `--c-essay`        | `#33ffe8`  | `#016c60`     | Ensayos       |
| `--c-library`      | `#ffa424`  | `#d0a01c`     | Biblioteca    |
| `--c-project`      | `#ff3838`  | `#ac0a0a`     | Proyectos     |
| `--c-note`         | `#7f80e1`  | `#4649e0`     | Notas         |

### Los tres `-ink`

`--c-mental-model`, `--c-design` y `--c-source` **no** se redefinen en claro a
propósito: se usan como texto sobre `--ink-fixed`, que es negro en los dos temas,
y ahí el tono vivo es el correcto. Pero ese mismo tono sobre el papel claro se
queda en 1.2–2.8:1 de contraste, así que existe un gemelo para ese caso:

| Variable               | burntpaper                   | recycledpaper |
| ---------------------- | ---------------------------- | ------------- |
| `--c-design-ink`       | `var(--c-design)`            | `#2c5fbe`     |
| `--c-mental-model-ink` | `var(--c-mental-model)`      | `#b1442f`     |
| `--c-source-ink`       | `var(--c-source)`            | `#1e7422`     |

**Regla: el `-ink` para texto y trazos finos sobre el fondo de página; el base
para rellenos y para texto sobre `--ink-fixed`.** En oscuro los dos resuelven al
mismo valor, así que solo se nota en claro.

Hoy solo `--c-source-ink` está cableado. Los subrayados de design-laws y
mental-models siguen usando el base y por eso quedan flojos en modo claro.

---

## Categorías de las tarjetas de Behavior

Cada categoría son **dos** tokens: `surface` (el sólido — chip, barcode, pill) y
`band` (la franja inferior de la tarjeta). Definidos en ambos temas; en claro los
dos valores de un par son iguales.

Los reparte `getCategoryColors()` en
`src/paths/behavior/lib/category-colors.ts`, que lanza un error de build si una
categoría no tiene color. **Añadir una categoría es tocar ese archivo y este.**

| Familia       | Patrón                                                                       |
| ------------- | ---------------------------------------------------------------------------- |
| Sesgos        | `--c-bias-category-{speed,memory,judgment,context,perception}-{surface,band}` |
| Modelos       | `--c-model-category-{general,science,systems,maths,economics,war,judgment}-{surface,band}` |
| Design laws   | `--c-design-category-{layout,interaction,perception}-{surface,band}`          |

Además hay dos neutros de sesgos sin par: `--c-bias-soft` (`#c3b4c6`) y
`--c-bias-dark` (`#756679`).

---

## Categorías de contenido

Escala plana que comparten `books` y `notes`, para que un mismo tema se lea del
mismo color en las dos secciones. Definidos en ambos temas; los de claro están
oscurecidos para aguantar como texto sobre el papel.

Espejo uno a uno de `src/lib/content-categories/`: un valor añadido allí necesita
su token aquí.

| Variable                  | burntpaper | recycledpaper |
| ------------------------- | ---------- | ------------- |
| `--c-category-health`     | `#13c985`  | `#0f8f5f`     |
| `--c-category-product`    | `#5ba4f5`  | `#2f6fbe`     |
| `--c-category-culture`    | `#f0a830`  | `#a8710b`     |
| `--c-category-psychology` | `#a67ee8`  | `#6f4bb0`     |
| `--c-category-economics`  | `#4fbb6a`  | `#35864a`     |
| `--c-category-creativity` | `#ff6a3e`  | `#c4441c`     |
| `--c-category-philosophy` | `#e0709a`  | `#b04068`     |
| `--c-category-business`   | `#2fc4b2`  | `#14806f`     |

Las cinco de abajo solo las usa `notes`:

| Variable                    | burntpaper | recycledpaper |
| --------------------------- | ---------- | ------------- |
| `--c-category-random`       | `#8c96a3`  | `#6b7480`     |
| `--c-category-relationship` | `#ef6b6b`  | `#b83a3a`     |
| `--c-category-society`      | `#7c8cf0`  | `#4453c4`     |
| `--c-category-sport`        | `#e0c341`  | `#8f7409`     |
| `--c-category-programming`  | `#2ed3e8`  | `#0e8fa3`     |

La píldora de categoría (`book.module.css .bookCategory`) se pinta con un `--c`
local: la píldora y su punto se estilan una vez, y cada clase `&.<categoría>`
solo asigna `--c: var(--c-category-<nombre>)`. Sigue esa forma en vez de repetir
`background-color`/`color` por categoría.

---

## Estado y utilidad

| Variable     | Color     | Uso                       |
| ------------ | --------- | ------------------------- |
| `--ok`       | `#6a9e6a` | Éxito, confirmaciones     |
| `--warn`     | `#c8a24a` | Advertencias              |
| `--err`      | `#c86a5c` | Errores                   |
| `--c-wip`    | `#ff4d4d` | Secciones en construcción |
| `--c-goback` | `#f16f0e` | Botón de navegación atrás |

Ninguno cambia con el tema.

---

## Tinta y papel fijos

| Variable        | Color     | Cuándo                                   |
| --------------- | --------- | ---------------------------------------- |
| `--ink-fixed`   | `#16171b` | Fondo que sigue siendo oscuro en claro   |
| `--paper-fixed` | `#ffffff` | Blanco que sigue siendo blanco en oscuro |

**No se invierten con el tema, a propósito.** Son el ancla de contraste: los
chips y CTAs de las tarjetas de Behavior pintan texto de sección sobre
`--ink-fixed`, y si ese fondo cambiara habría que recalcular los nueve colores de
sección para el otro tema.
