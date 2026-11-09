# Contexto de datos — borrador v3

Fuente para consultas analíticas y agentes. Las métricas quedan propuestas hasta que el esquema y las reglas comerciales se implementen.

## Entidades

- **Usuario:** identidad autenticada de una persona.
- **Workspace:** frontera de propiedad, permisos, zona horaria y consumo.
- **Miembro:** relación de usuario con workspace y rol.
- **Asset:** archivo original o derivado de tipo video, audio o imagen.
- **Asset version:** proxy, miniatura u otra derivación que apunta al original inmutable.
- **Transcript / transcript word:** transcripción alineada a tiempo y sus palabras con speaker/timestamps.
- **Signal:** medida multimodal en una ventana de tiempo: voz, energía, escena, cara, OCR, evento o movimiento.
- **Highlight run:** análisis de un asset con opciones de duración, cantidad, idioma y tipo de contenido.
- **Clip:** selección de uno o más segmentos temporales fuente.
- **Timeline / EDL:** versiones de pistas y decisiones de montaje que producen una exportación.
- **Job:** trabajo reanudable para análisis, normalización o render; eventos conservan intentos y transiciones.
- **Rights declaration:** registro de base de derechos para procesar y/o publicar contenido.

## Métricas propuestas

- **Activación:** workspaces nuevos que crean su primer asset y completan un highlight run / workspaces nuevos elegibles.
- **Retención D7/D30:** workspaces de cohorte que vuelven a completar una acción de edición/export dentro de la ventana definida por producto.
- **Minutos procesados:** duración de assets con análisis completado, contando el asset una vez aunque haya reintentos.
- **Tasa de éxito:** jobs lógicos en estado terminal exitoso / jobs lógicos terminales.
- **Latencia p50/p95:** tiempo de creación a estado terminal por etapa/proveedor.
- **Costo por minuto:** costo de proveedor y cómputo / minutos de fuente procesados con éxito.
- **Consumo de créditos:** cargos confirmados menos reembolsos; mantener reservas visibles por separado.
- **Margen bruto:** créditos cobrados × valor por crédito − costo de proveedor/cómputo, restando reembolsos.
- **Feedback de clip:** proporción de pulgares positivos y tasa de publicación, segmentadas por tipo de contenido.

## Reglas de consulta

- Guardar timestamps en UTC y reportar con zona horaria del workspace.
- Agrupar reintentos por job lógico para no duplicar uso; reembolsos restan del consumo.
- Filtrar fechas/particiones temprano; CTEs descriptivos y sin `SELECT *`.
- Aislar workspaces con RLS; agente analítico usa rol de solo lectura, vistas permitidas y límites de fila/tiempo.
- Revisar joins contra conteos de referencia y comparar períodos completos.
- Las analíticas, vistas materializadas y `pnpm data:profile <tabla>` se implementan en su fase de datos.
