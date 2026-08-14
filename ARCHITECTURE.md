# Arquitectura del proyecto `c12z.io`

Este documento es una **chuleta** para saber **dónde crear o mover cosas** dentro del proyecto.

---

## Arquitectura de carpetas y contexto

La raíz de código vive en `src/` y se organiza así:

- **`src/pages`**: Rutas públicas del sitio (incluidas robots.txt y llms.txt).
- **`src/paths`**: Lógica y componentes específicos de cada página o dominio. Cada una tendrá más o menos componentes pero se repiten:
  - `components/`: componentes específicos de esa página.
  - `seo/`: SEO específico, keywords, metadatos.
  - `rules/` o `data/`: reglas o datos que solo aplican a esa sección.
  - `styles/`: estilos específicos de esa página para usar styles.module.css.
  - `icons/`: iconos específicos de esa página.
- **`src/components`**:
  - `common/`: piezas globales estructurales que se comparten entre los componentes (header, footer, SEO).
    - `common/ui/`: piezas visuales reusables.
      - `common/ui/buttons`: botones comunes a toda la marca.
      - `common/ui/icons`: iconos comunes a toda la marca. también pueden estar divididos en secciones si tiene algo característico entre ellos como AI o Social
      - `common/ui/content`: componentes que se insertan dentro del contenido.
      - `common/ui/toc`: componente para el "table of content" (está en una carpeta porque tiene varios componentes y se vería un archivo muy complejo si estuviera en un solo archivo).
    - `common/analytics/`: componentes de analytics como Google, AHrefs o Overtracking.
    - `common/seo/`: componentes de SEO.
    - `common/navigation/`: componentes de navegación.
    - `common/layout/`: componentes superiores que se usan en todas las páginas (header, footer, etc).
    - `test/`: carpeta donde pongo los componentes que estoy testeando antes de llevarlos a su lugar final.
- **`src/content`**: Contenido del blog en `.md` / `.mdx`.
- **`src/global`**: Configuración y datos globales (site info, páginas existentes, RRSS).
- **`src/interfaces`**: Tipos/Interfaces TS reutilizables (quizá esta la lleva a cada uno de los componentes y yas)
- **`src/layouts`**: Layouts de alto nivel.
- **`src/styles`**: CSS global.
- **`src/utils`**: Funciones helpers puras.
