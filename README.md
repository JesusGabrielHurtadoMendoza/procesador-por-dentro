# Procesador por Dentro

Página web en 3D para aprender cómo está hecho un procesador, cómo funciona y cómo se fabrica. Funciona en computadora y en celular, sin instalar nada.

## Qué incluye

| Modo | Qué hace |
| --- | --- |
| **Desarmar** | Separa las 9 capas del procesador y explica cada una. |
| **Armar** | Arrastras cada pieza al socket (o la tocas) en orden. Tiene cronómetro, contador de errores y récord. Al terminar se abre el **laboratorio de temperatura**. |
| **Laboratorio de temperatura** | Cambia la carga de trabajo (reposo, navegar, jugar, renderizar), el enfriamiento (aire o líquido), la cantidad de pasta térmica y el ventilador. Muestra temperatura, velocidad (GHz), RPM y consumo en vivo. |
| **Cómo funciona** | 9 pasos del ciclo buscar → decodificar → ejecutar → guardar, con datos viajando por el chip. |
| **Fabricación** | 10 pasos: arena, silicio ultrapuro, lingote, obleas, pulido, litografía, capas, pruebas, corte y empaquetado. |
| **Comparar** | Celular, laptop y escritorio a la misma escala, y un procesador de 1993 contra uno actual. Se pueden voltear para ver los pines. |
| **Sockets** | LGA (pines en la tarjeta madre) contra PGA (pines en el procesador), con animación de inserción. |

Extras: **sonidos** (botón de bocina, apagados al inicio) y **modo presentación** (pantalla completa con letra grande; ← → cambian de paso, 1–6 cambian de modo y Esc sale).

## Probarlo en tu computadora

No necesita instalar nada. Tienes dos opciones:

- Abre `index.html` con doble clic.
- O levanta un servidor local en la carpeta del proyecto:

```bash
python -m http.server 8000
# luego abre http://localhost:8000
```

Necesita internet la primera vez, porque carga Three.js y las fuentes desde CDN.

## Subirlo a GitHub y publicarlo (GitHub Pages)

1. Crea un repositorio nuevo en GitHub, por ejemplo `procesador-por-dentro`.
2. En esta carpeta ejecuta:

```bash
git init
git add .
git commit -m "Procesador por Dentro: primera versión"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/procesador-por-dentro.git
git push -u origin main
```

3. En GitHub entra a **Settings → Pages** y en **Source** elige **GitHub Actions**.
4. El flujo `.github/workflows/pages.yml` publica la página solo. En 1–2 minutos queda en:
   `https://TU_USUARIO.github.io/procesador-por-dentro/`

Cada vez que hagas `git push` a `main`, la página se actualiza sola.

**Otras opciones:** también funciona tal cual en Netlify, Vercel, Cloudflare Pages o cualquier hosting de archivos estáticos (arrastra la carpeta completa; no hay paso de compilación).

**Abrir en un modo directo:** agrega `#armar`, `#funciona`, `#fabricacion`, `#comparar` o `#sockets` al final de la dirección.

## Estructura

```
index.html                 Página principal
css/styles.css             Estilos y colores (variables en :root)
js/data.js                 TODOS los textos: piezas, pasos, fabricación, comparaciones, sockets, laboratorio
js/audio.js                Sonidos sintetizados (Web Audio, sin archivos)
js/parts.js                Piezas 3D: procesador, plano del chip, ventiladores, enfriamiento líquido
js/app.js                  Núcleo: escena, Desarmar, Armar (arrastrar, cronómetro, récords, laboratorio), Cómo funciona, presentación
js/mode-fabricacion.js     Modo Fabricación
js/mode-comparar.js        Modo Comparar
js/mode-sockets.js         Modo Sockets
.github/workflows/pages.yml  Publicación automática en GitHub Pages
```

## Cambios comunes

- **Cambiar textos:** todo está en `js/data.js`.
- **Temperaturas del laboratorio:** en `js/data.js`, sección `LAB` (watts por carga, resistencia de la pasta) y en `updateLab()` de `js/app.js` (enfriamiento). El modelo es: temperatura = ambiente + potencia × resistencia térmica. Si pasa de 95 °C, el procesador baja su velocidad (thermal throttling).
- **Colores:** variables al inicio de `css/styles.css`.
- **Modelo impreso en la tapa:** `drawIHS()` en `js/parts.js`.
- **Agregar un modo nuevo:** crea `js/mode-x.js` con `PXD.modes.x = function (ctx) { return { enter, exit, update, pick, key }; }`, agrégalo a `index.html`, a la lista de `app.js` (`['fabricacion', 'comparar', 'sockets']`) y agrega su pestaña.

## Tecnología

- [Three.js](https://threejs.org/) 0.147 + OrbitControls (desde jsDelivr).
- JavaScript normal, sin frameworks ni compilación.
- El récord del modo Armar se guarda en el navegador (`localStorage`) de cada persona.

## Notas

- El procesador “PX-9800” es un modelo de ejemplo, no de una marca real.
- Las temperaturas y los datos de comparación son aproximados y sirven para enseñar.
