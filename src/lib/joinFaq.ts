/**
 * Preguntas fijas de la página de invitación. Las respuestas se editan desde
 * el panel; una pregunta sin respuesta simplemente no se muestra.
 *
 * "oficial" es obligatoria por honestidad: aclara que esta página no es de
 * Yanbal. Por eso lleva una respuesta base que no depende del panel.
 */
export const JOIN_FAQ = [
  { key: "trabajo", question: "¿Tengo que dejar mi trabajo?" },
  { key: "tiempo", question: "¿Cuánto tiempo necesito?" },
  { key: "costo", question: "¿Cuánto cuesta empezar?" },
  { key: "comprar", question: "¿Tengo que comprar productos cada campaña?" },
  { key: "vender", question: "¿Necesito saber vender?" },
  { key: "oficial", question: "¿Es oficial de Yanbal?" },
] as const;

/**
 * Respuestas base, para que la sección no quede vacía. Solo hablan de lo que
 * no depende de cifras: lo que ella escriba en el panel las reemplaza.
 */
export const DEFAULT_FAQ_ANSWERS: Partial<Record<JoinFaqKey, string>> = {
  trabajo:
    "No. Muchas consultoras empiezan como un ingreso extra y deciden después cuánto crecer.",
  tiempo:
    "El que tú decidas. Lo que ganes depende de las ventas que realices, de las personas que logres unir a tu equipo y del tiempo que le dediques.",
  costo:
    "El kit de bienvenida es opcional y solo lo puedes elegir en tu primer pedido, después de incorporarte. Antes de eso, te explico todo sin compromiso.",
  vender:
    "No. Te acompaño en tus primeras ventas y te enseño a pasar tu primer pedido.",
};

export type JoinFaqKey = (typeof JOIN_FAQ)[number]["key"];
